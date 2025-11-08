import express from "express"
import upload from "../middleware/multerConfig.js"
import { verifyToken } from "../middleware/auth.js"
import FileUpload from "../models/FileUpload.js"
import Notice from "../models/Notice.js"

const router = express.Router()

// Determine file type based on MIME type
const getFileType = (mimeType) => {
  if (mimeType.startsWith("image/")) {
    return "image"
  } else if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    mimeType.includes("sheet")
  ) {
    return "document"
  }
  return "other"
}

// Upload single file
router.post("/single", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileUpload = new FileUpload({
      filename: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileData: req.file.buffer,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      fileType: getFileType(req.file.mimetype),
      description: req.body.description || "",
      isPublic: req.body.isPublic === "true" || req.body.isPublic === true,
    })

    await fileUpload.save()

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        _id: fileUpload._id,
        filename: fileUpload.filename,
        originalName: fileUpload.originalName,
        fileSize: fileUpload.fileSize,
        fileType: fileUpload.fileType,
        createdAt: fileUpload.createdAt,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error: error.message })
  }
})

// Upload multiple files
router.post("/multiple", verifyToken, upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" })
    }

    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const fileUpload = new FileUpload({
          filename: `${Date.now()}-${file.originalname}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileData: file.buffer,
          fileSize: file.size,
          uploadedBy: req.user.id,
          fileType: getFileType(file.mimetype),
          isPublic: req.body.isPublic === "true" || req.body.isPublic === true,
        })
        await fileUpload.save()
        return {
          _id: fileUpload._id,
          filename: fileUpload.filename,
          originalName: fileUpload.originalName,
          fileSize: fileUpload.fileSize,
          fileType: fileUpload.fileType,
          createdAt: fileUpload.createdAt,
        }
      }),
    )

    res.status(201).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    })
  } catch (error) {
    res.status(500).json({ message: "Files upload failed", error: error.message })
  }
})

// Download file - MUST be before the generic /:fileId route
router.get("/download/:fileId", verifyToken, async (req, res) => {
  try {
    console.log("[v0] Download request for fileId:", req.params.fileId)
    const fileUpload = await FileUpload.findById(req.params.fileId).populate("uploadedBy", "role")

    if (!fileUpload) {
      console.log("[v0] File not found:", req.params.fileId)
      return res.status(404).json({ message: "File not found" })
    }

    // Find the notice that contains this file
    const notice = await Notice.findOne({ fileUploads: req.params.fileId })

    if (!notice) {
      console.log("[v0] Notice not found for file:", req.params.fileId)
      return res.status(404).json({ message: "File notice not found" })
    }

    const userRole = req.user.role
    let hasAccess = false

    // Admin always has access
    if (userRole === "admin") {
      hasAccess = true
    }
    // If visible to all, all authenticated users can download
    else if (notice.visibleTo === "all") {
      hasAccess = true
    }
    // If visible to students, students and admins can download
    else if (notice.visibleTo === "students" && userRole === "student") {
      hasAccess = true
    }
    // If visible to faculty, faculty and admins can download
    else if (notice.visibleTo === "faculty" && userRole === "faculty") {
      hasAccess = true
    }

    if (!hasAccess) {
      console.log("[v0] Access denied for user:", req.user.id, "role:", userRole, "notice.visibleTo:", notice.visibleTo)
      return res.status(403).json({ message: "Access denied to this file" })
    }

    console.log("[v0] Sending file:", fileUpload.originalName)
    res.setHeader("Content-Type", fileUpload.mimeType)
    res.setHeader("Content-Disposition", `attachment; filename="${fileUpload.originalName}"`)
    res.send(fileUpload.fileData)
  } catch (error) {
    console.error("[v0] File download error:", error.message)
    res.status(500).json({ message: "Failed to download file", error: error.message })
  }
})

// Get file by ID
router.get("/:fileId", verifyToken, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findById(req.params.fileId)

    if (!fileUpload) {
      return res.status(404).json({ message: "File not found" })
    }

    // Check if user has access to the file
    // First check if file is public
    if (!fileUpload.isPublic) {
      // If not public, only allow the uploader or admin
      if (fileUpload.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied to this file" })
      }
    }

    res.setHeader("Content-Type", fileUpload.mimeType)
    res.setHeader("Content-Disposition", `attachment; filename="${fileUpload.originalName}"`)
    res.send(fileUpload.fileData)
  } catch (error) {
    console.error("[v0] File fetch error:", error.message)
    res.status(500).json({ message: "Failed to retrieve file", error: error.message })
  }
})

// Get file metadata by ID
router.get("/:fileId/metadata", verifyToken, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findById(req.params.fileId).select("-fileData")

    if (!fileUpload) {
      return res.status(404).json({ message: "File not found" })
    }

    res.json(fileUpload)
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve file metadata", error: error.message })
  }
})

// Get all files uploaded by user
router.get("/user/all", verifyToken, async (req, res) => {
  try {
    const files = await FileUpload.find({ uploadedBy: req.user.id }).select("-fileData").sort({ createdAt: -1 })

    res.json(files)
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve files", error: error.message })
  }
})

// Delete file
router.delete("/:fileId", verifyToken, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findById(req.params.fileId)

    if (!fileUpload) {
      return res.status(404).json({ message: "File not found" })
    }

    if (fileUpload.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await FileUpload.findByIdAndDelete(req.params.fileId)

    res.json({ message: "File deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete file", error: error.message })
  }
})

// Search files by type
router.get("/search/type/:type", verifyToken, async (req, res) => {
  try {
    const files = await FileUpload.find({ uploadedBy: req.user.id, fileType: req.params.type })
      .select("-fileData")
      .sort({ createdAt: -1 })

    res.json(files)
  } catch (error) {
    res.status(500).json({ message: "Failed to search files", error: error.message })
  }
})

export default router
