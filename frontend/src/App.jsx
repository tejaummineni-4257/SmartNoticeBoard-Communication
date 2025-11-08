"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/AdminDashboard"
import FacultyDashboard from "./pages/FacultyDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import Navbar from "./components/Navbar"
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      axios
        .get("/api/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Router>
      {user && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />

        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? (
                <AdminDashboard user={user} />
              ) : user.role === "faculty" ? (
                <FacultyDashboard user={user} />
              ) : (
                <StudentDashboard user={user} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
