import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";
import "./Home";

function Home() {
  const [error, setError] = useState("");
  const { logout, isUserAuthenticated } = useAuthenticatedContext();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = () => {
    //General logout
    localStorage.removeItem("jwt");
    localStorage.removeItem("userInfo");
    Cookies.remove("jwt");
    logout();

    //Github logout
    fetch(`${BACKEND_URL}/auth/github/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          logout();
        }
      })
      .catch((error) => {
        setError("Error while logging out. Try again.");
      });
  };

  return (
    <div id="Home">
      {isUserAuthenticated && "Wayo MAn"}
      <button className="btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
export default Home;
