import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function UploadPage() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please select a valid image.");
        setImage(null);
        return;
      }

      if (file.size > maxSize) {
        setError("File size must be less than 10MB");
        setImage(null);
        return;
      }

      setError("");
      setImage(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!image) {
      setError("Please select an image");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await API.post("upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Image uploaded successfully!");
      setImage(null);
      document.querySelector('input[type="file"]').value = "";

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Upload failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "30px" }}>
      <div style={{ background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginTop: 0 }}>Upload Image for Annotation</h2>

        {error && (
          <div style={{
            background: "#fee",
            color: "#c33",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#efe",
            color: "#3c3",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            fontSize: "14px"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              padding: "20px",
              border: "2px dashed #ddd",
              borderRadius: "5px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#fafafa",
              marginBottom: "15px"
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                disabled={loading}
              />
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#666" }}>
                {image ? `Selected: ${image.name}` : "Click to select image or drag & drop"}
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
                Supported: JPG, PNG, GIF, WebP (max 10MB)
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !image}
            style={{
              padding: "12px",
              width: "100%",
              backgroundColor: "#1f2937",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading || !image ? "not-allowed" : "pointer",
              opacity: loading || !image ? 0.7 : 1,
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadPage;