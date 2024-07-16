import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationContext";
import { Button } from "@chakra-ui/react";
import "./Notifications.css";

function Notification() {
  const { notifications, setNotifications } = useNotifications();
  const [parsedNotifs, setParsedNotifs] = useState([]);

  useEffect(() => {
    setParsedNotifs([]);
    for (const notif in notifications) {
      setParsedNotifs((prev) => [
        ...prev,
        JSON.parse(notifications[notif].data),
      ]);
    }
  }, [notifications.length]);

  const navigate = useNavigate();
  const goToFile = (groupId, fileId) =>
    navigate(`/group/${groupId}/files/${fileId}/workstation`);
  const goToCodeGroup = (groupId) => navigate(`/group/${groupId}`);

  return (
    <div id="Notifications">
      <h1>Notifications</h1>
      <div id="notifs">
        {parsedNotifs.length > 0 &&
          parsedNotifs.map((notif, index) => {
            return (
              <Button
                key={index}
                onClick={
                  notif.category === "added_to_code_group" ||
                  notif.category === "file_deleted"
                    ? () => goToCodeGroup(notif.groupId)
                    : notif.category === "file_created" ||
                      notif.category === "file_updated"
                    ? () => goToFile(notif.groupId, notif.fileId)
                    : ""
                }
              >
                {notif.message}
              </Button>
            );
          })}
      </div>
    </div>
  );
}

export default Notification;
