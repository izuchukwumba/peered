import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../contexts/userInfoContext";
import { useAuthenticated } from "../contexts/authenticatedContext";
import "./Home";

function Home() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { isUserAuthenticated, setIsUserAuthenticated } = useAuthenticated();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userInfo");
    Cookies.remove("jwt");

    fetch(`${BACKEND_URL}/auth/github/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setIsUserAuthenticated(false);
          navigate("/");
        }
      })
      .catch((error) => {
        console.log("Try again. Error while logging out logout:", error);
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
