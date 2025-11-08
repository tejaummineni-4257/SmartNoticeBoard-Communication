# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for the Smart Notice Board project.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Sign Up** and create a free account
3. Verify your email address

## Step 2: Create a Project and Cluster

1. After logging in, click **Create a Project**
2. Name your project (e.g., "College Notice Board")
3. Click **Create Project**
4. Click **Create a Cluster**
5. Choose **Free** tier (M0)
6. Select your preferred region
7. Click **Create Cluster**
8. Wait for cluster to be created (takes 1-2 minutes)

## Step 3: Set Up Database Access

1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Choose **Username and Password** authentication
4. Enter a username (e.g., `collegenotice`)
5. Generate a secure password or create your own
6. Set **Database User Privileges** to **Read and write to any database**
7. Click **Add User**

## Step 4: Configure Network Access

1. In the left sidebar, click **Network Access**
2. Click **Add IP Address**
3. Select **Allow access from anywhere** (for development)
   - Or add your specific IP address for production
4. Click **Confirm**

## Step 5: Get Your Connection String

1. Go to **Databases** → **Cluster Overview**
2. Click **Connect** button
3. Choose **Drivers** → **Node.js**
4. Copy the connection string
5. Replace `<username>` with your database user username
6. Replace `<password>` with your database user password
7. Replace `college-notice-board` with your database name

Example connection string:
\`\`\`
mongodb+srv://collegenotice:yourpassword@cluster0.xxxxx.mongodb.net/college-notice-board?retryWrites=true&w=majority
\`\`\`

## Step 6: Set Up Environment Variables

### For Backend:

Create a `.env` file in the `/backend` folder:

\`\`\`env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://collegenotice:yourpassword@cluster0.xxxxx.mongodb.net/college-notice-board?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-secret-key-here

# Port
PORT=5000

# Client URL
CLIENT_URL=http://localhost:5173
\`\`\`

### For Frontend:

Create a `.env` file in the `/frontend` folder:

\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
\`\`\`

## Step 7: Verify Connection

1. Install dependencies:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. You should see in the console:
   \`\`\`
   MongoDB connected successfully
   Connected to: cluster0.xxxxx.mongodb.net
   \`\`\`

## Important Notes

- **Never commit `.env` files** to version control (already in .gitignore)
- Keep your database credentials secure
- Use a strong password for your database user
- For production, use IP whitelisting instead of allowing all IPs
- MongoDB Atlas provides 512MB free storage (sufficient for development)

## Troubleshooting

### Connection Error: "connect ECONNREFUSED"
- Verify your connection string is correct
- Check if you've added your IP address to Network Access
- Ensure your username and password are correct

### Connection Error: "bad auth"
- Your username or password might be incorrect
- Try resetting your database user password in MongoDB Atlas

### Slow Connection
- Check your internet connection
- Verify cluster is not in a region far from your location
- Consider upgrading to a paid tier for better performance

## File Upload Storage

All files and images uploaded by admin are stored directly in MongoDB as binary data with metadata, making it easier to manage without external storage services.
