"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import NotificationBell from "./NotificationBell"
import "./Navbar.css"

function Navbar({ user, setUser }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>Notice Board</h2>
        </div>

        <div className="nav-center">
          <span className="user-role">{user?.role?.toUpperCase()}</span>
        </div>

        <div className="nav-right">
          <NotificationBell user={user} />
          <div className="user-menu">
            <button className="user-btn" onClick={() => setShowMenu(!showMenu)}>
              {user?.name}
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate("/profile")
                  }}
                >
                  Profile
                </button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
