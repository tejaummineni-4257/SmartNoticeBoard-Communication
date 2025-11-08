"use client"

import { useState, useEffect } from "react"
import NoticeCard from "./NoticeCard"
import "./List.css"

function NoticeList({ notices, onDelete, isAdmin, isFaculty, isStudent }) {
  const [filteredNotices, setFilteredNotices] = useState(notices)
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    let filtered = notices

    if (filterCategory !== "all") {
      filtered = filtered.filter((n) => n.category === filterCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredNotices(filtered)
  }, [notices, filterCategory, searchTerm])

  return (
    <div className="list-container">
      <div className="list-controls">
        <input
          type="text"
          placeholder="Search notices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="academic">Academic</option>
          <option value="event">Event</option>
          <option value="exam">Exam</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="notices-grid">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <NoticeCard
              key={notice._id}
              notice={notice}
              onDelete={onDelete}
              isAdmin={isAdmin}
              isFaculty={isFaculty}
              isStudent={isStudent}
            />
          ))
        ) : (
          <p className="no-data">No notices found</p>
        )}
      </div>
    </div>
  )
}

export default NoticeList
