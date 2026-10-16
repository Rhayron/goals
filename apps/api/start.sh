#!/bin/sh
set -eu

# O volume da Railway chega como root. Ajuste apenas a pasta de montagem e
# execute a API como node; no Compose, o processo já começa como node.
if [ "$(id -u)" = 0 ]; then
  chown node:node /data/uploads
  exec su-exec node node dist/server.js
fi

exec node dist/server.js
