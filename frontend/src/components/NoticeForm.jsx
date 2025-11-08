"use client"

import { useState } from "react"
import axios from "axios"
import "./Form.css"

function NoticeForm({ onNoticeCreated }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [priority, setPriority] = useState("medium")
  const [visibleTo, setVisibleTo] = useState("all")
  const [files, setFiles] = useState([])
  const [fileNames, setFileNames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
    setFileNames(selectedFiles.map((f) => f.name))
  }

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    const updatedNames = fileNames.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    setFileNames(updatedNames)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("category", category)
      formData.append("priority", priority)
      formData.append("visibleTo", visibleTo)

      // Add files to FormData
      files.forEach((file) => {
        formData.append("files", file)
      })

      await axios.post("/api/notices", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setTitle("")
      setContent("")
      setCategory("general")
      setPriority("medium")
      setVisibleTo("all")
      setFiles([])
      setFileNames([])
      setShowForm(false)

      onNoticeCreated()
    } catch (err) {
      setError(err.response?.data?.message || "Error creating notice")
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button className="btn-primary" onClick={() => setShowForm(true)}>
        + Create Notice
      </button>
    )
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h3>Create New Notice</h3>
        <button className="close-btn" onClick={() => setShowForm(false)}>
          ×
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="5" required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="event">Event</option>
              <option value="exam">Exam</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Visible To</label>
            <select value={visibleTo} onChange={(e) => setVisibleTo(e.target.value)}>
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Attach Files (Images, PDFs, Documents)</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif"
          />
        </div>

        {fileNames.length > 0 && (
          <div className="files-list">
            <strong>Selected Files:</strong>
            <ul>
              {fileNames.map((name, idx) => (
                <li key={idx} className="file-item">
                  <span>{name}</span>
                  <button type="button" className="btn-remove-file" onClick={() => handleRemoveFile(idx)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-success" disabled={loading}>
            {loading ? "Creating..." : "Create Notice"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoticeForm
