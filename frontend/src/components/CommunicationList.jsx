"use client"

import { useState } from "react"
import axios from "axios"
import CommunicationThread from "./CommunicationThread"
import "./List.css"

function CommunicationList({ communications, user, onRefresh }) {
  const [showNewThread, setShowNewThread] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [selectedThread, setSelectedThread] = useState(null)

  const handleCreateThread = async (e) => {
    e.preventDefault()
    try {
      await axios.post("/api/communications", {
        title: newTitle,
        description: newDescription,
      })
      setNewTitle("")
      setNewDescription("")
      setShowNewThread(false)
      onRefresh()
    } catch (error) {
      console.error("Error creating thread:", error)
    }
  }

  return (
    <div className="list-container">
      <button className="btn-primary" onClick={() => setShowNewThread(!showNewThread)}>
        + Start Discussion
      </button>

      {showNewThread && (
        <div className="form-container">
          <form onSubmit={handleCreateThread}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows="3" required />
            </div>
            <button type="submit" className="btn-success">
              Create Thread
            </button>
          </form>
        </div>
      )}

      {selectedThread ? (
        <CommunicationThread
          thread={selectedThread}
          user={user}
          onBack={() => setSelectedThread(null)}
          onRefresh={onRefresh}
        />
      ) : (
        <div className="communications-list">
          {communications.length > 0 ? (
            communications.map((comm) => (
              <div key={comm._id} className="comm-item" onClick={() => setSelectedThread(comm)}>
                <h4>{comm.title}</h4>
                <p>{comm.description}</p>
                <small>{comm.messages.length} messages</small>
              </div>
            ))
          ) : (
            <p className="no-data">No discussions yet</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CommunicationList
