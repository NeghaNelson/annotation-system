import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AnnotatePage() {
  const [images, setImages] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [annotatingId, setAnnotatingId] = useState(null);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  const LABELS = ["Cat", "Dog", "Car", "Person"];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchImages();
  }, [navigate]);

  const fetchImages = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("images/", {
        params: { page: pageNum }
      });
      setImages(response.data.results || response.data);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        currentPage: pageNum
      });
      setCurrentImageIndex(0);
      setSelectedLabel("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to fetch images";
      setError(errorMessage);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnotate = async (imageId) => {
    if (!selectedLabel) {
      setError("Please select a label first");
      return;
    }

    setAnnotatingId(imageId);
    setError("");
    setSuccess("");

    try {
      const response = await API.post("annotate/", {
        image_id: imageId,
        label: selectedLabel,
      });

      setSuccess("Annotation saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      
      // Remove annotated image from list
      setImages(images.filter(img => img.id !== imageId));
      setSelectedLabel("");
      setCurrentImageIndex(0);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Annotation failed";
      setError(errorMessage);
    } finally {
      setAnnotatingId(null);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setSelectedLabel("");
      setError("");
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setSelectedLabel("");
      setError("");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p style={{ fontSize: "18px" }}>Loading images...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "30px" }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ marginTop: 0, color: "#666" }}>No Pending Images</h2>
          <p style={{ color: "#999", fontSize: "16px" }}>
            All images have been annotated or there are no images available yet.
          </p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px" }}>
      <div style={{ background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginTop: 0 }}>Annotate Images</h2>

        {error && (
          <div style={{
            background: "#fee",
            color: "#c33",
            padding: "12px",
            borderRadius: "5px",
            marginBottom: "15px"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#efe",
            color: "#3c3",
            padding: "12px",
            borderRadius: "5px",
            marginBottom: "15px"
          }}>
            {success}
          </div>
        )}

        {/* Image Display */}
        <div style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          <img
            src={`${apiBaseUrl}${currentImage.image}`}
            alt="annotation-image"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              borderRadius: "8px",
              objectFit: "contain"
            }}
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3EImage not found%3C/text%3E%3C/svg%3E";
            }}
          />
          <p style={{ color: "#666", marginTop: "10px", fontSize: "14px" }}>
            Image {currentImageIndex + 1} of {images.length}
          </p>
        </div>

        {/* Label Selection */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Select Label:</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {LABELS.map((label) => (
              <button
                key={label}
                onClick={() => setSelectedLabel(label)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: selectedLabel === label ? "#1f2937" : "#e5e7eb",
                  color: selectedLabel === label ? "white" : "#1f2937",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s"
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontWeight: "bold" }}>
          Selected: {selectedLabel || "None"}
        </p>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => handleAnnotate(currentImage.id)}
            disabled={!selectedLabel || annotatingId === currentImage.id}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "12px",
              backgroundColor: !selectedLabel ? "#ccc" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: !selectedLabel ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            {annotatingId === currentImage.id ? "Saving..." : "Save Annotation"}
          </button>

          <button
            onClick={handlePreviousImage}
            disabled={currentImageIndex === 0}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "12px",
              backgroundColor: currentImageIndex === 0 ? "#ccc" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentImageIndex === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            Previous
          </button>

          <button
            onClick={handleNextImage}
            disabled={currentImageIndex === images.length - 1}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "12px",
              backgroundColor: currentImageIndex === images.length - 1 ? "#ccc" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentImageIndex === images.length - 1 ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            Next
          </button>
        </div>

        {/* Image Navigation Info */}
        <div style={{
          marginTop: "20px",
          padding: "10px",
          background: "#f0f0f0",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#666"
        }}>
          Showing image {currentImageIndex + 1} of {images.length} on this page
          {pagination.count && <> | Total pending images: {pagination.count}</>}
        </div>
      </div>
    </div>
  );
}

export default AnnotatePage;