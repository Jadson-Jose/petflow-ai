#!/bin/sh
# Inicializa o worker do Celery após esperar banco e redis
set -e

sh scripts/wait_for_db.sh

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

echo "Iniciando Celery worker..."
exec uv run celery -A config worker -l info
