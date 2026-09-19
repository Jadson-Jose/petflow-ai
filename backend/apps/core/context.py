"""Contexto thread-local para armazenar o tenant atual da requisição."""
from contextvars import ContextVar

_current_tenant = ContextVar("current_tenant", default=None)


def set_current_tenant(tenant):
    _current_tenant.set(tenant)


def get_current_tenant():
    return _current_tenant.get()


def clear_current_tenant():
    _current_tenant.set(None)
