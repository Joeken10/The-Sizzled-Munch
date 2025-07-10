from app import app, db
from models import User

with app.app_context():
    users = User.query.all()
    fixed_count = 0
    for user in users:
        if user.password_hash and not user.password_hash.startswith('pbkdf2:sha256:'):
            plain_password = user.password_hash
            user.password = plain_password  # will hash it
            db.session.add(user)
            fixed_count += 1
    db.session.commit()
    print(f"Fixed {fixed_count} users with plaintext passwords.")
