terraform {
  backend "s3" {
    bucket         = "merida-terraform-state-037689899742"
    key            = "merida/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "merida-terraform-lock"
  }
}
