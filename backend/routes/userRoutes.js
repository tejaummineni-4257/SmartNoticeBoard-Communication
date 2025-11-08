import express from "express"
import User from "../models/User.js"
import { verifyToken, checkRole } from "../middleware/auth.js"

const router = express.Router()

// Get all users (admin only)
router.get("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get users by role
router.get("/role/:role", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update user profile
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete user (admin only)
router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
