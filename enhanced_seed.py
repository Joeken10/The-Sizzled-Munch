from app import app
from models import db, MenuItem, User, AdminUser
from datetime import datetime

# Menu data from original seed.py
menu_data = [ 
    {
        "id": 1,
        "image": "/images/Classic American Burger with Fried Egg.jpeg",
        "item_name": "Classic Beef Burger",
        "category": "Burgers",
        "price": 700,
        "description": "Buns, Beef Patty, Onions, Tomatoes, Cheddar cheese, Ketchup, Mayonnaise, Mustard aioli, Lettuce, Bacon, Egg.",
        "extras": ["Fries", "Onion Rings", "Extra Cheese"]
    },
    {
        "id": 2,
        "image": "/images/Double Bacon Cheeseburger – High Protein.jpeg",
        "item_name": "Classic Double Beef Burger",
        "category": "Burgers",
        "price": 800,
        "description": "Buns, Aged Beef Patty (2), Onions, Tomatoes, Cheddar cheese, Ketchup, Mayonnaise, Mustard aioli, Lettuce, Bacon, Egg.",
        "extras": ["Fries", "Extra Bacon", "Coleslaw"]
    },
    {
        "id": 3,
        "image": "/images/Burger Taste.jpeg",
        "item_name": "Chicken Burger",
        "category": "Burgers",
        "price": 750,
        "description": "Buns, Marinated Chicken Breast, Caramelized Onions, Tomatoes, Cheddar cheese, Ketchup aioli, Garlic aioli, Mustard aioli, Lettuce, Egg.",
        "extras": ["Fries", "Grilled Mushrooms", "Pickles"]
    },
    {
        "id": 4,
        "image": "/images/Fried Chicken Burger.jpeg",
        "item_name": "Double Chicken Burger",
        "category": "Burgers",
        "price": 950,
        "description": "Buns, Marinated Chicken Breast 200g, Caramelized Onions, Tomatoes, Cheddar cheese, Ketchup aioli, Garlic aioli, Coleslaw, Lettuce, Egg.",
        "extras": ["Fries", "Garlic Bread", "Avocado"]
    },
    {
        "id": 5,
        "image": "/images/pepperoni.jpeg",
        "item_name": "Pepperoni Pizza",
        "category": "Pizzas",
        "price": 1200,
        "description": "Classic tomato sauce, mozzarella cheese, spicy pepperoni slices, and oregano.",
        "extras": ["Extra Cheese", "Jalapeños", "Olives"]
    },
    {
        "id": 6,
        "image": "/images/Margherita.jpeg",
        "item_name": "Margherita Pizza",
        "category": "Pizzas",
        "price": 1000,
        "description": "Tomato base, fresh mozzarella, basil, and olive oil drizzle.",
        "extras": ["Extra Cheese", "Garlic Crust", "Cherry Tomatoes"]
    },
    {
        "id": 7,
        "image": "/images/coke.jpeg",
        "item_name": "Coke",
        "category": "Drinks",
        "price": 200,
        "description": "Chilled 350ml carbonated cola beverage.",
        "extras": ["Lemon Slice", "Ice", "Straw"]
    },
    {
        "id": 8,
        "image": "/images/mango.jpeg",
        "item_name": "Mango Smoothie",
        "category": "Drinks",
        "price": 350,
        "description": "Fresh mango puree blended with yogurt and honey.",
        "extras": ["Protein Scoop", "Chia Seeds", "Mint"]
    },
    {
        "id": 9,
        "image": "/images/Brownies.jpeg",
        "item_name": "Chocolate Brownie",
        "category": "Desserts",
        "price": 300,
        "description": "Rich and fudgy brownie with melted chocolate chips.",
        "extras": ["Vanilla Ice Cream", "Caramel Drizzle", "Whipped Cream"]
    },
    {
        "id": 10,
        "image": "/images/cheesecake.jpeg",
        "item_name": "New York Cheesecake",
        "category": "Desserts",
        "price": 400,
        "description": "Creamy cheesecake with a graham cracker crust and strawberry topping.",
        "extras": ["Blueberry Sauce", "Whipped Cream", "Mint Leaf"]
    },
    {
        "id": 11,
        "image": "/images/Vanilla-milkshake.jpeg",
        "item_name": "Vanilla Milkshake",
        "category": "Drinks",
        "price": 300,
        "description": "Creamy vanilla milkshake blended with whole milk, vanilla ice cream, and topped with whipped cream.",
        "extras": ["Straw", "Cherry", "Chocolate Drizzle"]
    },
    {
        "id": 12,
        "image": "/images/fanta.jpeg",
        "item_name": "Fanta Orange",
        "category": "Drinks",
        "price": 200,
        "description": "Chilled 350ml carbonated orange-flavored soda.",
        "extras": ["Ice", "Lemon Slice", "Straw"]
    }
]

# Test users data
test_users = [
    {
        "username": "testuser",
        "email": "test@sizzledmunch.com",
        "password": "test123",
        "delivery_address": "123 Test Street, Nairobi",
        "phone_number": "+254712345678",
        "profile_image": "https://ui-avatars.com/api/?name=Test+User&background=random&rounded=true"
    },
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "password123",
        "delivery_address": "456 Demo Avenue, Nairobi",
        "phone_number": "+254798765432",
        "profile_image": "https://ui-avatars.com/api/?name=John+Doe&background=random&rounded=true"
    },
    {
        "username": "mary_smith",
        "email": "mary@example.com",
        "password": "mary123",
        "delivery_address": "789 Sample Road, Nairobi",
        "phone_number": "+254756789012",
        "profile_image": "https://ui-avatars.com/api/?name=Mary+Smith&background=random&rounded=true"
    }
]

# Test admin users data
test_admins = [
    {
        "username": "admin",
        "email": "admin@sizzledmunch.com", 
        "password": "admin123"
    },
    {
        "username": "superuser",
        "email": "superuser@sizzledmunch.com",
        "password": "super123"
    }
]

def seed_database():
    with app.app_context():
        print("🌱 Starting database seeding...")
        
        # Create all tables
        db.create_all()
        
        # Seed Menu Items
        print("📄 Seeding menu items...")
        for item in menu_data:
            exists = MenuItem.query.filter_by(item_name=item["item_name"]).first()
            if not exists:
                db.session.add(MenuItem(
                    item_name=item["item_name"],
                    category=item["category"],
                    price=item["price"],
                    description=item["description"],
                    image_url=item["image"],
                    extras=item.get("extras", [])
                ))
        
        # Seed Test Users
        print("👥 Seeding test users...")
        for user_data in test_users:
            exists = User.query.filter(
                (User.username == user_data["username"]) | 
                (User.email == user_data["email"])
            ).first()
            if not exists:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    delivery_address=user_data["delivery_address"],
                    phone_number=user_data["phone_number"],
                    profile_image=user_data["profile_image"]
                )
                user.password = user_data["password"]  # This uses the password setter
                db.session.add(user)
        
        # Seed Test Admin Users
        print("👑 Seeding admin users...")
        for admin_data in test_admins:
            exists = AdminUser.query.filter(
                (AdminUser.username == admin_data["username"]) | 
                (AdminUser.email == admin_data["email"])
            ).first()
            if not exists:
                admin = AdminUser(
                    username=admin_data["username"],
                    email=admin_data["email"]
                )
                admin.password = admin_data["password"]  # This uses the password setter
                db.session.add(admin)
        
        # Commit all changes
        db.session.commit()
        
        # Print summary
        total_menu_items = MenuItem.query.count()
        total_users = User.query.count()
        total_admins = AdminUser.query.count()
        
        print(f"✅ Database seeding completed!")
        print(f"📊 Summary:")
        print(f"   • Menu Items: {total_menu_items}")
        print(f"   • Users: {total_users}")
        print(f"   • Admin Users: {total_admins}")
        print()
        print("🔐 Test Accounts Created:")
        print("   Regular Users:")
        for user_data in test_users:
            print(f"     • {user_data['username']} / {user_data['email']} / {user_data['password']}")
        print("   Admin Users:")
        for admin_data in test_admins:
            print(f"     • {admin_data['username']} / {admin_data['email']} / {admin_data['password']}")

if __name__ == "__main__":
    seed_database()