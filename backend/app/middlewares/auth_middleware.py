from functools import wraps

from flask import g, jsonify
from flask_jwt_extended.exceptions import JWTExtendedException
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.repositories.user_repository import UserRepository
from app.models.user import RoleEnum

user_repo = UserRepository()


def _json_error(message, status_code):
	return jsonify({"message": message}), status_code


def get_current_user():
	return getattr(g, "current_user", None)


def token_required(fn):
	@wraps(fn)
	def wrapper(*args, **kwargs):
		try:
			verify_jwt_in_request()
			user_id = get_jwt_identity()
			user = user_repo.get_by_id(user_id)

			if not user:
				return _json_error("Usuario no encontrado", 404)

			g.current_user = user
			return fn(*args, **kwargs)
		except JWTExtendedException:
			return _json_error("Token invalido o ausente", 401)

	return wrapper


def admin_required(fn):
	@wraps(fn)
	@token_required
	def wrapper(*args, **kwargs):
		claims = get_jwt()
		role = claims.get("role")
		if role != RoleEnum.ADMIN.value:
			return _json_error("Acceso denegado. Solo administrador", 403)
		return fn(*args, **kwargs)

	return wrapper

