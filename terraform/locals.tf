locals {
  common_labels = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }

  app_labels = merge(
    local.common_labels,
    {
      app = var.project_name
    }
  )
}
