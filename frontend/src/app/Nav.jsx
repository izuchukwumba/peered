import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Nav.css";
import axios from "axios";
import { notif_categories } from "../notification/notif_categories_frontend";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNotifications } from "../notification/NotificationContext";

const token = localStorage.getItem("jwt");
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const options = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true,
};

export const updateReadNotifs = async (notifId) => {
  try {
    const response = await axios.put(
      `${BACKEND_URL}/notif/${notifId}/update-read-notifications`,
      {},
      options
    );
  } catch (error) {
    throw new Error({ error: "Error updating unread notifications" });
  }
};
export const saveNotificationInteraction = async (category, notificationId) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/notif/new-notif-interaction`,
      { category, notificationId },
      options
    );
  } catch (error) {
    throw new Error({ error: "Error saving notifications" });
  }
};

function Nav() {
  const [error, setError] = useState("");
  const { notifications, getNotifications, rateLimiterMessage } =
    useNotifications();
  let offlineNotifications = [];
  offlineNotifications = notifications.filter(
    (notif) => notif.isOffline === true
  );

  const navigate = useNavigate();

  const openWelcomeBackModal = () => {
    onWelcomeBackModalOpen();
  };

  const updateAllOfflineNotifs = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/notif/update-all-offline-notifications`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      setError("Error updating notification");
    } finally {
      getNotifications();
      onOfflineModalClose();
    }
  };

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

  useEffect(() => {
    if (offlineNotifications.length > 0) {
      openWelcomeBackModal();
    }
  }, [notifications]);
  const {
    isOpen: isWelcomeBackModalOpen,
    onOpen: onWelcomeBackModalOpen,
    onClose: onWelcomeBackModalClose,
  } = useDisclosure();
  const {
    isOpen: isNotifModalOpen,
    onOpen: onNotifModalOpen,
    onClose: onNotifModalClose,
  } = useDisclosure();

  const {
    isOpen: isOfflineModalOpen,
    onOpen: onOfflineModalOpen,
    onClose: onOfflineModalClose,
  } = useDisclosure();

  const toast = useToast();
  if (rateLimiterMessage) {
    toast({
      title: "Notification Rate Limit Exceeded",
      description: rateLimiterMessage,
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
  }
  return (
    <div id="Nav">
      <i className="fa-solid fa-bell" onClick={onNotifModalOpen}></i>

      <Modal isOpen={isWelcomeBackModalOpen} onClose={onWelcomeBackModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> Welcome back</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>You had some notifications while you were away.</Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                onWelcomeBackModalClose();
                onOfflineModalOpen();
              }}
            >
              View All Now
            </Button>
            <Button onClick={onWelcomeBackModalClose} variant="outline">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isNotifModalOpen} onClose={onNotifModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notifications</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              <div id="notifs">
                {notifications.length > 0 &&
                  notifications.map((notif, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        {notif.message}
                      </div>
                    );
                  })}
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button mr={4}>Clear All Notifications</Button>
            <Button colorScheme="blue" mr={3} onClick={updateAllOfflineNotifs}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOfflineModalOpen} onClose={onOfflineModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Here's What Happened While You Were Away</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {offlineNotifications.map((notif, index) => {
              return (
                <div key={index} onClick={() => handleNotificationClick(notif)}>
                  {notif.message}
                </div>
              );
            })}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={updateAllOfflineNotifs}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Nav;
