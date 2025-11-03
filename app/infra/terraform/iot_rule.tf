# ===========================================
# IoT Module - Creates IoT Topic Rule
# ===========================================
module "iot_rule" {
  source = "./modules/iot"

  rule_name            = var.iot_rule_name
  rule_description     = var.iot_rule_description
  sql                  = var.iot_rule_sql
  lambda_function_arn  = module.lambda_iot_handler.lambda_function_arn
  lambda_function_name = module.lambda_iot_handler.lambda_function_name

  tags = var.tags
}

