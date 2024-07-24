import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";
import "./LandingPage.css";

function LandingPage() {
  const { isUserAuthenticated, setIsUserAuthenticated } =
    useAuthenticatedContext();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (isUserAuthenticated || token) {
      setIsUserAuthenticated(true);
      navigate("/home");
    } else {
      navigate("/login");
    }
  }, []);

  return <div id="LandingPage">Loading...</div>;
}

export default LandingPage;
