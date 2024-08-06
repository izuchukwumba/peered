import "./Files.css";
import axios from "axios";
import { Text, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Files() {
  const [allFilesCreated, setAllFilesCreated] = useState();
  const token = localStorage.getItem("jwt");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const { username } = useParams();
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/auth/user/${username}/get-user-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setAllFilesCreated(response.data.files_created);
    } catch (error) {
      throw new Error();
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);
  const navigate = useNavigate();
  function handleOpenFile(groupId, fileId) {
    navigate(`/${username}/group/${groupId}/files/${fileId}/workstation`);
  }
  return (
    <div id="Files">
      <Text
        pt={4}
        pl={10}
        fontWeight={"bold"}
        fontSize={20}
        color={"#97e8a9"}
        position={"absolute"}
        bg={"#0f0a19"}
        w={"72%"}
        pb={4}
      >
        Files
      </Text>
      <Box className="file-list-home" mt={16}>
        {allFilesCreated && allFilesCreated.length > 0 ? (
          allFilesCreated.map((file, index) => {
            return (
              <div
                onClick={() => handleOpenFile(file.groupId, file.id)}
                key={index}
                className="file-item-home"
              >
                <i className="fa-solid fa-file file-icon"></i>
                <div className="file-name-home">{file.fileName}</div>
              </div>
            );
          })
        ) : (
          <div className="no-files">No files created yet.</div>
        )}
      </Box>
    </div>
  );
}
export default Files;
