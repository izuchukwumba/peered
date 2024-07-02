import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const authenticatedContext = createContext();
export const useAuthenticatedContext = () => useContext(authenticatedContext);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthenticatedContextProvider = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/check`, {
          credentials: "include",
        });
        if (response.ok) {
          setIsUserAuthenticated(true);
        } else {
          setIsUserAuthenticated(false);
          navigate("/login");
        }
      } catch (error) {
        console.log("Failed to authenticate request:", error);
      }
    };
    checkAuth();
  }, []);
  const login = () => {
    setIsUserAuthenticated(true);
    navigate("/home");
  };
  const logout = () => {
    setIsUserAuthenticated(false);
    navigate("/login");
  };
  return (
    <authenticatedContext.Provider
      value={{ isUserAuthenticated, setIsUserAuthenticated, login, logout }}
    >
      {children}
    </authenticatedContext.Provider>
  );
};
