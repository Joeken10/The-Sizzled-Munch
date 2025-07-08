def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isAdmin": user.is_admin,
        "delivery_address": user.delivery_address,
        "phone_number": user.phone_number,
        "profile_image": user.profile_image,  
        "is_online": user.is_online,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "force_logout": user.force_logout  
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
        "price": float(item.price),
        "description": item.description,
        "image": item.image_url,
        "extras": item.extras or []
    }


def serialize_cart_item(cart_item):
    menu_item = cart_item.menu_item
    return {
        "id": cart_item.id,
        "user_id": cart_item.user_id,
        "menu_item_id": cart_item.menu_item_id,
        "quantity": cart_item.quantity,
        "item_name": getattr(menu_item, 'item_name', None),
        "price": float(getattr(menu_item, 'price', 0)),
        "image_url": getattr(menu_item, 'image_url', None)
    }


def serialize_mpesa_payment(payment):
    return {
        "id": payment.id,
        "phone_number": payment.phone_number,
        "amount": float(payment.amount),
        "transaction_id": payment.transaction_id,
        "status": payment.status,
        "created_at": payment.created_at.isoformat(),
        "response_data": payment.response_data
    }
