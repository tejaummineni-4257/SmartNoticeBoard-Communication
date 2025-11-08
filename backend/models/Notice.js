import mongoose from "mongoose"

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "academic", "event", "urgent", "exam"],
      default: "general",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachments: [
      {
        filename: String,
        fileData: String,
      },
    ],
    fileUploads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload",
      },
    ],
    visibleTo: {
      type: String,
      enum: ["all", "students", "faculty", "admin"],
      default: "all",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    views: {
      type: Number,
      default: 0,
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

export default mongoose.model("Notice", noticeSchema)
