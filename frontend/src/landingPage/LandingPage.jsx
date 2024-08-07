import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";
import "./LandingPage.css";

function LandingPage() {
  const { isUserAuthenticated, setIsUserAuthenticated } =
    useAuthenticatedContext();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const token2 = localStorage.getItem("jwt");
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (isUserAuthenticated || token || token2) {
      setIsUserAuthenticated(true);
      navigate(`/${userInfo.username}/home`);
    } else {
      navigate("/login");
    }
  }, []);

  return <div id="LandingPage">Loading...</div>;
}

export default LandingPage;
