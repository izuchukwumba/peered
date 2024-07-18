import { useEffect } from "react";
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
} from "@chakra-ui/react";
import { useNotifications } from "../notification/NotificationContext";

const token = localStorage.getItem("jwt");
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const updateReadNotifs = async (notifId) => {
  try {
    const response = await axios.put(
      `${BACKEND_URL}/notif/${notifId}/update-read-notifications`,
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
  }
};

function Nav() {
  const { notifications, getNotifications } = useNotifications();
  let offlineNotifications = [];
  offlineNotifications = notifications.filter(
    (notif) => notif.isOffline === true
  );

  const navigate = useNavigate();

  const openWelcomeBackModal = () => {
    onFirstModalOpen();
  };

  const updateAllOfflineNotifs = async (req, res) => {
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
      onSecondModalClose();
    }
  };

  const goToFile = async (notifId, groupId, fileId) => {
    navigate(`/group/${groupId}/files/${fileId}/workstation`);
    updateReadNotifs(notifId);
    updateAllOfflineNotifs();
    getNotifications();
  };
  const goToCodeGroup = (notifId, groupId) => {
    navigate(`/group/${groupId}`);
    updateReadNotifs(notifId);
    updateAllOfflineNotifs();
    getNotifications();
  };

  useEffect(() => {
    if (offlineNotifications.length > 0) {
      openWelcomeBackModal();
    }
  }, [notifications]);

  const {
    isOpen: isFirstModalOpen,
    onOpen: onFirstModalOpen,
    onClose: onFirstModalClose,
  } = useDisclosure();
  const {
    isOpen: isSecondModalOpen,
    onOpen: onSecondModalOpen,
    onClose: onSecondModalClose,
  } = useDisclosure();

  return (
    <div id="Nav">
      <i className="fa-solid fa-bell" onClick={onSecondModalOpen}></i>

      <Modal isOpen={isFirstModalOpen} onClose={onFirstModalClose}>
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
                onFirstModalClose();
                onSecondModalOpen();
              }}
            >
              View All Now
            </Button>
            <Button onClick={onFirstModalClose} variant="outline">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSecondModalOpen} onClose={onSecondModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notifications</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              <div id="notifs">
                {offlineNotifications.length > 0
                  ? notifications.map((notif, index) => {
                      return (
                        <div
                          key={index}
                          onClick={
                            notif.category ===
                              notif_categories.added_to_group ||
                            notif.category === notif_categories.file_deleted
                              ? () => goToCodeGroup(notif.id, notif.groupId)
                              : notif.category ===
                                  notif_categories.file_created ||
                                notif.category === notif_categories.file_updated
                              ? () =>
                                  goToFile(
                                    notif.id,
                                    notif.groupId,
                                    notif.fileId
                                  )
                              : ""
                          }
                          style={{
                            fontWeight: !notif.isRead ? "bold" : "normal",
                            color: notif.isOffline ? "gold" : "white",
                          }}
                        >
                          {notif.message}
                        </div>
                      );
                    })
                  : "Nothing happened while you were away"}
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
    </div>
  );
}

export default Nav;
