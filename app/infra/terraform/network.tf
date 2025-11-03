# ===========================================
# VPC Module - Network Infrastructure
# ===========================================
module "vpc" {
  source = "./modules/vpc"

  aws_region        = var.aws_region
  vpc_name          = var.vpc_name
  vpc_cidr_block    = var.vpc_cidr_block
  prv_subnet_a_cidr = var.prv_subnet_a_cidr
  pub_subnet_a_cidr = var.pub_subnet_a_cidr
  prv_subnet_b_cidr = var.prv_subnet_b_cidr
  pub_subnet_b_cidr = var.pub_subnet_b_cidr

  tags = var.tags
}

