def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isAdmin": False  
    }

def serialize_admin(admin):
    return {
        "id": admin.id,
        "username": admin.username,
        "email": admin.email,
        "isAdmin": True  
    }

def serialize_menu_item(item):
    return {
        "id": item.id,
        "item_name": item.item_name,
        "category": item.category,
        "price": item.price,
        "description": item.description,
        "image": item.image_url,
        "extras": item.extras or []  
    }

def serialize_cart_item(cart_item):
    return {
        "id": cart_item.id,
        "user_id": cart_item.user_id,
        "menu_item_id": cart_item.menu_item_id, 
        "quantity": cart_item.quantity,
        "item_name": cart_item.menu_item.item_name,
        "price": cart_item.menu_item.price,      
        "image": cart_item.menu_item.image_url
    }
