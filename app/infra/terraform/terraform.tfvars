# AWS Configuration
# aws_region se puede sobrescribir con TF_VAR_aws_region o AWS_REGION
aws_region = "us-east-1"

# Lambda Configuration
lambda_function_name = "Lambda-IoT-Handler"
lambda_timeout       = 30
lambda_memory_size   = 256
lambda_log_retention_days = 7

# ====================================
# ZIP Deployment - Terraform empaqueta automáticamente
# ====================================
lambda_handler     = "app.lambda_handler"
lambda_runtime     = "python3.13"
lambda_source_path = "../../../lambdas/lambda_iot_handler"

# AWS Academy LabRole ARN
# Get this from AWS Console: IAM > Roles > LabRole > Copy ARN
# Valor se sobrescribe desde .env (TF_VAR_lab_role_arn)
lab_role_arn = "arn:aws:iam::000000000000:role/LabRole"  # Valor genérico - usar .env

# DynamoDB Configuration
dynamodb_table_name    = "SmartGrowData"
dynamodb_billing_mode  = "PAY_PER_REQUEST"  # On-demand pricing
dynamodb_gsi_name      = "GSI"
dynamodb_enable_pitr   = true  # Point-in-Time Recovery
dynamodb_ttl_attribute = ""    # Leave empty to disable TTL

# Lambda Environment Variables (optional)
lambda_environment_variables = {
  LOG_LEVEL = "INFO"
}

# IoT Rule Configuration
iot_rule_name        = "iot_to_lambda_rule"
iot_rule_description = "IoT Rule to forward system/plot/+ messages to Lambda"
iot_rule_sql         = "SELECT * FROM 'system/plot/+'"

# VPC Network Configuration
vpc_name            = "MyMainVPC"
vpc_cidr_block      = "10.0.0.0/16"
prv_subnet_a_cidr   = "10.0.1.0/24"
pub_subnet_a_cidr   = "10.0.2.0/24"
prv_subnet_b_cidr   = "10.0.3.0/24"
pub_subnet_b_cidr   = "10.0.4.0/24"

# ECS Configuration (Fargate Only)
ecs_cluster_name              = "merida-cluster"
ecs_enable_container_insights = false
ecs_task_family               = "merida-task"
ecs_container_name            = "merida-container"
# Valor se sobrescribe desde .env (TF_VAR_ecs_container_image)
ecs_container_image           = "000000000000.dkr.ecr.us-east-1.amazonaws.com/merida-backend:latest"
ecs_container_cpu             = 256
ecs_container_memory          = 512
ecs_container_port            = 80
ecs_container_environment = [
  { name = "AWS_REGION", value = "us-east-1" },
  { name = "DYNAMODB_TABLE", value = "SmartGrowData" },
  { name = "LOG_GROUP", value = "/ecs/merida-backend" },
]
ecs_service_name                      = "merida-service"
ecs_desired_count                     = 1
ecs_create_alb                        = true
ecs_alb_name                          = "merida-alb"
ecs_alb_idle_timeout                  = 60
ecs_alb_enable_deletion_protection    = false
ecs_execution_role_arn                = ""  # Usa lab_role_arn por defecto
ecs_task_role_arn                     = ""  # Usa lab_role_arn por defecto
ecs_health_check_enabled              = true
ecs_health_check_interval             = 30
ecs_health_check_path                 = "/"
ecs_health_check_timeout              = 5
ecs_health_check_healthy_threshold    = 2
ecs_health_check_unhealthy_threshold  = 2
ecs_health_check_matcher              = "200-399"
ecs_log_retention_days                = 7

# ECR Configuration
ecr_repository_name        = "merida-backend"
ecr_image_tag_mutability   = "MUTABLE"
ecr_scan_on_push           = true
ecr_encryption_type        = "AES256"
ecr_image_count            = 10
ecr_untagged_image_days    = 7

# Tags
tags = {
  Environment = "dev"
  Project     = "Merida"
  ManagedBy   = "Terraform"
}

