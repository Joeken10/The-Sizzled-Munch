from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import event
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    delivery_address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    profile_image = db.Column(db.String(500))

    is_admin = db.Column(db.Boolean, default=False)
    is_online = db.Column(db.Boolean, default=False)
    last_login_at = db.Column(db.DateTime)
    force_logout = db.Column(db.Boolean, default=False)

    verification_code = db.Column(db.String(6), index=True)
    verification_code_sent_at = db.Column(db.DateTime)
    is_password_reset_pending = db.Column(db.Boolean, default=False)

    cart_items = db.relationship('CartItem', backref='user', cascade='all, delete-orphan', lazy=True)
    cart_summaries = db.relationship('CartSummary', backref='user', cascade='all, delete-orphan', lazy=True)
    orders = db.relationship('Order', backref='user', cascade='all, delete-orphan', lazy=True)

    @property
    def password(self):
        """Prevent reading of password."""
        raise AttributeError("Password is not readable.")

    @password.setter
    def password(self, password):
        """Hashes and sets the password."""
        self.password_hash = generate_password_hash(password)  # ✅ Default hashing method (pbkdf2:sha256)

    def check_password(self, password):
        """Verify password against hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"


class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    @property
    def password(self):
        """Prevent reading of password."""
        raise AttributeError("Password is not readable.")

    @password.setter
    def password(self, password):
        """Hashes and sets the password."""
        self.password_hash = generate_password_hash(password)  # ✅ Default hashing method

    def check_password(self, password):
        """Verify password against hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<AdminUser {self.username}>"


class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    extras = db.Column(db.JSON, default=[])

    cart_items = db.relationship('CartItem', backref='menu_item', cascade='all, delete-orphan', lazy=True)
    order_items = db.relationship('OrderItem', backref='menu_item', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"<MenuItem {self.item_name}>"


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    def __repr__(self):
        return f"<CartItem User {self.user_id}, Item {self.menu_item_id}>"


class CartSummary(db.Model):
    __tablename__ = 'cart_summaries'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    vat = db.Column(db.Numeric(10, 2), nullable=False)
    ctl = db.Column(db.Numeric(10, 2), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)

    def __repr__(self):
        return f"<CartSummary User {self.user_id}>"


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='Pending')
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_confirmed = db.Column(db.Boolean, default=False)
    admin_confirmed = db.Column(db.Boolean, default=False)

    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"<Order {self.id} - User {self.user_id}>"


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    def __repr__(self):
        return f"<OrderItem Order {self.order_id}, Item {self.menu_item_id}>"


class MpesaPayment(db.Model):
    __tablename__ = 'mpesa_payments'

    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_id = db.Column(db.String(100))
    status = db.Column(db.String(50), nullable=False, default='Pending')
    response_data = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))

    def __repr__(self):
        return f"<MpesaPayment {self.phone_number} - {self.amount}>"


def normalize_fields(mapper, connection, target):
    """Normalize email & username to lowercase & strip spaces before insert/update."""
    if target.email:
        target.email = target.email.strip().lower()
    if hasattr(target, 'username') and target.username:
        target.username = target.username.strip().lower()


for model in [User, AdminUser]:
    event.listen(model, 'before_insert', normalize_fields)
    event.listen(model, 'before_update', normalize_fields)
