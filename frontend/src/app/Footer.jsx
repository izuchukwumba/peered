import { useState } from "react";
import { Button } from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";
import "./Footer.css";

function Footer() {
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
    <div id="Footer">
      {isUserAuthenticated && "Logged in"}
      <Button colorScheme="red" className="btn" onClick={handleLogout}>
        Logout
      </Button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default Footer;
