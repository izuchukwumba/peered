import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { notif_categories } from "../notification/notif_categories_frontend";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import logo from "../../assets/logo.png";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useNotifications } from "../notification/NotificationContext";

const token = localStorage.getItem("jwt");
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
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
  const { notifications, getNotifications } = useNotifications();
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
  const {
    isOpen: isAvatarOpen,
    onOpen: onAvatarOpen,
    onClose: onAvatarClose,
  } = useDisclosure();
  const Links = ["Dashboard", "Projects", "Team"];

  const NavLink = (props) => {
    const { children } = props;

    return (
      <Box
        as="a"
        px={6}
        py={2}
        color={"#97e8a9"}
        bg={"gray.700"}
        rounded={"md"}
        border={"1px solid"}
        borderColor={"gray"}
        _hover={{
          textDecoration: "none",
          bg: "#97e8a9",
          color: "black",
        }}
        href={"#"}
      >
        {children}
      </Box>
    );
  };

  function Simple() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
      <Box bg={useColorModeValue("gray.100", "gray.900")} pl={6} pr={8} py={2}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box>
              <Image boxSize="60px" src={logo} alt="logo" mr={6} />
            </Box>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              <NavLink>{"Home"}</NavLink>
              <NavLink>{"Projects"}</NavLink>
              <NavLink>{"CodeGroups"}</NavLink>
              <NavLink>{"Workstation"}</NavLink>
              <NavLink>{"Teammates"}</NavLink>
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <span style={{ cursor: "pointer" }}>
              <i
                className="fa-solid fa-bell"
                style={{ fontSize: "20px", color: "#97e8a9" }}
                onClick={onNotifModalOpen}
              ></i>
            </span>
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar
                  size={"md"}
                  src={userInfo?.imageUrl}
                  ml={8}
                  border={"0.5px solid #97e8a9"}
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem> <MenuDivider />
                <MenuItem>Settings</MenuItem>
                <MenuDivider />
                <MenuItem>Log out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              <NavLink>{"Home"}</NavLink>
              <NavLink>{"Projects"}</NavLink>
              <NavLink>{"CodeGroups"}</NavLink>
              <NavLink>{"Workstation"}</NavLink>
              <NavLink>{"Teammates"}</NavLink>
            </Stack>
          </Box>
        ) : null}
      </Box>
    );
  }
  return (
    <Box
      id="Nav"
      position={"fixed"}
      w={"100%"}
      zIndex={2}
      borderBottom={"0.5px solid #97e8a9"}
      boxShadow={"#97e8a9 0px 0.3px 10px"}
    >
      <Simple />

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
            <Button colorScheme="blue" mr={3} onClick={onNotifModalClose}>
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
    </Box>
  );
}

export default Nav;
