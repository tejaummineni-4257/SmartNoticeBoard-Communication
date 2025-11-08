import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import userRoutes from "./routes/userRoutes.js"
import noticeRoutes from "./routes/noticeRoutes.js"
import communicationRoutes from "./routes/communicationRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// MongoDB Connection with MongoDB Atlas support
const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/college-notice-board"

mongoose
  .connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("MongoDB connected successfully")
    console.log(`Connected to: ${mongodbUri.split("@")[1] || "local instance"}`)
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message)
    process.exit(1)
  })

// Monitor connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB")
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/notices", noticeRoutes)
app.use("/api/communications", communicationRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/upload", uploadRoutes)

// Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", (roomId) => {
    socket.join(roomId)
  })

  socket.on("new-notice", (data) => {
    io.emit("notice-alert", data)
  })

  socket.on("new-message", (data) => {
    io.to(data.roomId).emit("message-received", data)
  })

  socket.on("new-notification", (data) => {
    io.emit("notification-received", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default io
