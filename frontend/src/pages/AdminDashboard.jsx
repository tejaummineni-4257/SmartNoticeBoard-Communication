"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import NoticeList from "../components/NoticeList"
import NoticeForm from "../components/NoticeForm"
import UserManagement from "../components/UserManagement"
import AdminFileUpload from "../components/AdminFileUpload"
import "./Dashboard.css"

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("notices")
  const [notices, setNotices] = useState([])
  const [stats, setStats] = useState({ totalNotices: 0, activeNotices: 0, urgentNotices: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [noticesRes] = await Promise.all([axios.get("/api/notices")])
      setNotices(noticesRes.data)
      setStats({
        totalNotices: noticesRes.data.length,
        activeNotices: noticesRes.data.filter((n) => n.status === "active").length,
        urgentNotices: noticesRes.data.filter((n) => n.priority === "urgent").length,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Notices</h3>
          <p className="stat-number">{stats.totalNotices}</p>
        </div>
        <div className="stat-card">
          <h3>Active Notices</h3>
          <p className="stat-number">{stats.activeNotices}</p>
        </div>
        <div className="stat-card">
          <h3>Urgent Notices</h3>
          <p className="stat-number">{stats.urgentNotices}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn-primary" onClick={() => setActiveTab("notices")}>
          🔧 Create New Notice
        </button>
        <button className="btn-secondary" onClick={() => setActiveTab("notices")}>
          📋 Manage Notices
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "notices" ? "active" : ""}`}
          onClick={() => setActiveTab("notices")}
        >
          Manage Notices
        </button>
        <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          Manage Users
        </button>
        <button className={`tab-btn ${activeTab === "files" ? "active" : ""}`} onClick={() => setActiveTab("files")}>
          Manage Files
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "notices" && (
          <div>
            <NoticeForm onNoticeCreated={fetchData} />
            <NoticeList notices={notices} onDelete={fetchData} isAdmin={true} />
          </div>
        )}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "files" && <AdminFileUpload onUploadComplete={fetchData} />}
      </div>
    </div>
  )
}

export default AdminDashboard
