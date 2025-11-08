"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import NoticeList from "../components/NoticeList"
import NoticeForm from "../components/NoticeForm"
import CommunicationList from "../components/CommunicationList"
import "./Dashboard.css"

function FacultyDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("notices")
  const [notices, setNotices] = useState([])
  const [communications, setCommunications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [noticesRes, commRes] = await Promise.all([axios.get("/api/notices"), axios.get("/api/communications")])
      setNotices(noticesRes.data)
      setCommunications(commRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Faculty Dashboard</h1>
        <p>Welcome, {user.name}</p>
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
          Communications
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "notices" && (
          <div>
            <NoticeForm onNoticeCreated={fetchData} />
            <NoticeList notices={notices} onDelete={fetchData} isFaculty={true} />
          </div>
        )}
        {activeTab === "communications" && (
          <CommunicationList communications={communications} user={user} onRefresh={fetchData} />
        )}
      </div>
    </div>
  )
}

export default FacultyDashboard
