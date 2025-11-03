# AWS Amplify App for MERIDA Smart Grow Frontend

# NOTE: AWS Academy might not support AWS Amplify creation via Terraform.
# If you encounter permission errors, consider using the Amplify Console UI
# or deploying to S3 + CloudFront as an alternative.

resource "aws_amplify_app" "frontend" {
  name       = var.app_name
  repository = var.repository_url

  # GitHub access token for private repositories
  access_token = var.github_access_token

  # Build settings - Amplify will auto-detect from amplify.yml
  build_spec = var.custom_build_spec != "" ? var.custom_build_spec : null

  # Environment variables
  dynamic "environment_variables" {
    for_each = var.environment_variables
    content {
      name  = environment_variables.key
      value = environment_variables.value
    }
  }

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  # Platform - WEB for SPA
  platform = "WEB"

  # IAM service role (use LabRole for AWS Academy)
  iam_service_role_arn = var.iam_service_role_arn

  # Enable auto branch creation for PRs (optional)
  enable_auto_branch_creation = var.enable_auto_branch_creation

  auto_branch_creation_config {
    enable_auto_build = var.enable_auto_build
  }

  tags = var.tags
}

# Branch for main
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.main_branch_name

  # Enable auto build on push
  enable_auto_build = var.enable_auto_build

  # Environment variables specific to this branch (optional)
  dynamic "environment_variables" {
    for_each = var.branch_environment_variables
    content {
      name  = environment_variables.key
      value = environment_variables.value
    }
  }

  # Framework (Vite)
  framework = "React"
  stage     = var.branch_stage
}

# Webhook for GitHub integration (triggers builds on push)
resource "aws_amplify_webhook" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "Trigger build on push to ${var.main_branch_name}"
}
