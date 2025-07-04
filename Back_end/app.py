from flask import Flask, request, jsonify, session
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from models import db, User, AdminUser, MenuItem, CartItem, CartSummary
from serializer import serialize_user, serialize_admin, serialize_menu_item, serialize_cart_item

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://thesizzledmunch:munches@localhost:5432/sizzledmunch_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecretkey'

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

db.init_app(app)
migrate = Migrate(app, db)


@app.route('/')
def home():
    return "Hello from Sizzled Munch!"


def is_admin(admin_id):
    """Check if admin_id belongs to a valid AdminUser."""
    return AdminUser.query.get(admin_id) is not None


@app.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight OK"}), 200

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password', '')

    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"error": "Username or email already exists"}), 409

    user = User(username=username, email=email)
    if password:
        user.set_password(password)

    db.session.add(user)
    db.session.commit()

    if AdminUser.query.count() == 0:
        admin = AdminUser(username=username, email=email)
        if password:
            admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        print("First user registered as Admin!")

    return jsonify(serialize_user(user)), 201


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


if __name__ == '__main__':
    app.run(port=8000, debug=True)
