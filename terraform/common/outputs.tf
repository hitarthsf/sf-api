output "assets_bucket" {
  value = aws_s3_bucket.assets
}

output "ecs_application_autoscaling_role_arn" {
  value = aws_iam_service_linked_role.ecs_application_autoscaling.arn
}

output "api_repository_url" {
  value = aws_ecr_repository.sf_api.repository_url
}
