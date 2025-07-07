from flask import Flask, request, jsonify, session, current_app
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from models import db, User, AdminUser, MenuItem, CartItem, CartSummary, Order, OrderItem, MpesaPayment  # ✅ Added MpesaPayment
from serializer import serialize_user, serialize_admin, serialize_menu_item, serialize_cart_item
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from datetime import datetime
import random
import string
import requests
import base64
import os
from dotenv import load_dotenv

# ✅ Load .env in development
load_dotenv()

app = Flask(__name__)

# ✅ Configurations from Environment
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# ✅ Email Configs
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

# ✅ CORS (Allow All Origins for Now — you can tighten this later)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# ✅ DB & Migrations
db.init_app(app)
migrate = Migrate(app, db)

# ✅ Password Reset Utilities
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

# ✅ MPesa STK Push Route (Sandbox)
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

        # ✅ Save Payment to DB
        payment = MpesaPayment(
            phone_number=phone,
            amount=amount,
            transaction_id=response_data.get('CheckoutRequestID'),
            status='Pending',
            response_data=response_data
        )
        db.session.add(payment)
        db.session.commit()

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
        return jsonify({'error': 'MPesa STK Push failed', 'details': error_message}), 502  # Bad Gateway (external API failure)
    
@app.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    stk_callback = data.get("Body", {}).get("stkCallback", {})
    
    merchant_request_id = stk_callback.get("MerchantRequestID")
    checkout_request_id = stk_callback.get("CheckoutRequestID")
    result_code = stk_callback.get("ResultCode")
    result_desc = stk_callback.get("ResultDesc")
    callback_metadata = stk_callback.get("CallbackMetadata", {})

    payment = MpesaPayment.query.filter_by(transaction_id=checkout_request_id).first()

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    if result_code == 0:
        payment.status = "Success"
    else:
        payment.status = "Failed"

    payment.response_data = stk_callback
    db.session.commit()

    return jsonify({"message": "Payment status updated"}), 200



@app.route('/mpesa/payment_status/<int:payment_id>', methods=['GET'])
def get_payment_status(payment_id):
    payment = MpesaPayment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404

    return jsonify({
        'payment_id': payment.id,
        'phone_number': payment.phone_number,
        'amount': str(payment.amount),
        'status': payment.status,
        'created_at': payment.created_at,
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

    # ✅ Generate Verification Code
    verification_code = generate_verification_code()

    user = User(
        username=username,
        email=email,
        verification_code=verification_code,
        verification_code_sent_at=datetime.utcnow()
    )
    user.password = password
    db.session.add(user)
    db.session.commit()

    # ✅ Send Verification Email
    msg = Message(
        subject="Verify Your Sizzled Munch Email",
        sender=app.config['MAIL_USERNAME'],
        recipients=[email]
    )
    msg.body = f"""Verify Your Email Address

To continue using your Sizzled Munch account, please verify your email address.

Enter this verification code:
{verification_code}

The request for this verification originated from IP: 127.0.0.1

If this wasn’t you, we recommend:

    Resetting your Sizzled Munch password immediately.
    Checking your account for unauthorized changes.
    Contacting Sizzled Munch support if you can't access your account.

Sizzled Munch, 00100, Nairobi, Kaunda Street.
"""
    mail.send(msg)

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
        return jsonify(serialize_admin(admin))

    
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        session['is_admin'] = False
        return jsonify(serialize_user(user))

    return jsonify({"error": "Invalid username/email or password"}), 401

    


@app.route('/logout', methods=['POST'])
def logout():
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


@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([serialize_user(user) for user in users]), 200


@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
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


@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User '{user.username}' deleted"}), 200


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



@app.route('/users/<int:user_id>/orders', methods=['GET'])
def get_user_orders(user_id):
    return fetch_user_orders(user_id)



@app.route('/admin/users/<int:user_id>/orders', methods=['GET'])
def admin_view_user_orders(user_id):
    return fetch_user_orders(user_id)



@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
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

    for item in items:
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=item['menu_item_id'],
            quantity=item['quantity'],
            price=float(item['price'])
        )
        db.session.add(order_item)

    db.session.commit()
    return jsonify({"message": "Order placed successfully", "order_id": order.id}), 201



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
            "profile_image": user.profile_image  # ✅ Include image in response
        })

    if request.method == 'PATCH':
        data = request.json
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.delivery_address = data.get('delivery_address', user.delivery_address)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.profile_image = data.get('profile_image', user.profile_image)  # ✅ Save image
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"})

    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Profile deleted successfully"})

#more items#
@app.route('/reset_password', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    token = generate_reset_token(email)
    reset_link = f"http://localhost:3000/reset_password/{token}"

    # ✅ Send Email Here
    try:
        msg = Message(
            subject='Sizzled Munch Password Reset',
            sender=app.config['MAIL_USERNAME'],
            recipients=[email],
            body=f'Click this link to reset your password:\n\n{reset_link}\n\nIf you did not request this, ignore this email.'
        )
        mail.send(msg)
    except Exception as e:
        print(f"Email sending failed: {e}")
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
    user.verification_code = code  # Add this to your User model
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

    # Optionally: Clear code or set verified flag
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

    
    user.verification_code = None
    user.verification_code_sent_at = None
    db.session.commit()

    return jsonify({'message': 'Email verified successfully'}), 200



if __name__ == '__main__':
    app.run(port=8000, debug=True)
