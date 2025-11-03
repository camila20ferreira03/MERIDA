# Cognito Module Variables

variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
  default     = "merida-smart-grow-users"
}

variable "domain_prefix" {
  description = "Domain prefix for Cognito hosted UI (leave empty to skip domain creation)"
  type        = string
  default     = ""
}

variable "callback_urls" {
  description = "List of allowed callback URLs for OAuth"
  type        = list(string)
  default     = ["http://localhost:3000", "http://localhost:3000/"]
}

variable "logout_urls" {
  description = "List of allowed logout URLs for OAuth"
  type        = list(string)
  default     = ["http://localhost:3000", "http://localhost:3000/"]
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
