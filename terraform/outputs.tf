output "namespace" {
  value       = kubernetes_namespace.annotation_system.metadata[0].name
  description = "Kubernetes namespace"
}

output "backend_service_ip" {
  value       = kubernetes_service.backend.spec[0].cluster_ip
  description = "Backend service cluster IP"
}

output "frontend_service_endpoint" {
  value       = try(kubernetes_service.frontend.status[0].load_balancer[0].ingress[0].ip, kubernetes_service.frontend.spec[0].cluster_ip)
  description = "Frontend service endpoint (LoadBalancer or ClusterIP)"
}

output "postgres_service_ip" {
  value       = kubernetes_service.postgres.spec[0].cluster_ip
  description = "PostgreSQL service cluster IP"
}
