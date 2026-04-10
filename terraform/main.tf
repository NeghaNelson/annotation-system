# Create namespace
resource "kubernetes_namespace" "annotation_system" {
  metadata {
    name = var.namespace
    labels = {
      name = var.namespace
    }
  }
}

# ConfigMap for application configuration
resource "kubernetes_config_map" "annotation_config" {
  metadata {
    name      = "annotation-config"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = local.common_labels
  }

  data = {
    DEBUG                  = "False"
    ALLOWED_HOSTS          = "localhost,127.0.0.1,annotation-backend,backend"
    DB_HOST                = "postgres-service"
    DB_PORT                = "5432"
    DB_NAME                = var.database_name
    CORS_ALLOWED_ORIGINS   = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://annotation-frontend"
    TIMEZONE               = "Asia/Kolkata"
  }
}

# Secret for sensitive configuration
resource "kubernetes_secret" "annotation_secrets" {
  metadata {
    name      = "annotation-secrets"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = local.common_labels
  }

  type = "Opaque"

  data = {
    SECRET_KEY           = base64encode(var.django_secret_key)
    DB_USER              = base64encode(var.database_user)
    DB_PASSWORD          = base64encode(var.database_password)
    POSTGRES_DB          = base64encode(var.database_name)
    POSTGRES_USER        = base64encode(var.database_user)
    POSTGRES_PASSWORD    = base64encode(var.database_password)
  }
}

# PersistentVolumeClaims
resource "kubernetes_persistent_volume_claim" "postgres_pvc" {
  metadata {
    name      = "postgres-pvc"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = local.common_labels
  }

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = "standard"

    resources {
      requests = {
        storage = var.postgres_storage_size
      }
    }
  }
}

resource "kubernetes_persistent_volume_claim" "media_storage_pvc" {
  metadata {
    name      = "media-storage-pvc"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = local.common_labels
  }

  spec {
    access_modes       = ["ReadWriteMany"]
    storage_class_name = "standard"

    resources {
      requests = {
        storage = var.media_storage_size
      }
    }
  }
}

resource "kubernetes_persistent_volume_claim" "static_storage_pvc" {
  metadata {
    name      = "static-storage-pvc"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = local.common_labels
  }

  spec {
    access_modes       = ["ReadWriteMany"]
    storage_class_name = "standard"

    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}

# PostgreSQL Service
resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres-service"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = local.common_labels
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}

# PostgreSQL Deployment
resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = local.common_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          image = "postgres:15-alpine"
          name  = "postgres"

          port {
            container_port = 5432
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.annotation_secrets.metadata[0].name
            }
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
            sub_path   = "postgres"
          }

          liveness_probe {
            exec {
              command = ["/bin/sh", "-c", "pg_isready -U postgres"]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            exec {
              command = ["/bin/sh", "-c", "pg_isready -U postgres"]
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }
        }

        volume {
          name = "postgres-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres_pvc.metadata[0].name
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service.postgres]
}

# Backend Service
resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend-service"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = merge(local.common_labels, { app = "annotation-backend" })
  }

  spec {
    selector = {
      app = "annotation-backend"
    }

    port {
      name        = "http"
      port        = 8000
      target_port = 8000
    }

    type = "ClusterIP"
  }
}

# Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "annotation-backend"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = merge(local.common_labels, { app = "annotation-backend" })
  }

  spec {
    replicas = var.backend_replicas

    selector {
      match_labels = {
        app = "annotation-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "annotation-backend"
        }
      }

      spec {
        init_container {
          image   = var.docker_image_backend
          name    = "migrate"
          command = ["python", "manage.py", "migrate"]

          env_from {
            config_map_ref {
              name = kubernetes_config_map.annotation_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.annotation_secrets.metadata[0].name
            }
          }
        }

        container {
          image             = var.docker_image_backend
          name              = "backend"
          image_pull_policy = "Never"

          port {
            container_port = 8000
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.annotation_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.annotation_secrets.metadata[0].name
            }
          }

          resources {
            requests = {
              cpu    = "200m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          volume_mount {
            name       = "media-storage"
            mount_path = "/app/media"
          }

          volume_mount {
            name       = "static-storage"
            mount_path = "/app/staticfiles"
          }

          liveness_probe {
            http_get {
              path = "/api/health/"
              port = 8000
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/api/health/"
              port = 8000
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }
        }

        volume {
          name = "media-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.media_storage_pvc.metadata[0].name
          }
        }

        volume {
          name = "static-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.static_storage_pvc.metadata[0].name
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service.backend]
}

# Frontend Service
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend-service"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = merge(local.common_labels, { app = "annotation-frontend" })
  }

  spec {
    selector = {
      app = "annotation-frontend"
    }

    port {
      name        = "http"
      port        = 80
      target_port = 5173
    }

    type = "LoadBalancer"
  }
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "annotation-frontend"
    namespace = kubernetes_namespace.annotation_system.metadata[0].name
    labels    = merge(local.common_labels, { app = "annotation-frontend" })
  }

  spec {
    replicas = var.frontend_replicas

    selector {
      match_labels = {
        app = "annotation-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "annotation-frontend"
        }
      }

      spec {
        container {
          image             = var.docker_image_frontend
          name              = "frontend"
          image_pull_policy = "Never"

          port {
            container_port = 5173
          }

          env {
            name  = "VITE_API_BASE_URL"
            value = "http://backend-service:8000/api"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 5173
            }
            initial_delay_seconds = 20
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 5173
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }

  depends_on = [kubernetes_service.frontend, kubernetes_deployment.backend]
}
