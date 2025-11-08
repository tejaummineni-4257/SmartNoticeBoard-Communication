"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import NoticeList from "../components/NoticeList"
import CommunicationList from "../components/CommunicationList"
import "./Dashboard.css"

function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("notices")
  const [notices, setNotices] = useState([])
  const [communications, setCommunications] = useState([])
  const [stats, setStats] = useState({ totalNotices: 0, urgentNotices: 0, unreadNotifications: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [noticesRes, commRes] = await Promise.all([axios.get("/api/notices"), axios.get("/api/communications")])
      setNotices(noticesRes.data)
      setCommunications(commRes.data)
      setStats({
        totalNotices: noticesRes.data.length,
        urgentNotices: noticesRes.data.filter((n) => n.priority === "urgent").length,
        unreadNotifications: noticesRes.data.filter((n) => !n.read).length,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Stay updated with the latest notices and announcements.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <h3>{stats.totalNotices}</h3>
          <p>Total Notices</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <h3>{stats.urgentNotices}</h3>
          <p>Urgent Notices</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <h3>{stats.unreadNotifications}</h3>
          <p>Unread Notifications</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "notices" ? "active" : ""}`}
          onClick={() => setActiveTab("notices")}
        >
          Notices
        </button>
        <button
          className={`tab-btn ${activeTab === "communications" ? "active" : ""}`}
          onClick={() => setActiveTab("communications")}
        >
          Ask Questions
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "notices" && <NoticeList notices={notices} isStudent={true} />}
        {activeTab === "communications" && (
          <CommunicationList communications={communications} user={user} onRefresh={fetchData} />
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
