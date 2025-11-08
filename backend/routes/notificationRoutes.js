import express from "express"
import Notification from "../models/Notification.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get notifications for current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("recipient", "name email")
      .sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get unread notifications count
router.get("/unread/count", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    })

    res.json({ unreadCount: count })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Mark notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })

    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Mark all notifications as read
router.put("/read/all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { read: true })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
