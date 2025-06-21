from flask import Flask, jsonify, request, session
from sqlalchemy import or_
from models import db, MenuItem, User
from serializer import menu_item_to_dict, user_to_dict
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)

# ----------- CONFIG -----------
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///sizzled.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "supersecretkey"  # Replace in production
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

db.init_app(app)

# ----------- HELPERS -----------

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return db.session.get(User, user_id)

# ----------- HOME -----------

@app.route("/")
def home():
    return "Hello from Sizzled Munch!"

# ----------- MENU -----------

@app.route("/menu", methods=["GET"])
def get_menu():
    items = MenuItem.query.all()
    return jsonify([menu_item_to_dict(item) for item in items]), 200

# ----------- AUTH -----------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Missing JSON data"}), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "All fields (username, email, password) are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User with that username or email already exists"}), 409

    user = User(username=username, email=email)
    user.password = password  # Setter hashes it

    try:
        db.session.add(user)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to create user"}), 500

    session["user_id"] = user.id
    return jsonify(user_to_dict(user)), 201

@app.route("/signin", methods=["POST"])
def signin():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Missing JSON data"}), 400

    identifier = data.get("username", "").strip()
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Username/email and password are required"}), 400

    user = User.query.filter(
        or_(User.username == identifier, User.email == identifier)
    ).first()

    if user and user.check_password(password):
        session["user_id"] = user.id
        return jsonify(user_to_dict(user)), 200

    return jsonify({"error": "Invalid username/email or password"}), 401

@app.route("/users/check", methods=["GET"])
def check_user():
    username = request.args.get("username")
    email = request.args.get("email")

    if not username and not email:
        return jsonify({"error": "Provide username or email"}), 400

    query = User.query
    if username:
        query = query.filter_by(username=username)
    if email:
        query = query.filter_by(email=email)

    user = query.first()
    exists = user is not None
    return jsonify({"exists": exists}), 200

@app.route("/signout", methods=["POST"])
def signout():
    session.pop("user_id", None)
    return jsonify({"message": "Signed out successfully"}), 200

# ----------- MENU CRUD -----------

@app.route("/menu_items", methods=["GET"])
def get_menu_items():
    items = MenuItem.query.all()
    return jsonify([menu_item_to_dict(item) for item in items]), 200

@app.route("/menu_items/<int:id>", methods=["GET"])
def get_menu_item(id):
    item = db.session.get(MenuItem, id)
    if not item:
        return jsonify({"error": "Menu item not found"}), 404
    return jsonify(menu_item_to_dict(item)), 200

@app.route("/menu_items", methods=["POST"])
def create_menu_item():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    required_fields = ["item_name", "category", "price"]
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        price = float(data["price"])
    except (ValueError, TypeError):
        return jsonify({"error": "Price must be a number"}), 400

    new_item = MenuItem(
        item_name=data["item_name"],
        category=data["category"],
        price=price,
        description=data.get("description"),
        image=data.get("image"),
        extras=data.get("extras"),
    )

    try:
        db.session.add(new_item)
        db.session.commit()
        return jsonify(menu_item_to_dict(new_item)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create menu item: {str(e)}"}), 500

@app.route("/menu_items/<int:id>", methods=["PATCH"])
def update_menu_item(id):
    item = db.session.get(MenuItem, id)
    if not item:
        return jsonify({"error": "Menu item not found"}), 404

    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    if "price" in data:
        try:
            data["price"] = float(data["price"])
        except (ValueError, TypeError):
            return jsonify({"error": "Price must be a number"}), 400

    item.item_name = data.get("item_name", item.item_name)
    item.category = data.get("category", item.category)
    item.price = data.get("price", item.price)
    item.description = data.get("description", item.description)
    item.image = data.get("image", item.image)
    item.extras = data.get("extras", item.extras)

    try:
        db.session.commit()
        return jsonify(menu_item_to_dict(item)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update menu item: {str(e)}"}), 500

@app.route("/menu_items/<int:id>", methods=["DELETE"])
def delete_menu_item(id):
    item = db.session.get(MenuItem, id)
    if not item:
        return jsonify({"error": "Menu item not found"}), 404

    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Menu item deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete menu item: {str(e)}"}), 500

# ----------- RUN SERVER -----------

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=8000)
