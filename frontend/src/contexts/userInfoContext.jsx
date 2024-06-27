import React, { createContext, useState, useContext } from "react";

const userInfoContext = createContext([]);
export const useUserInfo = () => useContext(userInfoContext);

const UserInfoContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  return (
    <userInfoContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </userInfoContext.Provider>
  );
};

export default UserInfoContextProvider;
