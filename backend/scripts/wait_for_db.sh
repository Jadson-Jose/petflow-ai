#!/bin/sh
# Aguarda o banco de dados ficar pronto para aceitar conexões
set -e

HOST="${POSTGRES_HOST:-db}"
PORT="${POSTGRES_PORT:-5432}"

echo "Aguardando banco em ${HOST}:${PORT}..."

until python -c "
import socket, sys
try:
    s = socket.create_connection(('${HOST}', ${PORT}), timeout=2)
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
  sleep 1
done

echo "Banco pronto!"
