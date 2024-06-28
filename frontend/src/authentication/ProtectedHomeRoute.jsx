import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthenticated } from "../contexts/authenticatedContext";

const ProtectedHomeRoute = ({ children }) => {
  const { isUserAuthenticated, setIsUserAuthenticated } = useAuthenticated();

  const token = Cookies.get("jwt");
  if (!token) {
    return <Navigate to="/login" />;
  }
  setIsUserAuthenticated(true);
  return children;
};
export default ProtectedHomeRoute;
