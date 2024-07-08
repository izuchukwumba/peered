import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const authenticatedContext = createContext();
export const useAuthenticatedContext = () => useContext(authenticatedContext);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthenticatedContextProvider = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = async () => {
    let token = localStorage.getItem("jwt");
    console.log(token);
    try {
      if (token) {
        setIsUserAuthenticated(true);
      } else {
        setIsUserAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.log("Failed to authenticate request:", error);
    }
  };

  useEffect(() => {
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

export default AuthenticatedContextProvider;
