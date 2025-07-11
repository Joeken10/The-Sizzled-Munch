from flask import Flask, request, jsonify, session, current_app
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
import os
import random
import string
import requests
import base64

from models import db, User, AdminUser, MenuItem, CartItem, CartSummary, Order, OrderItem, MpesaPayment
from serializer import serialize_user, serialize_admin, serialize_menu_item, serialize_cart_item


load_dotenv()

app = Flask(__name__)


db_uri = os.getenv('DATABASE_URL')
if db_uri and db_uri.startswith('postgres://'):
    db_uri = db_uri.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Critical Security Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production-immediately')

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')


mail = Mail(app)
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True)



def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='password-reset-salt')

def verify_reset_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        return serializer.loads(token, salt='password-reset-salt', max_age=expiration)
    except Exception:
        return None

def send_reset_email(recipient_email, reset_link):
    msg = Message(
        subject='Reset Your Password - The Sizzled Munch',
        sender=app.config['MAIL_USERNAME'],
        recipients=[recipient_email]
    )
    msg.body = f"""Hello,

We received a password reset request for your Sizzled Munch account.

Please click the link below to reset your password:
{reset_link}

If you didn't request this, you can ignore this email.

Thanks,
The Sizzled Munch Team
"""
    mail.send(msg)

def generate_verification_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def send_verification_email(email, ip_address):
    verification_code = generate_verification_code()
    msg = Message(
        subject="Verify Your Sizzled Munch Email",
        sender=app.config['MAIL_USERNAME'],
        recipients=[email]
    )
    msg.html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #0077ff;">Verify Your Email Address</h2>
        <p>To continue using your Sizzled Munch account, please verify your email address.</p>
        <p><strong>Enter this verification code:</strong></p>
        <div style="font-size: 24px; font-weight: bold; background-color: #f2f2f2; padding: 10px; border-radius: 5px; display: inline-block;">
            {verification_code}
        </div>
        <p>The request for this verification originated from IP: <strong>{ip_address}</strong></p>
        <hr>
        <p>If this wasn’t you, we recommend:</p>
        <ul>
            <li>Resetting your Sizzled Munch password immediately.</li>
            <li>Checking your account for unauthorized changes.</li>
            <li>Contacting Sizzled Munch support if you can't access your account.</li>
        </ul>
        <p style="color: #999;">Sizzled Munch, 00100, Nairobi, Kaunda Street.</p>
    </div>
    """
    mail.send(msg)
    return verification_code

CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY')
CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET')
SHORTCODE = str(os.getenv('MPESA_SHORTCODE'))
PASSKEY = os.getenv('MPESA_PASSKEY')
CALLBACK_URL = os.getenv('MPESA_CALLBACK_URL', 'https://the-sizzled-munch.onrender.com/mpesa/callback')

def get_mpesa_access_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    try:
        res = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
        res.raise_for_status()
        return res.json().get('access_token')
    except Exception as e:
        print("Failed to Get MPesa Access Token:", str(e))
        return None

@app.route('/pay_mpesa', methods=['POST'])
def pay_mpesa():
    data = request.get_json()
    phone = data.get('phone_number')
    amount = data.get('amount')

    if not phone or not amount:
        return jsonify({'error': 'Phone number and amount required'}), 400

    access_token = get_mpesa_access_token()
    if not access_token:
        return jsonify({'error': 'Failed to retrieve MPesa access token'}), 500

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode(f"{SHORTCODE}{PASSKEY}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "SizzledMunch",
        "TransactionDesc": "Payment for Order"
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    try:
        res = requests.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers=headers
        )

        if res.status_code == 404:
            return jsonify({'error': 'MPesa API endpoint not found (404)', 'details': res.text}), 404

        res.raise_for_status()
        response_data = res.json()

        payment = MpesaPayment(
            phone_number=phone,
            amount=amount,
            transaction_id=response_data.get('CheckoutRequestID'),
            status='Pending',
            response_data=response_data
        )
        db.session.add(payment)
        db.session.commit()

       
        if app.debug or os.getenv("FLASK_ENV") == "development":
            fake_callback = {
                "Body": {
                    "stkCallback": {
                        "MerchantRequestID": "abc123",
                        "CheckoutRequestID": response_data.get('CheckoutRequestID'),
                        "ResultCode": 0,
                        "ResultDesc": "The service request is processed successfully."
                    }
                }
            }
            try:
                requests.post('http://localhost:8000/mpesa/callback', json=fake_callback)
            except Exception as e:
                print("Failed to simulate callback:", str(e))

        return jsonify({
            "message": "MPesa STK Push initiated",
            "payment_id": payment.id,
            "transaction_id": payment.transaction_id,
            "response": response_data
        }), 200

    except requests.RequestException as e:
        error_message = None
        if e.response is not None:
            try:
                error_message = e.response.json()
            except Exception:
                error_message = e.response.text
        else:
            error_message = str(e)
        return jsonify({'error': 'MPesa STK Push failed', 'details': error_message}), 502


@app.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    print("Received MPesa Callback:", data)

    try:
        callback = data['Body']['stkCallback']
        checkout_id = callback['CheckoutRequestID']
        result_code = callback['ResultCode']
        result_desc = callback['ResultDesc']

        payment = MpesaPayment.query.filter_by(transaction_id=checkout_id).first()
        if payment:
            payment.status = 'Success' if result_code == 0 else 'Failed'
            payment.response_data = data
            db.session.commit()
            return jsonify({'message': 'Payment updated'}), 200
        else:
            return jsonify({'error': 'Payment not found'}), 404

    except Exception as e:
        print("Callback error:", str(e))
        return jsonify({'error': 'Invalid callback format'}), 400

@app.route('/mpesa/payment_status_by_txn/<transaction_id>', methods=['GET'])
def get_payment_status_by_txn(transaction_id):
    payment = MpesaPayment.query.filter_by(transaction_id=transaction_id.strip()).first()
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404

    return jsonify({
        'payment_id': payment.id,
        'phone_number': payment.phone_number,
        'amount': str(payment.amount),
        'status': payment.status,
        'created_at': payment.created_at.isoformat(),
        'transaction_id': payment.transaction_id
    }), 200




@app.route('/')
def home():
    return "Hello from Sizzled Munch!"


def is_admin(admin_id):
    """Check if admin_id belongs to a valid AdminUser."""
    return AdminUser.query.get(admin_id) is not None


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(
        username=username,
        email=email,
        verification_code_sent_at=datetime.utcnow()
    )
    user.password = password
    db.session.add(user)
    db.session.commit()

    # Generate and send verification code via email, then store the returned code
    verification_code = send_verification_email(email, request.remote_addr or '127.0.0.1')
    user.verification_code = verification_code
    db.session.commit()

    return jsonify({'message': 'User registered. Verification email sent.'}), 201


@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    admin = AdminUser.query.filter(
        (AdminUser.username == username) | (AdminUser.email == username)
    ).first()
    if admin and admin.check_password(password):
        session['user_id'] = admin.id
        session['is_admin'] = True
        admin.is_online = True  
        admin.last_login_at = datetime.utcnow()  
        db.session.commit()
        return jsonify(serialize_admin(admin))

    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        session['is_admin'] = False
        user.is_online = True
        user.last_login_at = datetime.utcnow()
        db.session.commit()
        return jsonify(serialize_user(user))

    return jsonify({"error": "Invalid username/email or password"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    user_id = session.get('user_id')

    
    if not user_id:
        session.clear()
        return jsonify({"message": "Logged out successfully"}), 200

    if session.get('is_admin'):
        admin = db.session.get(AdminUser, user_id)
        if admin:
            admin.is_online = False
            db.session.commit()
    else:
        user = db.session.get(User, user_id)
        if user:
            user.is_online = False
            user.force_logout = False 
            db.session.commit()

    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200





@app.route('/users/check', methods=['GET'])
def check_user_exists():
    username = request.args.get('username')
    email = request.args.get('email')

    query = User.query
    if username and email:
        exists = query.filter((User.username == username) | (User.email == email)).first()
    elif username:
        exists = query.filter_by(username=username).first()
    elif email:
        exists = query.filter_by(email=email).first()
    else:
        return jsonify({"error": "Username or email is required"}), 400

    return jsonify({"exists": bool(exists)}), 200

@app.route('/admin/users', methods=['GET'])
def admin_get_users():
    admin_id = request.args.get('admin_id', type=int)
    if not admin_id or not is_admin(admin_id):
        return jsonify({"error": "Unauthorized - Admin only"}), 403

    users = User.query.all()
    return jsonify([serialize_user(user) for user in users]), 200



@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.get(User, user_id)  
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(serialize_user(user)), 200



@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if username:
        user.username = username
    if email:
        user.email = email
    if password:
        user.set_password(password)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username or email already exists"}), 409

    return jsonify(serialize_user(user)), 200


@app.route('/user/<int:user_id>/self_delete', methods=['DELETE', 'OPTIONS'])
def user_self_delete(user_id):
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight OK"}), 200

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    password = data.get('password')
    if not password or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Incorrect password"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Account deleted successfully"}), 200


@app.route('/admin/users/<int:user_id>', methods=['PATCH', 'OPTIONS'])
def admin_update_user(user_id):
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight OK"}), 200

    data = request.get_json()
    admin_id = data.get('admin_id')
    if not admin_id or not is_admin(admin_id):
        return jsonify({"error": "Unauthorized - Admin only"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update fields
    if 'username' in data and data['username']:
        user.username = data['username']
    if 'profile_image' in data and data['profile_image']:
        user.profile_image = data['profile_image']
    if 'password' in data and data['password']:
        from werkzeug.security import generate_password_hash
        user.password_hash = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200




@app.route('/admin/users/<int:user_id>/promote', methods=['PATCH'])
def admin_promote_user(user_id):
    data = request.get_json()
    admin_id = data.get('admin_id')

    if not admin_id or not is_admin(admin_id):
        return jsonify({"error": "Unauthorized - Admin only"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.is_admin:
        return jsonify({"message": f"User '{user.username}' is already an admin"}), 200

    user.is_admin = True
    user.force_logout = True  
    db.session.commit()

    return jsonify({"message": f"User '{user.username}' promoted to admin"}), 200


@app.route('/admin/users/<int:user_id>/demote', methods=['PATCH'])
def admin_demote_user(user_id):
    data = request.get_json()
    admin_id = data.get('admin_id')

    if not admin_id or not is_admin(admin_id):
        return jsonify({"error": "Unauthorized - Admin only"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.is_admin:
        return jsonify({"message": f"User '{user.username}' is not an admin"}), 200

    user.is_admin = False
    user.force_logout = True
    db.session.commit()

    return jsonify({"message": f"User '{user.username}' demoted from admin"}), 200



@app.route('/users/<int:user_id>/check-admin', methods=['GET'])
def check_admin(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    
    return jsonify({
        'is_admin': user.is_admin,
        'force_logout': user.force_logout  
    }), 200




@app.route('/admin/signup', methods=['POST', 'OPTIONS'])
def admin_signup():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight OK"}), 200

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "All fields (username, email, password) are required"}), 400

    if AdminUser.query.filter_by(username=username).first() or AdminUser.query.filter_by(email=email).first():
        return jsonify({"error": "Admin username or email already exists"}), 409

    admin = AdminUser(username=username, email=email)
    admin.set_password(password)
    db.session.add(admin)
    db.session.commit()

    return jsonify(serialize_admin(admin)), 201


@app.route('/admin/signin', methods=['POST', 'OPTIONS'])
def admin_signin():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight OK"}), 200

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    identifier = data.get('username')
    password = data.get('password')

    if not identifier or not password:
        return jsonify({"error": "Username/email and password are required"}), 400

    admin = AdminUser.query.filter(
        (AdminUser.username == identifier) | (AdminUser.email == identifier)
    ).first()

    if admin and admin.check_password(password):
        session['admin_id'] = admin.id  
        return jsonify(serialize_admin(admin)), 200

    return jsonify({"error": "Invalid admin credentials"}), 401


@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_id', None)
    return jsonify({"message": "Admin logged out successfully"}), 200



@app.route('/menu_items', methods=['POST'])
def create_menu_item():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    admin_id = data.get('admin_id')
    if not admin_id or not is_admin(admin_id):
        return jsonify({"error": "Unauthorized - Admin only"}), 403

    item_name = data.get('item_name')
    category = data.get('category')
    description = data.get('description', '')
    price = data.get('price')
    image_url = data.get('image_url', '')
    extras = data.get('extras', [])

    if not item_name or not price or not category:
        return jsonify({"error": "item_name, price, and category are required"}), 400

    item = MenuItem(
        item_name=item_name,
        description=description,
        price=price,
        image_url=image_url,
        category=category,
        extras=extras
    )
    db.session.add(item)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Menu item already exists"}), 409

    return jsonify(serialize_menu_item(item)), 201


@app.route('/menu_items/<int:item_id>', methods=['PUT'])
def update_menu_item(item_id):
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    admin_id = data.get('admin_id')
    if not admin_id or not is_admin(admin_id):
        return jsonify({"error": "Unauthorized - Admin only"}), 403

    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Menu item not found"}), 404

    item.item_name = data.get('item_name', item.item_name)
    item.category = data.get('category', item.category)
    item.description = data.get('description', item.description)
    item.price = data.get('price', item.price)
    item.image_url = data.get('image_url', item.image_url)
    item.extras = data.get('extras', item.extras)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Update conflict"}), 409

    return jsonify(serialize_menu_item(item)), 200


@app.route('/menu_items/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    admin_id = data.get('admin_id')
    if not admin_id or not is_admin(admin_id):
        return jsonify({"error": "Unauthorized - Admin only"}), 403

    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Menu item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": f"Menu item '{item.item_name}' deleted"}), 200


@app.route('/menu_items', methods=['GET'])
def get_menu_items():
    items = MenuItem.query.all()
    return jsonify([serialize_menu_item(item) for item in items]), 200


@app.route('/menu_items/<int:item_id>', methods=['GET'])
def get_menu_item(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Menu item not found"}), 404
    return jsonify(serialize_menu_item(item)), 200


@app.route('/cart_items', methods=['GET'])
def get_cart_items():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400

    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    result = []
    for item in cart_items:
        menu_item = MenuItem.query.get(item.menu_item_id)
        result.append({
            'id': item.id,
            'user_id': item.user_id,
            'menu_item_id': item.menu_item_id,
            'quantity': item.quantity,
            'item_name': menu_item.item_name,
            'price': menu_item.price,
            'image_url': menu_item.image_url,
            'description': menu_item.description
        })

    return jsonify(result)


@app.route('/cart_items/<int:item_id>', methods=['GET'])
def get_cart_item(item_id):
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Cart item not found"}), 404
    return jsonify(serialize_cart_item(item)), 200


@app.route('/cart_items', methods=['POST'])
def create_or_update_cart_item():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    user_id = data.get('user_id')
    menu_item_id = data.get('menu_item_id')
    quantity = data.get('quantity', 1)

    if not user_id or not menu_item_id:
        return jsonify({"error": "user_id and menu_item_id are required"}), 400

    
    existing_item = CartItem.query.filter_by(user_id=user_id, menu_item_id=menu_item_id).first()

    if existing_item:
        
        existing_item.quantity += quantity
        db.session.commit()
        return jsonify(serialize_cart_item(existing_item)), 200
    else:
        
        new_item = CartItem(user_id=user_id, menu_item_id=menu_item_id, quantity=quantity)
        db.session.add(new_item)
        db.session.commit()
        return jsonify(serialize_cart_item(new_item)), 201


@app.route('/cart_items/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Cart item not found"}), 404

    data = request.get_json()
    item.quantity = data.get('quantity', item.quantity)

    db.session.commit()
    return jsonify(serialize_cart_item(item)), 200


@app.route('/cart_items/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Cart item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Cart item deleted"}), 200


@app.route('/cart_summary/<int:user_id>', methods=['GET'])
def get_cart_summaries(user_id):
    summaries = CartSummary.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": s.id,
            "subtotal": s.subtotal,
            "vat": s.vat,
            "ctl": s.ctl,
            "total": s.total
        } for s in summaries
    ]), 200


@app.route('/cart_summaries', methods=['POST'])
def create_cart_summary():
    data = request.get_json()
    user_id = data.get('user_id')
    subtotal = data.get('subtotal')
    vat = data.get('vat')
    ctl = data.get('ctl')
    total = data.get('total')

    if not all([user_id, subtotal, vat, ctl, total]):
        return jsonify({"error": "Missing fields"}), 400

    summary = CartSummary(
        user_id=user_id,
        subtotal=subtotal,
        vat=vat,
        ctl=ctl,
        total=total
    )
    db.session.add(summary)
    db.session.commit()

    return jsonify({"message": "Cart summary saved"}), 201


@app.route('/clear_cart/<int:user_id>', methods=['DELETE'])
def clear_cart(user_id):
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    for item in cart_items:
        db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Cart cleared."}), 200
def fetch_user_orders(user_id):
    orders = (
        Order.query
        .filter_by(user_id=user_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    active_orders = []
    history_orders = []

    for order in orders:
        order_data = {
            'id': order.id,
            'total_amount': float(order.total_amount),
            'created_at': order.created_at.isoformat() if order.created_at else None,
            'status': order.status,
            'user_confirmed': order.user_confirmed,
            'admin_confirmed': order.admin_confirmed,
            'items': []
        }

        for item in order.items:
            menu_item = db.session.get(MenuItem, item.menu_item_id)
            order_data['items'].append({
                'item_name': menu_item.item_name if menu_item else 'Unknown Item',
                'quantity': item.quantity,
                'price': float(item.price)
            })

     
        if order.user_confirmed:
            history_orders.append(order_data)
        else:
            active_orders.append(order_data)

    return jsonify({
        'active_orders': active_orders,
        'history_orders': history_orders
    }), 200





def send_order_confirmation_email(user_email, order, order_items):
    """Send order confirmation email with order details and tracking link."""

    
    item_rows = ""
    for item in order_items:
        menu_item = MenuItem.query.get(item.menu_item_id)
        item_name = menu_item.item_name if menu_item else "Unknown Item"
        item_total = float(item.price * item.quantity)
        item_rows += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    <strong>{item_name}</strong> x {item.quantity}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: #4CAF50;">
                    Ksh {item_total:,.2f}
                </td>
            </tr>
        """

   
    base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    track_link = f"{base_url}/track-order/{order.id}"

    
    msg = Message(
        subject="🍔 Your Delicious Order Confirmation - The Sizzled Munch",
        sender=app.config['MAIL_USERNAME'],
        recipients=[user_email],
    )

   
    msg.html = f"""
    <div style="background-color:#f4f4f4; padding: 30px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; background: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #d63447; padding: 20px; color: #ffffff; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🍔 The Sizzled Munch</h1>
                <p style="margin: 5px 0 0; font-size: 16px;">Order Confirmation</p>
            </div>
            <div style="padding: 20px;">
                <p>Hi there,</p>
                <p>We’re thrilled to let you know that we’ve received your order! Here’s a summary:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    {item_rows}
                </table>
                <p style="margin-top: 20px; font-size: 16px;">
                    <strong>Total Amount:</strong>
                    <span style="color: #ff5722;">Ksh {float(order.total_amount):,.2f}</span>
                </p>
                <p style="margin-top: 20px;">You'll receive updates as we prepare your meal 🍽️.</p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="{track_link}" style="display: inline-block; padding: 12px 20px; background-color: #d63447; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Track Your Order
                    </a>
                </div>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                The Sizzled Munch, Nairobi, Kenya<br>
                Need help? <a href="mailto:support@thesizzledmunch.com" style="color: #999;">Contact Support</a>
            </div>
        </div>
    </div>
    """

    
    plain_items = ""
    for item in order_items:
        menu_item = MenuItem.query.get(item.menu_item_id)
        item_name = menu_item.item_name if menu_item else "Unknown Item"
        item_total = float(item.price * item.quantity)
        plain_items += f"{item_name} x {item.quantity} - Ksh {item_total:,.2f}\n"

    msg.body = (
        "Thank you for your order from The Sizzled Munch!\n\n"
        "Order Summary:\n"
        f"{plain_items}\n"
        f"Total Amount: Ksh {float(order.total_amount):,.2f}\n\n"
        f"Track your order here: {track_link}\n"
    )

    # Send email
    mail.send(msg)



