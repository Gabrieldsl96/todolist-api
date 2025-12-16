#!/bin/sh
set -e

echo "🔄 Aplicando migrations do Prisma..."
npx prisma migrate deploy

echo "🎨 Gerando cliente Prisma..."
npx prisma generate

echo "🚀 Iniciando servidor..."
exec "$@"