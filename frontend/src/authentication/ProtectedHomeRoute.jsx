import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";

const ProtectedHomeRoute = ({ children }) => {
  const { isUserAuthenticated } = useAuthenticatedContext();

  const token = Cookies.get("jwt");

  if (isUserAuthenticated || token) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};
export default ProtectedHomeRoute;
