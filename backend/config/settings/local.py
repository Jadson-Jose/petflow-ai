"""Configurações para desenvolvimento local."""
import os

from .base import *  # noqa

DEBUG = True
SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-key-change-in-production")
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True