@app.route('/users/<int:user_id>/orders', methods=['GET'])
def get_user_orders(user_id):
    # Use eager loading to avoid N+1 queries - fetch orders with related items and menu items in one query
    orders = (Order.query
              .filter_by(user_id=user_id)
              .options(db.joinedload(Order.items).joinedload(OrderItem.menu_item))
              .order_by(Order.created_at.desc())
              .all())
    
    active_orders = []
    history_orders = []
    
    for order in orders:
        # Build order items list efficiently since menu items are already loaded
        order_items = []
        for item in order.items:
            order_items.append({
                'item_name': item.menu_item.item_name if item.menu_item else "Unknown Item",
                'quantity': item.quantity,
                'price': float(item.price)
            })

        order_data = {
            'id': order.id,
            'total_amount': float(order.total_amount),
            'status': order.status,
            'created_at': order.created_at.isoformat() if order.created_at else None,
            'items': order_items
        }

        if order.status == 'Completed':
            history_orders.append(order_data)
        else:
            active_orders.append(order_data)

    return jsonify({
        'active_orders': active_orders,
        'history_orders': history_orders
    }), 200



@app.route('/admin/users/<int:user_id>/orders', methods=['GET'])
def admin_view_user_orders(user_id):
    return fetch_user_orders(user_id)



