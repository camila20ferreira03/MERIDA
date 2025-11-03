# Amplify Module Variables

variable "app_name" {
  description = "Name of the Amplify application"
  type        = string
  default     = "merida-smart-grow-frontend"
}

variable "repository_url" {
  description = "GitHub repository URL (e.g., https://github.com/username/repo)"
  type        = string
}

variable "github_access_token" {
  description = "GitHub personal access token for accessing the repository"
  type        = string
  sensitive   = true
}

variable "main_branch_name" {
  description = "Name of the main branch to deploy"
  type        = string
  default     = "main"
}

variable "iam_service_role_arn" {
  description = "ARN of the IAM role for Amplify to use (LabRole for AWS Academy)"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables for the Amplify app"
  type        = map(string)
  default     = {}
}

variable "branch_environment_variables" {
  description = "Environment variables specific to the main branch"
  type        = map(string)
  default     = {}
}

variable "custom_build_spec" {
  description = "Custom build spec (leave empty to use amplify.yml from repository)"
  type        = string
  default     = ""
}

variable "enable_auto_branch_creation" {
  description = "Enable automatic branch creation for pull requests"
  type        = bool
  default     = false
}

variable "enable_auto_build" {
  description = "Enable automatic builds on push"
  type        = bool
  default     = true
}

variable "branch_stage" {
  description = "Stage for the main branch (PRODUCTION, BETA, DEVELOPMENT, EXPERIMENTAL)"
  type        = string
  default     = "PRODUCTION"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
