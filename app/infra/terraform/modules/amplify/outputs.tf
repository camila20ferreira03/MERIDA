# Amplify Module Outputs

output "app_id" {
  description = "ID of the Amplify app"
  value       = aws_amplify_app.frontend.id
}

output "app_arn" {
  description = "ARN of the Amplify app"
  value       = aws_amplify_app.frontend.arn
}

output "default_domain" {
  description = "Default domain of the Amplify app"
  value       = aws_amplify_app.frontend.default_domain
}

output "branch_name" {
  description = "Name of the main branch"
  value       = aws_amplify_branch.main.branch_name
}

output "branch_url" {
  description = "URL of the main branch"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "webhook_url" {
  description = "Webhook URL for triggering builds"
  value       = aws_amplify_webhook.main.url
  sensitive   = true
}

output "app_name" {
  description = "Name of the Amplify app"
  value       = aws_amplify_app.frontend.name
}