@app.route('/orders', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        items = data.get('items', [])

        if not user_id or not items:
            return jsonify({'error': 'User ID and items are required.'}), 400

        valid_menu_item_ids = {item.id for item in MenuItem.query.all()}
        invalid_items = [item for item in items if item['menu_item_id'] not in valid_menu_item_ids]
        if invalid_items:
            return jsonify({
                "error": "Some menu items in your order do not exist.",
                "invalid_items": invalid_items
            }), 400

        total = sum(item['quantity'] * float(item['price']) for item in items)

        order = Order(user_id=user_id, total_amount=total)
        db.session.add(order)
        db.session.flush()

        order_items = []
        for item in items:
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item['menu_item_id'],
                quantity=item['quantity'],
                price=float(item['price'])
            )
            db.session.add(order_item)
            order_items.append(order_item)

        db.session.commit()

        user = User.query.get(user_id)
        if user:
            send_order_confirmation_email(user.email, order, order_items)

        return jsonify({"message": "Order placed successfully", "order_id": order.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Order creation failed: {str(e)}")
        return jsonify({'error': 'Failed to place order.'}), 500




@app.route('/orders/<int:user_id>/confirm/<int:order_id>', methods=['PATCH'])
def confirm_order_received(user_id, order_id):
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if not order.user_confirmed:
        order.user_confirmed = True
        db.session.commit()

    return jsonify({'message': 'Order confirmed and moved to history'}), 200



@app.route('/admin/orders', methods=['GET'])
def get_all_orders_admin():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    active_orders = []
    history_orders = []

    for order in orders:
        order_data = {
            'id': order.id,
            'total_amount': float(order.total_amount),
            'created_at': order.created_at.isoformat(),
            'status': order.status,
            'user': {
                'id': order.user.id,
                'username': order.user.username
            },
            'items': []
        }

        for item in order.items:
            menu_item = MenuItem.query.get(item.menu_item_id)
            order_data['items'].append({
                'item_name': menu_item.item_name if menu_item else 'Unknown Item',
                'quantity': item.quantity,
                'price': float(item.price)
            })

        
        if order.user_confirmed and order.admin_confirmed:
            history_orders.append(order_data)
        else:
            active_orders.append(order_data)

    return jsonify({
        'active_orders': active_orders,
        'history_orders': history_orders
    }), 200



@app.route('/admin/orders/<int:order_id>/status', methods=['PATCH'])
def advance_order_status(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    status_flow = ['Pending', 'Preparing', 'Ready', 'Completed']

    if order.status not in status_flow:
        return jsonify({'error': 'Invalid current status'}), 400

    current_index = status_flow.index(order.status)
    if current_index < len(status_flow) - 1:
        order.status = status_flow[current_index + 1]
        db.session.commit()
        return jsonify({'message': 'Order status updated', 'new_status': order.status}), 200
    else:
        return jsonify({'error': 'Order is already at final stage'}), 400



@app.route('/admin/orders/<int:order_id>/confirm', methods=['PATCH'])
def admin_confirm_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if not order.user_confirmed:
        return jsonify({'error': 'User has not confirmed receipt yet'}), 400

    if not order.admin_confirmed:
        order.admin_confirmed = True
        db.session.commit()

    return jsonify({'message': 'Order marked as fully completed by admin'}), 200






@app.route('/admin/analytics', methods=['GET'])
def admin_analytics():
    total_sales = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0
    total_orders = db.session.query(Order).count()
    most_popular_items = (
        db.session.query(
            MenuItem.item_name,
            db.func.sum(OrderItem.quantity).label('total_sold')
        )
        .join(OrderItem)
        .group_by(MenuItem.item_name)
        .order_by(db.desc('total_sold'))
        .limit(5)
        .all()
    )

    return jsonify({
        'total_sales': float(total_sales),
        'total_orders': total_orders,
        'most_popular_items': [
            {'item': name, 'sold': int(sold)} for name, sold in most_popular_items
        ]
    })


@app.route('/user/<int:user_id>/profile', methods=['GET', 'PATCH', 'DELETE'])
def user_profile(user_id):
    user = User.query.get_or_404(user_id)

    if request.method == 'GET':
        return jsonify({
            "username": user.username,
            "email": user.email,
            "delivery_address": user.delivery_address,
            "phone_number": user.phone_number,
            "profile_image": user.profile_image  
        })

    if request.method == 'PATCH':
        data = request.json
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.delivery_address = data.get('delivery_address', user.delivery_address)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.profile_image = data.get('profile_image', user.profile_image)  
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"})

    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Profile deleted successfully"})


@app.route('/reset_password', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email', '').strip().lower()  # ✅ Normalize email here

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

   

    token = generate_reset_token(email)
    reset_link = f"http://localhost:3000/reset_password/{token}"

    try:
        msg = Message(
            subject='Sizzled Munch Password Reset',
            sender=app.config['MAIL_USERNAME'],
            recipients=[email],
            body=(
                f"Hello {user.username},\n\n"
                f"You requested to reset your password.\n\n"
                f"Click the link below to reset it:\n\n{reset_link}\n\n"
                f"If you didn't request this, please ignore this email.\n\n"
                f"- Sizzled Munch Team"
            )
        )
        mail.send(msg)
    except Exception as e:
        app.logger.error(f"Password reset email failed: {e}")
        return jsonify({'message': 'Failed to send reset email.'}), 500

    return jsonify({'message': 'Password reset email sent successfully!'}), 200



@app.route('/reset_password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('password')

    if not new_password:
        return jsonify({'message': 'Password is required'}), 400

    email = verify_reset_token(token)
    if not email:
        return jsonify({'message': 'Invalid or expired token'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({'message': 'Password has been reset successfully'}), 200


@app.route('/send_verification_code', methods=['POST'])
def send_verification():
    data = request.get_json()
    email = data.get('email')
    ip_address = request.remote_addr

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    code = send_verification_email(email, ip_address)
    user.verification_code = code  
    db.session.commit()

    return jsonify({'message': 'Verification code sent successfully'}), 200



@app.route('/verify_email_code', methods=['POST'])
def verify_email_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.verification_code != code:
        return jsonify({'message': 'Invalid verification code'}), 400

    
    user.verification_code = None
    db.session.commit()

    return jsonify({'message': 'Email verified successfully!'}), 200



@app.route('/verify_email', methods=['POST'])
def verify_email():
    data = request.get_json()
    email = data.get('email')
    code = data.get('verification_code')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.verification_code != code:
        return jsonify({'error': 'Invalid verification code'}), 400

    
    expiry_minutes = 5
    if user.verification_code_sent_at and datetime.utcnow() - user.verification_code_sent_at > timedelta(minutes=expiry_minutes):
        return jsonify({'error': 'Verification code expired'}), 400

    user.verification_code = None
    user.verification_code_sent_at = None
    db.session.commit()

    return jsonify({'message': 'Email verified successfully'}), 200

@app.route('/resend_verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    
    new_code = send_verification_email(email, request.remote_addr)
    user.verification_code = new_code
    user.verification_code_sent_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'A new verification code has been sent to your email. Please check your inbox and spam folder.'}), 200






if __name__ == '__main__':
    app.run(port=8000, debug=True)
