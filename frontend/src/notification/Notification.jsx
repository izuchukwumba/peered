import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationContext";
import { notif_categories } from "./notif_categories_frontend";
import { updateReadNotifs, saveNotificationInteraction } from "../app/Nav";
import "./Notifications.css";

function Notification() {
  const { notifications, getNotifications } = useNotifications();
  const navigate = useNavigate();
  const goToFile = async (notifId, groupId, fileId) => {
    navigate(`/group/${groupId}/files/${fileId}/workstation`);
    updateReadNotifs(notifId);
    getNotifications();
  };
  const goToCodeGroup = (notifId, groupId) => {
    navigate(`/group/${groupId}`);
    updateReadNotifs(notifId);
    getNotifications();
  };
  const handleNotificationClick = (notif) => {
    saveNotificationInteraction(notif.category, notif.id);
    if (
      notif.category === notif_categories.added_to_group ||
      notif.category === notif_categories.file_deleted
    ) {
      goToCodeGroup(notif.id, notif.groupId);
    } else if (
      notif.category === notif_categories.file_created ||
      notif.category === notif_categories.file_updated
    ) {
      goToFile(notif.id, notif.groupId, notif.fileId);
    }
  };

  return (
    <div id="Notifications">
      <h1>Activities</h1>
      <div id="notifs">
        {notifications.length > 0 &&
          notifications.map((notif, index) => {
            return (
              <div
                key={index}
                onClick={() => handleNotificationClick(notif)}
                style={{ fontWeight: !notif.isRead ? "500" : "100" }}
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
