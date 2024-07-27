import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function GithubAuthCallback() {
  const navigate = useNavigate();

  const fetchUserInfo = async (username, token) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/auth/user/${username}/get-user-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data));
    } catch (error) {
      throw new Error();
    }
  };

  useEffect(() => {
    const token = Cookies.get("jwt");
    if (token) {
      localStorage.setItem("jwt", token);
      const decodedToken = jwtDecode(token);
      fetchUserInfo(decodedToken.username, token);
      navigate("/");
    } else {
      navigate("/");
    }
  }, [navigate]);
  return <div>Loading...</div>;
}

export default GithubAuthCallback;
