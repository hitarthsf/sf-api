output "alb_dns_name" {
  value = aws_lb.public.dns_name
}

output "repo_name" {
  value = data.github_repository.repo.name
}
