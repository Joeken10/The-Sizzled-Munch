#!/usr/bin/env python3
"""
Production fix script for Sizzled Munch signin authentication issues.

This script fixes the 401 errors by:
1. Adding missing columns to AdminUser table (is_online, last_login_at)
2. Creating test user accounts for immediate testing
3. Verifying the fixes work correctly

Run this script on your production environment (Render shell).
"""

from app import app
from models import db, User, AdminUser
from sqlalchemy import text
from werkzeug.security import generate_password_hash
import sys

def add_missing_columns():
    """Add missing columns to AdminUser table"""
    print("🔧 Adding missing columns to admin_users table...")
    
    try:
        # Check if columns exist first
        result = db.session.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'admin_users'
        """))
        existing_columns = [row[0] for row in result]
        
        migrations_needed = []
        
        if 'is_online' not in existing_columns:
            migrations_needed.append("ALTER TABLE admin_users ADD COLUMN is_online BOOLEAN DEFAULT FALSE")
        
        if 'last_login_at' not in existing_columns:
            migrations_needed.append("ALTER TABLE admin_users ADD COLUMN last_login_at TIMESTAMP")
        
        if not migrations_needed:
            print("✅ All required columns already exist")
            return True
        
        for migration in migrations_needed:
            print(f"   Executing: {migration}")
            db.session.execute(text(migration))
        
        db.session.commit()
        print(f"✅ Successfully added {len(migrations_needed)} missing columns")
        return True
        
    except Exception as e:
        print(f"❌ Column migration failed: {e}")
        db.session.rollback()
        return False

def create_test_accounts():
    """Create test user accounts for immediate testing"""
    print("👥 Creating test accounts...")
    
    accounts_created = 0
    
    try:
        # Create test admin user
        admin_exists = AdminUser.query.filter_by(username='admin').first()
        if not admin_exists:
            admin = AdminUser(
                username='admin',
                email='admin@sizzledmunch.com'
            )
            admin.password_hash = generate_password_hash('admin123')
            db.session.add(admin)
            accounts_created += 1
            print("   ✅ Test admin user created")
        else:
            print("   ℹ️  Admin user already exists")
        
        # Create test regular user
        user_exists = User.query.filter_by(username='testuser').first()
        if not user_exists:
            user = User(
                username='testuser',
                email='test@sizzledmunch.com',
                delivery_address='123 Test Street, Nairobi',
                phone_number='+254712345678',
                profile_image='https://ui-avatars.com/api/?name=Test+User&background=random&rounded=true'
            )
            user.password_hash = generate_password_hash('test123')
            db.session.add(user)
            accounts_created += 1
            print("   ✅ Test user created")
        else:
            print("   ℹ️  Test user already exists")
        
        # Create second admin for redundancy
        superuser_exists = AdminUser.query.filter_by(username='superuser').first()
        if not superuser_exists:
            superuser = AdminUser(
                username='superuser',
                email='superuser@sizzledmunch.com'
            )
            superuser.password_hash = generate_password_hash('super123')
            db.session.add(superuser)
            accounts_created += 1
            print("   ✅ Super admin user created")
        else:
            print("   ℹ️  Super admin user already exists")
        
        db.session.commit()
        print(f"✅ Account creation completed ({accounts_created} new accounts)")
        return True
        
    except Exception as e:
        print(f"❌ Account creation failed: {e}")
        db.session.rollback()
        return False

def test_signin_functionality():
    """Test that signin works with the created accounts"""
    print("🧪 Testing signin functionality...")
    
    try:
        # Test admin signin
        test_admin = AdminUser.query.filter_by(username='admin').first()
        if test_admin and test_admin.check_password('admin123'):
            print("   ✅ Admin signin test passed")
        else:
            print("   ❌ Admin signin test failed")
            return False
        
        # Test regular user signin
        test_user = User.query.filter_by(username='testuser').first()
        if test_user and test_user.check_password('test123'):
            print("   ✅ User signin test passed")
        else:
            print("   ❌ User signin test failed")
            return False
        
        print("✅ All signin tests passed")
        return True
        
    except Exception as e:
        print(f"❌ Signin tests failed: {e}")
        return False

def print_summary():
    """Print summary of available test accounts"""
    print("\n" + "="*60)
    print("🎉 SIGNIN FIXES APPLIED SUCCESSFULLY!")
    print("="*60)
    print("\n🔐 Test Accounts Available:")
    print("\n👑 Admin Users:")
    print("   • admin / admin@sizzledmunch.com / admin123")
    print("   • superuser / superuser@sizzledmunch.com / super123")
    print("\n👥 Regular Users:")
    print("   • testuser / test@sizzledmunch.com / test123")
    print("\n🌐 Your app URL: https://the-sizzled-munch.onrender.com")
    print("\n📋 Next Steps:")
    print("   1. Test signin with the accounts above")
    print("   2. Change default passwords for security")
    print("   3. Create your real admin account")
    print("   4. Remove test accounts when no longer needed")
    print("\n⚠️  Security Note: Change default passwords immediately!")

def main():
    """Main function to apply all fixes"""
    print("🚀 Starting Sizzled Munch production fixes...")
    print("="*60)
    
    with app.app_context():
        # Step 1: Ensure tables exist
        print("📋 Ensuring database tables exist...")
        try:
            db.create_all()
            print("✅ Database tables verified/created")
        except Exception as e:
            print(f"❌ Database table creation failed: {e}")
            return False
        
        # Step 2: Add missing columns
        if not add_missing_columns():
            print("❌ Column migration failed. Aborting.")
            return False
        
        # Step 3: Create test accounts
        if not create_test_accounts():
            print("❌ Account creation failed. Aborting.")
            return False
        
        # Step 4: Test functionality
        if not test_signin_functionality():
            print("❌ Signin tests failed.")
            return False
        
        # Step 5: Print summary
        print_summary()
        return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Fix process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)