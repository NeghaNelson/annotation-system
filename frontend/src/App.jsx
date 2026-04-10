import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import AnnotatePage from "./pages/AnnotatePage";
import DashboardPage from "./pages/DashboardPage";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginStatusChange = (status) => {
    setIsLoggedIn(status);
  };

  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
        <header style={{ backgroundColor: "#1f2937", color: "white", padding: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Human-in-the-Loop Annotation System</h1>
        </header>

        <nav style={{
          backgroundColor: "#ffffff",
          padding: "15px 20px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                fontWeight: "bold",
                color: "#1f2937",
                fontSize: "14px"
              }}
            >
              Login
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/upload"
                  style={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    color: "#1f2937",
                    fontSize: "14px"
                  }}
                >
                  Upload
                </Link>
                <Link
                  to="/annotate"
                  style={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    color: "#1f2937",
                    fontSize: "14px"
                  }}
                >
                  Annotate
                </Link>
                <Link
                  to="/dashboard"
                  style={{
                    textDecoration: "none",
                    fontWeight: "bold",
                    color: "#1f2937",
                    fontSize: "14px"
                  }}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </nav>

        <div style={{ padding: "30px" }}>
          <Routes>
            <Route
              path="/"
              element={<LoginPage onLoginSuccess={() => handleLoginStatusChange(true)} />}
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annotate"
              element={
                <ProtectedRoute>
                  <AnnotatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <footer style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: "20px",
          textAlign: "center",
          marginTop: "50px",
          fontSize: "12px"
        }}>
          <p style={{ margin: 0 }}>Annotation System v1.0 | All Rights Reserved</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;