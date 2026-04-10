variable "project_name" {
  description = "Project name"
  type        = string
  default     = "annotation-system"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "annotation-system"
}

variable "backend_replicas" {
  description = "Number of backend replicas"
  type        = number
  default     = 2
}

variable "frontend_replicas" {
  description = "Number of frontend replicas"
  type        = number
  default     = 2
}

variable "postgres_storage_size" {
  description = "PostgreSQL PV storage size"
  type        = string
  default     = "10Gi"
}

variable "media_storage_size" {
  description = "Media storage size"
  type        = string
  default     = "20Gi"
}

variable "docker_image_backend" {
  description = "Docker image for backend"
  type        = string
  default     = "annotation-system-backend:latest"
}

variable "docker_image_frontend" {
  description = "Docker image for frontend"
  type        = string
  default     = "annotation-system-frontend:latest"
}

variable "backend_container_port" {
  description = "Backend container port"
  type        = number
  default     = 8000
}

variable "frontend_container_port" {
  description = "Frontend container port"
  type        = number
  default     = 5173
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "annotation_db"
  sensitive   = false
}

variable "database_user" {
  description = "Database user"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "database_password" {
  description = "Database password"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "django_secret_key" {
  description = "Django secret key"
  type        = string
  default     = "django-insecure-devops-project-key-change-this"
  sensitive   = true
}
