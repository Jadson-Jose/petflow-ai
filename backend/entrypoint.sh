#!/bin/sh
set -e

sh scripts/wait_for_db.sh

if [ -n "$CELERY_BROKER_URL" ]; then
  echo "Aguardando Redis..."
  until python -c "
import socket, sys, os
from urllib.parse import urlparse
url = urlparse(os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0'))
try:
    s = socket.create_connection((url.hostname or 'redis', url.port or 6379), timeout=2)
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    sleep 1
  done
  echo "Redis pronto!"
fi

echo "Aplicando migrações..."
uv run python manage.py migrate --noinput

echo "Coletando arquivos estáticos..."
uv run python manage.py collectstatic --noinput || true

echo "Iniciando aplicação..."
exec "$@"
