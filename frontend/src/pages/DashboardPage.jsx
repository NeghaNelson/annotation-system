import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("dashboard/");
      setStats(response.data.data || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch stats";
      setError(errorMessage);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p style={{ fontSize: "18px" }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "30px" }}>
        <div style={{
          background: "#fee",
          color: "#c33",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center"
        }}>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchStats} style={{
            padding: "10px 20px",
            backgroundColor: "#c33",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>No data available</p>
      </div>
    );
  }

  const completionRate = stats.total_images > 0
    ? Math.round((stats.total_annotations / stats.total_images) * 100)
    : 0;

  const StatCard = ({ title, value, subtitle, color = "#1f2937" }) => (
    <div style={{
      background: "white",
      padding: "25px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      textAlign: "center",
      borderTop: `4px solid ${color}`
    }}>
      <p style={{ color: "#999", margin: "0 0 10px 0", fontSize: "14px" }}>{title}</p>
      <h3 style={{ color, margin: "0", fontSize: "36px" }}>{value}</h3>
      {subtitle && <p style={{ color: "#666", margin: "10px 0 0 0", fontSize: "12px" }}>{subtitle}</p>}
    </div>
  );

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <h2 style={{ margin: 0 }}>Annotation Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 20px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>

      {/* Statistics Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <StatCard
          title="Total Images"
          value={stats.total_images}
          color="#3b82f6"
        />
        <StatCard
          title="Total Annotations"
          value={stats.total_annotations}
          color="#10b981"
        />
        <StatCard
          title="Pending Images"
          value={stats.pending_images}
          color="#f59e0b"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle={`${stats.total_annotations} of ${stats.total_images} annotated`}
          color="#8b5cf6"
        />
      </div>

      {/* Current User Stats */}
      {stats.current_user_annotations !== undefined && (
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "30px"
        }}>
          <h3 style={{ marginTop: 0 }}>Your Contribution</h3>
          <p style={{ fontSize: "18px", color: "#1f2937" }}>
            You have annotated <strong style={{ color: "#10b981" }}>{stats.current_user_annotations}</strong> images
          </p>
        </div>
      )}

      {/* Label Distribution */}
      {stats.label_distribution && stats.label_distribution.length > 0 && (
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginTop: 0 }}>Label Distribution</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {stats.label_distribution.map((item) => (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "bold" }}>{item.label}</span>
                  <span style={{ color: "#666" }}>{item.count} annotations</span>
                </div>
                <div style={{
                  background: "#e5e7eb",
                  borderRadius: "4px",
                  height: "20px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    background: "#10b981",
                    height: "100%",
                    width: `${stats.total_annotations > 0 ? (item.count / stats.total_annotations) * 100 : 0}%`,
                    borderRadius: "4px",
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={fetchStats}
          style={{
            padding: "10px 30px",
            backgroundColor: "#1f2937",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;