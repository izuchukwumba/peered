import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../app/Nav";
import Footer from "../app/Footer";
import CodeIDE from "./CodeIDE";
import { useParams } from "react-router-dom";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  Button,
  Box,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import BackButton from "../app/BackButton";
import Chatbot from "./Chatbot";
import "./Workstation.css";

function WorkStation() {
  const [groupData, setGroupData] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [error, setError] = useState("");
  const { groupId, fileId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("jwt");

  const fetchGroupDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setGroupData(response.data);
    } catch (error) {
      setError("Error fetching group details");
    }
  };
  const fetchFileDetails = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/group/${groupId}/files/${fileId}/get-file-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setFileData("");
      setFileData(response.data);
    } catch (error) {
      setError("Error fetching file details");
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchFileDetails();
  }, []);

  return (
    <Box id="WorkStation">
      <Nav />
      <Box mx={4} pt={24}>
        <Box display={"flex"} alignItems={"center"} mb={6}>
          <BackButton />
          <Box fontSize={17} ml={6}>
            Code Group:{" "}
            <span style={{ fontWeight: 700, color: "#97e8a9" }}>
              {groupData.groupName}
            </span>
          </Box>
        </Box>
        <Box>
          <CodeIDE fileContent={fileData.fileContent} />
        </Box>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </Box>
      <Box className="ai-btn" onClick={onOpen}>
        <Text>AI </Text>
        <Text>Chatbot</Text>
      </Box>

      <Footer />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent width={"500px"} maxWidth={"600px"}>
          <ModalHeader>Peered AI Chatbot</ModalHeader>
          <ModalCloseButton />
          <ModalBody width="100%">
            <Chatbot />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default WorkStation;
