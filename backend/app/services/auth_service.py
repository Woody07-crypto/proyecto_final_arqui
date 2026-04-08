from app.extensions import bcrypt
from app.repositories.user_repository import UserRepository
from app.models.user import User, RoleEnum
from app.exceptions import AuthenticationFailed
from flask_jwt_extended import create_access_token

user_repo = UserRepository()

class AuthService:
    def register(self, data):
        if user_repo.get_by_email(data["email"]):
            raise ValueError("El email ya esta registrado")
        hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        user = User(name=data["name"], email=data["email"], password=hashed_pw, role=RoleEnum.ORGANIZADOR)
        return user_repo.save(user)

    def login(self, data):
        user = user_repo.get_by_email(data["email"])
        if not user or not bcrypt.check_password_hash(user.password, data["password"]):
            raise AuthenticationFailed("Credenciales invalidas")
        token = create_access_token(identity=str(user.id), additional_claims={"role": user.role.value})
        return token, user