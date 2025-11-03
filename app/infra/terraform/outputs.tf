# Lambda Function
# DynamoDB Outputs
output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = module.dynamodb_table.table_name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = module.dynamodb_table.table_arn
}

# Lambda Outputs
output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = module.lambda_iot_handler.lambda_function_arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = module.lambda_iot_handler.lambda_function_name
}

output "lambda_function_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = module.lambda_iot_handler.lambda_function_invoke_arn
}

output "lambda_cloudwatch_log_group" {
  description = "CloudWatch Log Group name for Lambda"
  value       = module.lambda_iot_handler.lambda_cloudwatch_log_group_name
}

# IoT Rule
output "iot_rule_arn" {
  description = "ARN of the IoT rule"
  value       = module.iot_rule.rule_arn
}

output "iot_rule_name" {
  description = "Name of the IoT rule"
  value       = module.iot_rule.rule_name
}

# ===========================================
# Cognito Outputs
# ===========================================

output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = module.cognito.user_pool_arn
}

output "cognito_user_pool_endpoint" {
  description = "Endpoint of the Cognito User Pool"
  value       = module.cognito.user_pool_endpoint
}

output "cognito_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = module.cognito.user_pool_client_id
}

output "cognito_user_pool_domain" {
  description = "Domain of the Cognito User Pool (if created)"
  value       = module.cognito.user_pool_domain
}

# ===========================================
# Amplify Outputs
# ===========================================

output "amplify_app_id" {
  description = "ID of the Amplify app"
  value       = var.enable_amplify ? module.amplify[0].app_id : null
}

output "amplify_default_domain" {
  description = "Default domain of the Amplify app"
  value       = var.enable_amplify ? module.amplify[0].default_domain : null
}

output "amplify_app_url" {
  description = "URL of the deployed Amplify app"
  value       = var.enable_amplify ? module.amplify[0].branch_url : null
}

output "amplify_app_name" {
  description = "Name of the Amplify app"
  value       = var.enable_amplify ? module.amplify[0].app_name : null
}
