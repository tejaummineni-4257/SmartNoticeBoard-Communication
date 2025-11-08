"use client"

import { useState } from "react"
import styles from "./page.module.css"

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>📚 College Notice Board & Communication Portal</h1>
          <p>A Complete MERN Stack Application</p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "features" ? styles.active : ""}`}
            onClick={() => setActiveTab("features")}
          >
            Features
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "setup" ? styles.active : ""}`}
            onClick={() => setActiveTab("setup")}
          >
            Setup Guide
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "structure" ? styles.active : ""}`}
            onClick={() => setActiveTab("structure")}
          >
            Project Structure
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "overview" && (
            <div className={styles.section}>
              <h2>Project Overview</h2>
              <p>
                The Smart College Notice Board and Communication Portal is a complete MERN stack application designed to
                facilitate effective communication between administrators, faculty members, and students in a college
                setting.
              </p>
              <div className={styles.highlightBox}>
                <h3>Key Technologies:</h3>
                <ul>
                  <li>
                    <strong>Frontend:</strong> React 18 with Vite
                  </li>
                  <li>
                    <strong>Backend:</strong> Node.js & Express.js
                  </li>
                  <li>
                    <strong>Database:</strong> MongoDB
                  </li>
                  <li>
                    <strong>Real-time:</strong> Socket.io
                  </li>
                  <li>
                    <strong>Authentication:</strong> JWT (JSON Web Tokens)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className={styles.section}>
              <h2>Core Features</h2>

              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <h3>🔐 Role-Based Authentication</h3>
                  <p>Secure login system for Admin, Faculty, and Student roles with JWT tokens</p>
                </div>

                <div className={styles.featureCard}>
                  <h3>📢 Notice Management</h3>
                  <p>Create, edit, delete notices with categories, priorities, and attachments</p>
                </div>

                <div className={styles.featureCard}>
                  <h3>🔔 Real-Time Notifications</h3>
                  <p>Instant alerts for new notices and messages using Socket.io</p>
                </div>

                <div className={styles.featureCard}>
                  <h3>💬 Communication Module</h3>
                  <p>Discussion threads for Q&A and faculty-student interactions</p>
                </div>

                <div className={styles.featureCard}>
                  <h3>📊 Role-Based Dashboards</h3>
                  <p>Customized dashboards for each user role with relevant information</p>
                </div>

                <div className={styles.featureCard}>
                  <h3>👥 User Management</h3>
                  <p>Admin can manage all users, view statistics, and control access</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "setup" && (
            <div className={styles.section}>
              <h2>Setup Instructions</h2>

              <div className={styles.setupStep}>
                <h3>Step 1: Backend Setup</h3>
                <pre className={styles.code}>
                  {`# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with:
# MONGODB_URI=mongodb://localhost:27017/college-notice-board
# JWT_SECRET=your-secret-key-change-in-production
# PORT=5000
# CLIENT_URL=http://localhost:5173

# Start the server
npm run dev
# or
node server.js`}
                </pre>
              </div>

              <div className={styles.setupStep}>
                <h3>Step 2: Frontend Setup</h3>
                <pre className={styles.code}>
                  {`# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

# Access at http://localhost:5173`}
                </pre>
              </div>

              <div className={styles.setupStep}>
                <h3>Step 3: Test the Application</h3>
                <ol>
                  <li>Go to http://localhost:5173/register</li>
                  <li>Create an account with role: Admin, Faculty, or Student</li>
                  <li>Login with your credentials</li>
                  <li>Explore the role-specific dashboard</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "structure" && (
            <div className={styles.section}>
              <h2>Project Structure</h2>

              <div className={styles.fileTree}>
                <div className={styles.treeItem}>
                  <strong>college-notice-board/</strong>
                  <div className={styles.nested}>
                    <div className={styles.treeItem}>
                      <strong>backend/</strong>
                      <div className={styles.nested}>
                        <p>server.js - Express server & Socket.io setup</p>
                        <p>models/ - MongoDB schemas (User, Notice, Communication, Notification)</p>
                        <p>routes/ - API endpoints (auth, notices, communications, notifications)</p>
                        <p>middleware/ - JWT authentication & role checking</p>
                        <p>package.json - Backend dependencies</p>
                      </div>
                    </div>
                    <div className={styles.treeItem}>
                      <strong>frontend/</strong>
                      <div className={styles.nested}>
                        <p>src/App.jsx - Main React component</p>
                        <p>src/pages/ - Login, Register, and Role-based Dashboards</p>
                        <p>src/components/ - Reusable UI components</p>
                        <p>vite.config.js - Vite configuration</p>
                        <p>package.json - Frontend dependencies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.highlightBox}>
                <h3>API Endpoints</h3>
                <ul>
                  <li>
                    <code>POST /api/auth/register</code> - User registration
                  </li>
                  <li>
                    <code>POST /api/auth/login</code> - User login
                  </li>
                  <li>
                    <code>GET /api/notices</code> - Fetch all notices
                  </li>
                  <li>
                    <code>POST /api/notices</code> - Create notice (Admin/Faculty)
                  </li>
                  <li>
                    <code>PUT /api/notices/:id</code> - Update notice
                  </li>
                  <li>
                    <code>DELETE /api/notices/:id</code> - Delete notice
                  </li>
                  <li>
                    <code>GET /api/communications</code> - Fetch discussions
                  </li>
                  <li>
                    <code>POST /api/communications/:id/messages</code> - Add message
                  </li>
                  <li>
                    <code>GET /api/notifications</code> - Fetch notifications
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Smart College Notice Board v1.0 | Built with MERN Stack</p>
      </footer>
    </div>
  )
}
