import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

function GithubAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt");

    if (token) {
      localStorage.setItem("jwt", token);
      const decodedToken = jwtDecode(token);
      localStorage.setItem("userInfo", JSON.stringify(decodedToken.userInfo));
      navigate("/");
    } else {
      navigate("/");
    }
  }, [navigate]);
  return <div>Loading...</div>;
}

export default GithubAuthCallback;
