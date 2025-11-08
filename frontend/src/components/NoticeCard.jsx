"use client"

import { useState } from "react"
import axios from "axios"
import "./Card.css"

function NoticeCard({ notice, onDelete, isAdmin, isFaculty, isStudent }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(notice.title)
  const [editedContent, setEditedContent] = useState(notice.content)
  const [downloadingFileId, setDownloadingFileId] = useState(null)
  const [downloadError, setDownloadError] = useState("")

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`/api/notices/${notice._id}`)
        onDelete()
      } catch (error) {
        console.error("Error deleting notice:", error)
      }
    }
  }

  const handleEdit = async () => {
    try {
      await axios.put(`/api/notices/${notice._id}`, {
        title: editedTitle,
        content: editedContent,
      })
      setIsEditing(false)
      onDelete()
    } catch (error) {
      console.error("Error updating notice:", error)
    }
  }

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      setDownloadError("")
      setDownloadingFileId(fileId)

      const response = await axios.get(`/api/upload/download/${fileId}`, {
        responseType: "blob",
      })

      // Create a blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      if (error.response?.status === 403) {
        setDownloadError("You don't have permission to download this file.")
      } else if (error.response?.status === 404) {
        setDownloadError("File not found.")
      } else {
        setDownloadError("Failed to download file. Please try again.")
      }
    } finally {
      setDownloadingFileId(null)
    }
  }

  const canAccessFiles = () => {
    if (isAdmin) return true
    if (notice.visibleTo === "all") return true
    if (notice.visibleTo === "students" && isStudent) return true
    if (notice.visibleTo === "faculty" && isFaculty) return true
    if (notice.visibleTo === "admin" && isAdmin) return true
    return false
  }

  const canEdit = isAdmin || isFaculty

  return (
    <div className={`notice-card priority-${notice.priority}`}>
      <div className="notice-header">
        <div>
          <h3>{notice.title}</h3>
          <div className="notice-meta">
            <span className={`category-badge ${notice.category}`}>{notice.category}</span>
            <span className="priority-badge">{notice.priority.toUpperCase()}</span>
            <span className="views-count">{notice.views} views</span>
            <span className="visibility-badge" title={`Visible to: ${notice.visibleTo}`}>
              👁️ {notice.visibleTo}
            </span>
          </div>
        </div>
        {canEdit && (
          <div className="notice-actions">
            <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="notice-content">
        {isEditing ? (
          <div>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="edit-input"
            />
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows="4"
              className="edit-textarea"
            />
            <button className="btn-success" onClick={handleEdit}>
              Save Changes
            </button>
          </div>
        ) : (
          <p>{notice.content}</p>
        )}
      </div>

      {canAccessFiles() && notice.fileUploads && notice.fileUploads.length > 0 && (
        <div className="file-attachments">
          <strong>📎 Attachments ({notice.fileUploads.length}):</strong>
          {downloadError && <div className="alert alert-error">{downloadError}</div>}
          <ul className="files-list">
            {notice.fileUploads.map((file) => (
              <li key={file._id} className="file-item">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <span className="file-name">{file.originalName}</span>
                    <span className="file-size">({(file.fileSize / 1024).toFixed(2)} KB)</span>
                  </div>
                </div>
                <button
                  className="btn-download"
                  onClick={() => handleDownloadFile(file._id, file.originalName)}
                  disabled={downloadingFileId === file._id}
                >
                  {downloadingFileId === file._id ? "Downloading..." : "Download"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!canAccessFiles() && notice.fileUploads && notice.fileUploads.length > 0 && (
        <div className="file-attachments-restricted">
          <strong>📎 Attachments:</strong>
          <p className="access-denied-message">
            Files are restricted to {notice.visibleTo}. You don't have permission to access them.
          </p>
        </div>
      )}

      <div className="notice-footer">
        <small>Posted by: {notice.postedBy.name}</small>
        <small>{new Date(notice.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  )
}

export default NoticeCard
