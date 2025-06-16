from app import app
from models import db, MenuItem

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

with app.app_context():
    # Create tables if they don't exist
    db.create_all()

    # Delete all existing records to avoid duplicates
    MenuItem.query.delete()
    db.session.commit()

    # Insert all menu items
    for item in menu_data:
        menu_item = MenuItem(
            id=item["id"],
            item_name=item["item_name"],
            category=item["category"],
            price=item["price"],
            description=item["description"],
            image=item["image"],
            extras=item["extras"]  # expects extras to be JSON type or handled in model
        )
        db.session.add(menu_item)

    db.session.commit()
    print("Seeded full menu including IDs and extras!")