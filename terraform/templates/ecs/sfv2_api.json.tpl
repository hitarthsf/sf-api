[
  {
    "name": "sfv2-api",
    "image": "${api_image}",
    "cpu": ${fargate_cpu},
    "memory": ${fargate_memory},
    "networkMode": "awsvpc",
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sfv2-api",
          "awslogs-region": "${aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
    },
    "portMapiings": [
      {
        "containerPort": ${api_port},
        "hostPort": ${api_port}
      }
    ]
  }
]
