import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../app/Nav";
import Footer from "../app/Footer";
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

  const { groupId } = useParams();
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
      const response = await axios.get(
        `${BACKEND_URL}/api/group/${groupId}`,
        options
      );
      setGroupdata(response.data);
      setAllFiles(response.data.files);
      setAllMembers(response.data.members);
    } catch (error) {
      setError("Error fetching group details");
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  const handleUpdateGroupDetails = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/group/${groupId}/update-code-group`,
        { newGroupName, newGroupImageUrl, newMembers },
        options
      );
    } catch (error) {
      setError("Error updating group details");
    } finally {
      setNewGroupName("");
      setNewGroupImageUrl("");
      setNewMembers([]);
      fetchGroupDetails();
      onUpdateGroupModalClose();
      onAddMembersModalClose();
    }
  };

  function handleAddNewMemberToList() {
    if (newMemberInput) {
      setNewMembers([...newMembers, newMemberInput]);
      setNewMemberInput("");
    }
  }

  function handleRemoveNewMemberToList(memberUsername) {
    setNewMembers(newMembers.filter((member) => member !== memberUsername));
  }

  const handleCreateNewFile = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/group/${groupId}/create-new-file`,
        { newFileName },
        options
      );
    } catch (error) {
      setError("Error Creating Group. Try again");
    } finally {
      setNewFileName("");
      fetchGroupDetails();
      onCreateNewFileModalClose();
    }
  };

  function handleOpenFile(fileId) {
    navigate(`/group/${groupId}/files/${fileId}/workstation`);
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(
        `${BACKEND_URL}/group/${groupId}/files/${fileId}/delete-file`,
        options
      );
      fetchGroupDetails();
      alert(`File deleted`);
    } catch (error) {
      setError("Error deleting file");
    }
  };
  const handleUserProfileClick = (username) => {
    navigate(`/user/${username}/profile`);
  };

  return (
    <Box>
      <Nav />
      <Box>{groupData.groupName}</Box>
      <img
        src={groupData.imgUrl}
        alt={`${(groupData.groupName, "'s image")}`}
      />
      <Button mt={4} className="btn" onClick={onUpdateGroupModalOpen}>
        Update Group
      </Button>
      <HStack mt={4}>
        <Box
          w="50%"
          id="code-group-files"
          height="75vh"
          p={2}
          border="1px solid"
          borderRadius={4}
        >
          <Box m={4}>
            <ul>
              {allFiles?.length > 0
                ? allFiles.map((file, index) => {
                    return (
                      <li key={index}>
                        <span onClick={() => handleOpenFile(file.id)}>
                          {file.fileName} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                        <span onClick={() => handleDeleteFile(file.id)}>
                          delete file
                        </span>
                      </li>
                    );
                  })
                : "No file yet. Create New File"}
            </ul>
          </Box>
          <Button className="btn" onClick={onCreateNewFileModalOpen}>
            Create New File
          </Button>
        </Box>
        <Box
          w="50%"
          id="code-group-group-members"
          height="75vh"
          p={2}
          border="1px solid"
          borderRadius={4}
        >
          <Box m={4}>
            {groupData.id ? (
              <ul>
                <li
                  onClick={() =>
                    handleUserProfileClick(groupData.creator.username)
                  }
                >
                  {groupData.creator.fullName}&nbsp;&nbsp;(creator)
                </li>
                {allMembers.map((member, index) => {
                  return (
                    <li
                      key={index}
                      onClick={() =>
                        handleUserProfileClick(member.user.username)
                      }
                    >
                      {member.user.fullName}
                    </li>
                  );
                })}
              </ul>
            ) : (
              "Fetching Group Data..."
            )}
          </Box>
          <Button className="btn" onClick={onAddMembersModalOpen}>
            Add More Members
          </Button>
        </Box>
      </HStack>
      <Modal isOpen={isUpdateGroupModalOpen} onClose={onUpdateGroupModalClose}>
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
                placeholder="optional"
              />
            </div>
            <div>
              <label>New Group Image Url: </label>
              <input
                type="text"
                value={newGroupImageUrl}
                onChange={(e) => setNewGroupImageUrl(e.target.value)}
                placeholder="optional"
              />
            </div>
            <div>
              <label>Add New Members </label>
              <input
                type="text"
                value={newMemberInput}
                onChange={(e) => setNewMemberInput(e.target.value)}
                placeholder="type username"
              />
              <Button variant="outline" onClick={handleAddNewMemberToList}>
                add member
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
              />
              <Button variant="outline" onClick={handleAddNewMemberToList}>
                add to queue
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
      <Footer />
    </Box>
  );
}

export default CodeGroup;
