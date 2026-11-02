#!/usr/bin/env bash
set -euo pipefail

: "${AWS_PROFILE:=poliscroll}"
: "${AWS_REGION:=us-east-2}"
: "${COGNITO_USER_POOL_ID:?Define COGNITO_USER_POOL_ID antes de ejecutar este script.}"
: "${ADMIN_EMAIL:?Define ADMIN_EMAIL antes de ejecutar este script.}"

read -r -s -p "Contraseña permanente para ${ADMIN_EMAIL}: " ADMIN_PASSWORD
printf '\n'
if [[ ${#ADMIN_PASSWORD} -lt 8 ]]; then
  echo "La contraseña debe tener al menos 8 caracteres." >&2
  exit 1
fi

aws cognito-idp admin-create-user \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --user-attributes Name=email,Value="$ADMIN_EMAIL" Name=email_verified,Value=true \
  --message-action SUPPRESS >/dev/null 2>&1 || true

aws cognito-idp admin-set-user-password \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD" \
  --permanent

aws cognito-idp admin-add-user-to-group \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --group-name admin

echo "Administrador provisionado y agregado al grupo admin."
