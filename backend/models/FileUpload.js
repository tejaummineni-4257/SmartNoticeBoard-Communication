import mongoose from "mongoose"

const fileUploadSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileData: {
      type: Buffer,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileType: {
      type: String,
      enum: ["image", "document", "other"],
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Index for efficient queries
fileUploadSchema.index({ uploadedBy: 1, createdAt: -1 })
fileUploadSchema.index({ fileType: 1 })

export default mongoose.model("FileUpload", fileUploadSchema)
