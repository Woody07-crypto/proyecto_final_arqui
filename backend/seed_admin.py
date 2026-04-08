from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User, RoleEnum

app = create_app()

with app.app_context():
    existing_admin = User.query.filter_by(email="admin@admin.com").first()

    if existing_admin:
        print("Admin ya existe")
    else:
        hashed_password = bcrypt.generate_password_hash("Admin123456").decode("utf-8")

        admin = User(
            name="Administrador",
            email="admin@admin.com",
            password=hashed_password,
            role=RoleEnum.ADMIN
        )

        db.session.add(admin)
        db.session.commit()

        print("Admin creado correctamente")