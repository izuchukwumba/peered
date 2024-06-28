import React, { createContext, useState, useContext } from "react";

const authenticatedContext = createContext([]);
export const useAuthenticated = () => useContext(authenticatedContext);

const AuthenticatedContextProvider = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  return (
    <authenticatedContext.Provider
      value={{ isUserAuthenticated, setIsUserAuthenticated }}
    >
      {children}
    </authenticatedContext.Provider>
  );
};

export default AuthenticatedContextProvider;
