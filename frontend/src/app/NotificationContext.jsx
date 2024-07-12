import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const token = localStorage.getItem("jwt");
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL, {
  withCredentials: true,
});

const notifAction = async (socket_name) => {
  socket.on(socket_name, async (data) => {
    const notif_data = JSON.stringify(data);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/notif/new/notification`,
        { data: notif_data },
        { withCredentials: true }
      );
    } catch (error) {
      setError("Error generating new notification");
    }
  });
};
notifAction("notify_group_create_file");
notifAction("notify_group_delete_file");
notifAction("notify_group_update_file");
notifAction("added_user_to_group");

const NotificationContext = createContext();
export const useNotifications = () => {
  return useContext(NotificationContext);
};

const NotificationProvider = ({ children }) => {
  const [userId, setUserId] = useState();
  const [notifications, setNotifications] = useState([]);
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
      socket.emit("register", userId);
    }
    notifReload("notify_group_create_file");
    notifReload("notify_group_update_file");
    notifReload("notify_group_delete_file");
    notifReload("added_user_to_group");
  }, [socket, userId]);
  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
