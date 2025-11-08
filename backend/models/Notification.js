import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["notice", "message", "reply", "announcement"],
      required: true,
    },
    title: String,
    message: String,
    relatedId: mongoose.Schema.Types.ObjectId,
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Notification", notificationSchema)
