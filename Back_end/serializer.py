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
        # Password is not included for security reasons
    }
