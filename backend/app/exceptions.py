"""Excepciones de dominio mapeadas a códigos HTTP en error_handler."""


class ResourceNotFound(Exception):
	"""Recurso inexistente (ID no registrado, etc.) → HTTP 404."""

	pass


class AuthenticationFailed(Exception):
	"""Login con credenciales inválidas → HTTP 401."""

	pass
