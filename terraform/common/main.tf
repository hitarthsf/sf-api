terraform {
  required_version = ">= 0.12"
  backend "s3" {
    key = "terraform/common/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
}

