"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./FileUpload.css"

function AdminFileUpload({ onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [description, setDescription] = useState("")
  const [fileFilter, setFileFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchUploadedFiles()
  }, [])

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get("/api/upload/user/all")
      setUploadedFiles(response.data)
    } catch (err) {
      console.error("Error fetching files:", err)
    }
  }

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    setError("")
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setError("Please select at least one file")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("isPublic", isPublic)
      formData.append("description", description)

      const response = await axios.post("/api/upload/multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess(`Successfully uploaded ${response.data.files.length} file(s)`)
      setSelectedFiles([])
      setDescription("")
      setIsPublic(false)
      setShowForm(false)

      // Refresh file list
      fetchUploadedFiles()
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading files")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return
    }

    try {
      await axios.delete(`/api/upload/${fileId}`)
      setSuccess("File deleted successfully")
      fetchUploadedFiles()
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting file")
    }
  }

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axios.get(`/api/upload/${fileId}`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.parentChild.removeChild(link)
    } catch (err) {
      setError("Error downloading file")
    }
  }

  const filteredFiles = fileFilter === "all" ? uploadedFiles : uploadedFiles.filter((f) => f.fileType === fileFilter)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="admin-file-upload">
      <div className="upload-header">
        <h2>File Management</h2>
        {!showForm && (
          <button className="btn-upload-toggle" onClick={() => setShowForm(true)}>
            + Upload Files
          </button>
        )}
      </div>

      {showForm && (
        <div className="upload-form-container">
          <div className="form-header">
            <h3>Upload Files to MongoDB</h3>
            <button className="close-btn" onClick={() => setShowForm(false)}>
              ×
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label>Select Files</label>
              <input
                type="file"
                multiple
                onChange={handleFileSelection}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="file-input"
              />
              {selectedFiles.length > 0 && <p className="file-count">Selected: {selectedFiles.length} file(s)</p>}
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for these files"
                className="description-input"
              />
            </div>

            <div className="form-group checkbox">
              <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <label htmlFor="isPublic">Make files public (accessible to all users)</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success" disabled={loading || selectedFiles.length === 0}>
                {loading ? "Uploading..." : "Upload Files"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="files-section">
        <div className="files-header">
          <h3>Uploaded Files ({filteredFiles.length})</h3>
          <div className="filter-group">
            <label>Filter by type:</label>
            <select value={fileFilter} onChange={(e) => setFileFilter(e.target.value)} className="filter-select">
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="no-files">
            <p>No files uploaded yet. Start by uploading your first file!</p>
          </div>
        ) : (
          <div className="files-list">
            {filteredFiles.map((file) => (
              <div key={file._id} className="file-card">
                <div className="file-info">
                  <div className="file-type-icon">
                    {file.fileType === "image" ? "🖼️" : file.fileType === "document" ? "📄" : "📎"}
                  </div>
                  <div className="file-details">
                    <h4 className="file-name">{file.originalName}</h4>
                    <p className="file-meta">
                      {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
                    </p>
                    {file.description && <p className="file-description">{file.description}</p>}
                    <span className={`file-status ${file.isPublic ? "public" : "private"}`}>
                      {file.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
                <div className="file-actions">
                  <button className="btn-download" onClick={() => handleDownload(file._id, file.originalName)}>
                    Download
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(file._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminFileUpload
