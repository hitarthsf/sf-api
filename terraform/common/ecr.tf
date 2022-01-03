resource "aws_ecr_repository" "sf_api" {
  name = "sf-api"
  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = "arn:aws:kms:eu-west-2:068531097348:key/17a22730-5428-4a81-a4ef-2564080501d2"
  }
  image_scanning_configuration {
    scan_on_push = true
  }
}
