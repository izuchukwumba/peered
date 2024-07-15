import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationContext";
import "./Notifications.css";

function Notification() {
  const { notifications, getNotifications } = useNotifications();

  const goToFile = async (notifId, groupId, fileId) => {
    useNavigate()(`/group/${groupId}/files/${fileId}/workstation`);
    updateReadNotifs(notifId);
    getNotifications();
  };
  const goToCodeGroup = (notifId, groupId) => {
    useNavigate()(`/group/${groupId}`);
    updateReadNotifs(notifId);
    getNotifications();
  };

  return (
    <div id="Notifications">
      <h1>Notifications</h1>
      <div id="notifs">
        {notifications.length > 0 &&
          notifications.map((notif, index) => {
            return (
              <div
                key={index}
                onClick={
                  notif.category === "added_to_group" ||
                  notif.category === "file_deleted"
                    ? () => goToCodeGroup(notif.id, notif.groupId)
                    : notif.category === "file_created" ||
                      notif.category === "file_updated"
                    ? () => goToFile(notif.id, notif.groupId, notif.fileId)
                    : ""
                }
                style={{ fontWeight: !notif.isRead ? "bold" : "normal" }}
              >
                {notif.message}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Notification;
