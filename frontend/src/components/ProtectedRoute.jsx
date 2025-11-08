import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, user }) {
  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoute
