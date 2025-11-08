import express from "express"
import Communication from "../models/Communication.js"
import { verifyToken } from "../middleware/auth.js"
import io from "../server.js"

const router = express.Router()

// Create communication thread
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body

    const communication = new Communication({
      title,
      description,
      createdBy: req.user.id,
      participants: [req.user.id],
    })

    await communication.save()
    await communication.populate("createdBy", "name email")

    res.status(201).json({
      message: "Communication thread created",
      communication,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all communications
router.get("/", verifyToken, async (req, res) => {
  try {
    const communications = await Communication.find()
      .populate("createdBy", "name email")
      .populate("participants", "name email")
      .populate("messages.sender", "name email")
      .sort({ updatedAt: -1 })

    res.json(communications)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get communication by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("participants", "name email role")
      .populate("messages.sender", "name email")

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" })
    }

    res.json(communication)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add message to communication
router.post("/:id/messages", verifyToken, async (req, res) => {
  try {
    const { text, attachments } = req.body

    const communication = await Communication.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          messages: {
            sender: req.user.id,
            text,
            attachments,
          },
        },
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("messages.sender", "name email")

    // Emit real-time message
    io.emit("new-message", {
      communicationId: req.params.id,
      message: communication.messages[communication.messages.length - 1],
    })

    res.json({
      message: "Message added successfully",
      communication,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add participant to communication
router.post("/:id/participants", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body

    const communication = await Communication.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: userId } },
      { new: true },
    ).populate("participants", "name email")

    res.json({
      message: "Participant added",
      communication,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
