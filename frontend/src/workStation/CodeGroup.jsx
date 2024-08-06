import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../app/Nav";
import Footer from "../app/Footer";
import "./CodeGroup.css";
import BackButton from "../app/BackButton";
import Loading from "../app/Loading";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";

function CodeGroup() {
  const [groupData, setGroupdata] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupImageUrl, setNewGroupImageUrl] = useState("");
  const [newMemberInput, setNewMemberInput] = useState("");
  const [newMembers, setNewMembers] = useState([]);
  const [newFileName, setNewFileName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isOpen: isUpdateGroupModalOpen,
    onOpen: onUpdateGroupModalOpen,
    onClose: onUpdateGroupModalClose,
  } = useDisclosure();
  const {
    isOpen: isAddMembersModalOpen,
    onOpen: onAddMembersModalOpen,
    onClose: onAddMembersModalClose,
  } = useDisclosure();
  const {
    isOpen: isCreateNewFileModalOpen,
    onOpen: onCreateNewFileModalOpen,
    onClose: onCreateNewFileModalClose,
  } = useDisclosure();

  const { groupId, username } = useParams();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("jwt");
  const navigate = useNavigate();
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };
  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/group/${groupId}`,
        options
      );
      setGroupdata(response.data);
      setAllFiles(response.data.files);
      setAllMembers(response.data.members);
    } catch (error) {
      setError("Error fetching group details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  const handleUpdateGroupDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${BACKEND_URL}/api/group/${groupId}/update-code-group`,
        { newGroupName, newGroupImageUrl, newMembers },
        options
      );
    } catch (error) {
      setError("Error updating group details");
    } finally {
      onUpdateGroupModalClose();
      onAddMembersModalClose();
      setNewGroupName("");
      setNewGroupImageUrl("");
      setNewMembers([]);
      fetchGroupDetails();
      setIsLoading(false);
    }
  };

  function handleAddNewMemberToList() {
    if (newMemberInput && !newMembers.includes(newMemberInput)) {
      setNewMembers([...newMembers, newMemberInput]);
      setNewMemberInput("");
    } else {
      setError("Member is already added to list, or input is empty.");
    }
  }

  function handleRemoveNewMemberToList(memberUsername) {
    setNewMembers(newMembers.filter((member) => member !== memberUsername));
  }

  const handleCreateNewFile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/group/${groupId}/create-new-file`,
        { newFileName },
        options
      );
    } catch (error) {
      setError("Error Creating File. Try again");
    } finally {
      setNewFileName("");
      fetchGroupDetails();
      onCreateNewFileModalClose();
      setIsLoading(false);
    }
  };

  function handleOpenFile(fileId) {
    navigate(`/${username}/group/${groupId}/files/${fileId}/workstation`);
  }

  const handleDeleteFile = async (fileId) => {
    try {
      setIsLoading(true);
      await axios.delete(
        `${BACKEND_URL}/group/${groupId}/files/${fileId}/delete-file`,
        options
      );
      fetchGroupDetails();
      alert(`File deleted`);
    } catch (error) {
      setError("Error deleting file");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUserProfileClick = (username) => {
    navigate(`/user/${username}/profile`);
  };

  return (
    <Box>
      <Nav />
      <Box
        pt={24}
        pb={0}
        bgImg={groupData.imgUrl}
        className="code-group-main"
        pl={2}
        pr={3}
      >
        <div className="background-overlay"></div>
        <Box display={"flex"} alignItems={"center"}>
          <BackButton />
          <Box position={"relative"} fontSize={40} ml={6}>
            Welcome to{" "}
            <span style={{ color: "#97e8a9", fontWeight: "bold" }}>
              {groupData.groupName}
            </span>{" "}
            code group
          </Box>
        </Box>
        <Button mt={4} className="btn" onClick={onUpdateGroupModalOpen}>
          Update Group
        </Button>
        <HStack mt={4} pb={4}>
          <Box
            w="70%"
            id="code-group-files"
            minH="67vh"
            maxH={"67vh"}
            p={2}
            border="0.1px solid #97e8a9"
            borderRadius={4}
            position={"relative"}
            overflowY={"scroll"}
          >
            <Box m={4}>
              <Box display={"flex"} gap={10}>
                <div style={{ fontSize: "2rem", color: "white" }}>Files</div>
                <Box
                  className="btn"
                  onClick={onCreateNewFileModalOpen}
                  mb={6}
                  mt={2}
                  px={4}
                  py={2}
                  bg={"#97e8a9"}
                  color={"black"}
                  fontWeight={500}
                >
                  Create New File
                </Box>
              </Box>
              {isLoading ? (
                <Loading />
              ) : (
                <div className="file-list">
                  {allFiles?.length > 0
                    ? allFiles.map((file, index) => {
                        return (
                          <div key={index} class="file-list-item">
                            <div className="tooltip">
                              <div className="file-item">
                                <div
                                  className="file-item-main"
                                  onClick={() => handleOpenFile(file.id)}
                                >
                                  <i className="fa-solid fa-file file-icon"></i>
                                  <div className="file-name">
                                    {file.fileName}
                                  </div>
                                </div>
                                <span>
                                  <Text
                                    onClick={() => handleDeleteFile(file.id)}
                                    fontSize={12}
                                    bg={"gray.700"}
                                    px={2}
                                    borderRadius={"lg"}
                                  >
                                    Delete file
                                  </Text>
                                </span>
                              </div>
                              <span className="tooltip-text">
                                Created by {file?.creator?.fullName}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    : "No file created yet."}
                </div>
              )}
            </Box>
          </Box>
          <Box
            ml={10}
            pt={6}
            px={4}
            w="30%"
            id="code-group-group-members"
            minH="67vh"
            maxH={"67vh"}
            border="0.1px solid #97e8a9"
            borderRadius={4}
            position={"relative"}
            overflowY={"scroll"}
          >
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"bottom"}
              justifyContent={"space-between"}
            >
              <div style={{ fontSize: "2rem", color: "white" }}>Members</div>
              <Box
                className="btn"
                onClick={onAddMembersModalOpen}
                mb={4}
                px={4}
                py={2}
                bg={"#97e8a9"}
                color={"black"}
                fontWeight={500}
              >
                Add More Members
              </Box>
            </Box>

            <Box mt={4}>
              {groupData.id ? (
                <div>
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <ul>
                      <Box
                        onClick={() =>
                          handleUserProfileClick(groupData.creator.username)
                        }
                        bg={"rgba(149, 148, 148, 0.4)"}
                        w={"fit-content"}
                        px={10}
                        py={2}
                        mb={4}
                        cursor={"pointer"}
                      >
                        {groupData.creator.fullName}&nbsp;&nbsp;(creator)
                      </Box>
                      {allMembers.map((member, index) => {
                        return (
                          <Box
                            key={index}
                            onClick={() =>
                              handleUserProfileClick(member.user.username)
                            }
                            bg={"rgba(149, 148, 148, 0.4)"}
                            w={"fit-content"}
                            px={10}
                            py={2}
                            mb={4}
                            cursor={"pointer"}
                          >
                            {member.user.fullName}
                          </Box>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                "Fetching Group Data..."
              )}
            </Box>
          </Box>
        </HStack>
        <Modal
          isOpen={isUpdateGroupModalOpen}
          onClose={onUpdateGroupModalClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Group Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div>
                <label>New Group Name: </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Optional"
                  className="updateGroupInput"
                />
              </div>
              <div>
                <label>New Group Image Url: </label>
                <input
                  type="text"
                  value={newGroupImageUrl}
                  onChange={(e) => setNewGroupImageUrl(e.target.value)}
                  placeholder="Optional"
                  className="updateGroupInput"
                />
              </div>
              <div>
                <label>Add New Members </label>
                <input
                  type="text"
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  placeholder="Type username"
                  className="updateGroupInput"
                />
                <Button variant="outline" onClick={handleAddNewMemberToList}>
                  Add member
                </Button>
                {newMembers.length > 0 && (
                  <ul>
                    {newMembers.map((member, index) => {
                      return (
                        <li key={index}>
                          {member} &nbsp;&nbsp;&nbsp;&nbsp;
                          <span
                            onClick={() => handleRemoveNewMemberToList(member)}
                          >
                            &times;
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleUpdateGroupDetails}
              >
                Update Group
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={isAddMembersModalOpen} onClose={onAddMembersModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add More Members</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div>
                <label>Add New Members </label>
                <input
                  type="text"
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  placeholder="type username"
                  className="updateGroupInput"
                />
                <Button variant="outline" onClick={handleAddNewMemberToList}>
                  Add to queue
                </Button>
                {newMembers.length > 0 && (
                  <ul>
                    {newMembers.map((member, index) => {
                      return (
                        <li key={index}>
                          {member} &nbsp;&nbsp;&nbsp;&nbsp;
                          <span
                            onClick={() => handleRemoveNewMemberToList(member)}
                          >
                            &times;
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleUpdateGroupDetails}
              >
                Add Members
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isCreateNewFileModalOpen}
          onClose={onCreateNewFileModalClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New File</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div>
                <label>New File Name </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="type file name"
                  className="updateGroupInput"
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleCreateNewFile}>
                Create New File
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {error && <div style={{ color: "red" }}>{error}</div>}
      </Box>{" "}
      <Footer />
    </Box>
  );
}

export default CodeGroup;
