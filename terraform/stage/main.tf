terraform {
  required_version = ">= 0.12"
  backend "s3" {
    key = "terraform/stg/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 4.0"
    }
    random = {
      version = "~> 3.0"
    }
  }
}

provider "aws" {
}

provider "github" {
  owner = "servefirstcx"
}

provider "random" {
}

data "terraform_remote_state" "common" {
  backend = "s3"

  config = {
    bucket = var.remote_backend
    key    = "terraform/common/terraform.tfstate"
    region = data.aws_region.current.name
  }
}
