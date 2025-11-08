import express from "express"
import Notice from "../models/Notice.js"
import FileUpload from "../models/FileUpload.js"
import { verifyToken, checkRole } from "../middleware/auth.js"
import upload from "../middleware/multerConfig.js"
import io from "../server.js"

const router = express.Router()

router.post("/", verifyToken, checkRole(["admin", "faculty"]), upload.array("files", 10), async (req, res) => {
  try {
    const { title, content, category, visibleTo, priority } = req.body
    const fileUploads = []

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUpload = new FileUpload({
          filename: `${Date.now()}-${file.originalname}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileData: file.buffer,
          fileSize: file.size,
          uploadedBy: req.user.id,
          fileType: file.mimetype.startsWith("image/") ? "image" : "document",
          isPublic: true, // Files shared with notice are public
          description: `Attached to notice: ${title}`,
        })
        await fileUpload.save()
        fileUploads.push(fileUpload._id)
      }
    }

    const notice = new Notice({
      title,
      content,
      category,
      visibleTo,
      priority,
      postedBy: req.user.id,
      fileUploads,
    })

    await notice.save()
    await notice.populate("postedBy", "name email role")
    await notice.populate("fileUploads", "-fileData")

    // Emit real-time notification
    io.emit("new-notice", notice)

    res.status(201).json({
      message: "Notice created successfully with files",
      notice,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all notices
router.get("/", verifyToken, async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("postedBy", "name email role")
      .populate("fileUploads", "-fileData")
      .sort({ createdAt: -1 })
    res.json(notices)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get notice by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate("postedBy", "name email role")
      .populate("fileUploads", "-fileData")

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" })
    }

    res.json(notice)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.get("/:noticeId/files", verifyToken, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.noticeId).populate("fileUploads", "-fileData")

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" })
    }

    // Check visibility permissions
    const hasAccess = checkFileAccess(notice, req.user.role)

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this notice's files" })
    }

    res.json(notice.fileUploads)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

router.put("/:id", verifyToken, checkRole(["admin", "faculty"]), upload.array("files", 10), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" })
    }

    if (notice.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { title, content, category, visibleTo, priority, filesToRemove } = req.body
    let updatedFileUploads = [...notice.fileUploads]

    // Remove specified files
    if (filesToRemove && Array.isArray(filesToRemove)) {
      for (const fileId of filesToRemove) {
        await FileUpload.findByIdAndDelete(fileId)
        updatedFileUploads = updatedFileUploads.filter((f) => f.toString() !== fileId)
      }
    }

    // Add new files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUpload = new FileUpload({
          filename: `${Date.now()}-${file.originalname}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileData: file.buffer,
          fileSize: file.size,
          uploadedBy: req.user.id,
          fileType: file.mimetype.startsWith("image/") ? "image" : "document",
          isPublic: true,
          description: `Attached to notice: ${title}`,
        })
        await fileUpload.save()
        updatedFileUploads.push(fileUpload._id)
      }
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        visibleTo,
        priority,
        fileUploads: updatedFileUploads,
        updatedAt: new Date(),
      },
      { new: true },
    )
      .populate("postedBy", "name email role")
      .populate("fileUploads", "-fileData")

    res.json({
      message: "Notice updated successfully",
      notice: updatedNotice,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete notice
router.delete("/:id", verifyToken, checkRole(["admin", "faculty"]), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" })
    }

    if (notice.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    if (notice.fileUploads && notice.fileUploads.length > 0) {
      await FileUpload.deleteMany({ _id: { $in: notice.fileUploads } })
    }

    await Notice.findByIdAndDelete(req.params.id)

    res.json({ message: "Notice deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router

// Function to check file access
function checkFileAccess(notice, userRole) {
  // Implement your logic to check file access based on notice and user role
  // This is a placeholder function
  return true
}
