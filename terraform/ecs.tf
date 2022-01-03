# ecs.tf

resource "aws_ecs_cluster" "main" {
  name = "sfv2-cluster"
}

data "template_file" "sfv2_api" {
  template = file("./templates/ecs/sfv2_api.json.tpl")

  vars = {
    api_image      = var.api_image
    api_port       = var.api_port
    fargate_cpu    = var.fargate_cpu
    fargate_memory = var.fargate_memory
    aws_region     = var.aws_region
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "sfv2-api-task"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  container_definitions    = data.template_file.sfv2_api.rendered
}

resource "aws_ecs_service" "main" {
  name            = "sfv2-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private.*.id
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.api.id
    container_name   = "sfv2-api"
    container_port   = var.api_port
  }

  depends_on = [aws_alb_listener.front_end, aws_iam_role_policy_attachment.ecs_task_execution_role]
}

