def menu_item_to_dict(menu_item):
    return {
        "id": menu_item.id,
        "item_name": menu_item.item_name,
        "category": menu_item.category,
        "price": menu_item.price,
        "description": menu_item.description,
        "image": menu_item.image,
        "extras": menu_item.extras or []
    }

def user_to_dict(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
        # Usually you don’t want to serialize passwords
    }

def cart_item_to_dict(cart_item):
    return {
        "id": cart_item.id,
        "menu_item": menu_item_to_dict(cart_item.menu_item),
        "quantity": cart_item.quantity
    }
