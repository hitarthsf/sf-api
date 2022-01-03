# variables.tf

variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "eu-west-2"
}

variable "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  default     = "sfv2EcsTaskExecutionRole"
}

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  default     = "2"
}

variable "api_image" {
  description = "Docker image to run in the ECS cluster"
  default     = "068531097348.dkr.ecr.eu-west-2.amazonaws.com/sf-api"
}

variable "api_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 5000
}

variable "api_count" {
  description = "Number of docker containers to run"
  default     = 3
}

variable "health_check_path" {
  default = "/"
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "256"
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = "512"
}

