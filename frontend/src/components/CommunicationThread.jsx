"use client"

import { useState } from "react"
import axios from "axios"
import "./Thread.css"

function CommunicationThread({ thread, user, onBack, onRefresh }) {
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`/api/communications/${thread._id}/messages`, {
        text: newMessage,
      })
      setNewMessage("")
      onRefresh()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="thread-container">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="thread-header">
        <h2>{thread.title}</h2>
        <p>{thread.description}</p>
      </div>

      <div className="messages-container">
        {thread.messages && thread.messages.length > 0 ? (
          thread.messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender._id === user.id ? "sent" : "received"}`}>
              <strong>{msg.sender.name}</strong>
              <p>{msg.text}</p>
              <small>{new Date(msg.createdAt).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          required
        />
        <button type="submit" className="btn-success" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}

export default CommunicationThread
