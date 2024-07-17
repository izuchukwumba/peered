import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../app/Nav";
import Footer from "../app/Footer";
import CodeIDE from "./CodeIDE";
import { useParams } from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";

function WorkStation() {
  const [groupData, setGroupData] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [error, setError] = useState("");
  const { groupId, fileId } = useParams();

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
      <Text>Welcome to {groupData.groupName} Code Group</Text>
      <Nav />
      <Box>
        <CodeIDE fileContent={fileData.fileContent} />
      </Box>
      <div>This is group: {groupData.groupName}</div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <Footer />
    </Box>
  );
}

export default WorkStation;
