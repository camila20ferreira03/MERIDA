# ===========================================
# DynamoDB Module - Creates SmartGrowData Table
# ===========================================
module "dynamodb_table" {
  source = "./modules/dynamodb"

  table_name                    = var.dynamodb_table_name
  billing_mode                  = var.dynamodb_billing_mode
  gsi_name                      = var.dynamodb_gsi_name
  enable_point_in_time_recovery = var.dynamodb_enable_pitr
  ttl_attribute                 = var.dynamodb_ttl_attribute

  tags = var.tags
}
