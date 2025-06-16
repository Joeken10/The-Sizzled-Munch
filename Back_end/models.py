from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import validates
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    extras = db.Column(JSON, nullable=True)  # Use native JSON field if DB supports it, otherwise fallback to string

    def __repr__(self):
        return f"<MenuItem {self.item_name} - {self.category}>"

    def to_dict(self):
        return {
            "id": self.id,
            "item_name": self.item_name,
            "category": self.category,
            "price": self.price,
            "description": self.description,
            "image": self.image,
            "extras": self.extras or []
        }

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password = db.Column("password", db.String(128), nullable=False)  # store hashed password

    def __repr__(self):
        return f"<User {self.username}>"

    @property
    def password(self):
        raise AttributeError("Password is write-only")

    @password.setter
    def password(self, plaintext_password):
        self._password = generate_password_hash(plaintext_password)

    def check_password(self, plaintext_password):
        return check_password_hash(self._password, plaintext_password)


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)

    user = db.relationship('User', backref=db.backref('cart_items', cascade='all, delete-orphan'))
    menu_item = db.relationship('MenuItem', backref=db.backref('cart_entries', cascade='all, delete-orphan'))

    def __repr__(self):
        return f"<CartItem User:{self.user_id} Item:{self.menu_item_id} Qty:{self.quantity}>"

    @validates('quantity')
    def validate_quantity(self, key, value):
        if value < 1:
            raise ValueError("Quantity must be at least 1")
        return value