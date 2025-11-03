variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
  default     = "MyMainVPC"
}

variable "vpc_cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "prv_subnet_a_cidr" {
  description = "CIDR block for Private subnet A"
  type        = string
}

variable "pub_subnet_a_cidr" {
  description = "CIDR block for Public subnet A"
  type        = string
}

variable "prv_subnet_b_cidr" {
  description = "CIDR block for Private subnet B"
  type        = string
}

variable "pub_subnet_b_cidr" {
  description = "CIDR block for Public subnet B"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

