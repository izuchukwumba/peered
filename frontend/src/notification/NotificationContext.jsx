import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { socket_names } from "./notif_categories_frontend";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const token = localStorage.getItem("jwt");
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL, {
  withCredentials: true,
});

const NotificationContext = createContext();
export const useNotifications = () => {
  return useContext(NotificationContext);
};

const NotificationProvider = ({ children }) => {
  const [userId, setUserId] = useState();
  const [notifications, setNotifications] = useState([]);
  const [rateLimiterMessage, setRateLimiterMessage] = useState("");
  const [error, setError] = useState("");

  const getNotifications = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/notif/get-all-notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setNotifications(response.data);
    } catch (error) {
      setError("Error fetching notifications");
    }
  };

  const notifReload = (socket_name) => {
    socket.on(socket_name, (data) => {
      getNotifications();
    });
  };

  useEffect(() => {
    getNotifications();
    userInfo && setUserId(userInfo.id);
    if (userId) {
      socket.emit(socket_names.register, userId);
    }
    notifReload(socket_names.group_notifications);
    notifReload(socket_names.added_user_to_group);
    socket.on(socket_names.rate_limit, (data) => {
      setRateLimiterMessage(data);
    });
  }, [socket, userId]);
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        getNotifications,
        rateLimiterMessage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
