# logs.tf

# Set up CloudWatch group and log stream and retain logs for 30 days
resource "aws_cloudwatch_log_group" "sfv2_log_group" {
  name              = "/ecs/sfv2-api"
  retention_in_days = 30

  tags = {
    Name = "sfv2-log-group"
  }
}

resource "aws_cloudwatch_log_stream" "sfv2_log_stream" {
  name           = "sfv2-log-stream"
  log_group_name = aws_cloudwatch_log_group.sfv2_log_group.name
}

