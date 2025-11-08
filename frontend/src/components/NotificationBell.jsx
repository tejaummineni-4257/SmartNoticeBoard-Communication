"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./NotificationBell.css";

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    // ✅ Use import.meta.env instead of process.env for Vite
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

    socket.on("notification-received", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("notice-alert", (notice) => {
      const notification = {
        type: "notice",
        title: notice.title,
        message: `New ${notice.category} notice posted`,
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data);

      const unreadRes = await axios.get("/api/notifications/unread/count");
      setUnreadCount(unreadRes.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setUnreadCount(Math.max(0, unreadCount - 1));
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="notification-bell">
      <button
        className="bell-btn"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button onClick={() => setShowNotifications(false)}>×</button>
          </div>
          <div className="notifications-body">
            {notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className={`notification-item ${
                    notif.read ? "read" : "unread"
                  }`}
                >
                  <div>
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                    <small>
                      {new Date(notif.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {!notif.read && (
                    <button onClick={() => handleMarkAsRead(notif._id)}>✓</button>
                  )}
                </div>
              ))
            ) : (
              <p className="no-notifications">No notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
