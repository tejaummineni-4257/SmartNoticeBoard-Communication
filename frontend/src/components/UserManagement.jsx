"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import "./UserManagement.css"

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/users")
      setUsers(res.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${userId}`)
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  return (
    <div className="user-management">
      <h2>Manage Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </td>
              <td>{user.department || "-"}</td>
              <td>
                <button className="btn-danger" onClick={() => handleDeleteUser(user._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserManagement
