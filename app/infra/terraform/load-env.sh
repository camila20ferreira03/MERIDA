#!/bin/bash
# Cargar infrastructure/.env y exportar variables para Terraform
set -euo pipefail

ENV_FILE="$(dirname "$0")/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo ".env no encontrado en $(dirname "$0")" >&2
  exit 1
fi

# Exportar todo lo definido en .env
set -a
. "$ENV_FILE"
set +a

# Mapear a TF_VAR_ para Terraform
[ -n "${AWS_REGION:-}" ] && export AWS_REGION && export TF_VAR_aws_region="$AWS_REGION"
[ -n "${LAB_ROLE_ARN:-}" ] && export TF_VAR_lab_role_arn="$LAB_ROLE_ARN"
[ -n "${ECS_CONTAINER_IMAGE:-}" ] && export TF_VAR_ecs_container_image="$ECS_CONTAINER_IMAGE"

echo "Cargado $ENV_FILE"
env | grep -E '^(AWS_REGION|TF_VAR_)' || true


