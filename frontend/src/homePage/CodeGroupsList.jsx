import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CodeGroupsList.css";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

function CodeGroups() {
  const [allGroups, setAllGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState("");
  const [groupImageQuery, setGroupImageQuery] = useState("");
  const [groupImageUrl, setGroupImageUrl] = useState("");
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [category, setCategory] = useState([]);
  const [preferredAvailability, setPreferredAvailability] = useState("");
  const [newGroupId, setNewGroupId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const {
    isOpen: isCreateGroupModalOpen,
    onOpen: onCreatGroupModalOpen,
    onClose: onCreateGroupModalClose,
  } = useDisclosure();
  const {
    isOpen: isGroupDetailsModalOpen,
    onOpen: onGroupDetailsModalOpen,
    onClose: onGroupDetailsModalClose,
  } = useDisclosure();
  const {
    isOpen: isRecommendationModalOpen,
    onOpen: onRecommendationOpen,
    onClose: onRecommendationClose,
  } = useDisclosure();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("jwt");
  const navigate = useNavigate();
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const getGroupImageUrl = async (query, width, height) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/search-for-image?query=${
          ("team ", query)
        }&width=${width}&height=${height}`
      );
      const data = await response.json();
      setGroupImageUrl(data);
    } catch (error) {
      setError("Error fetching group image");
    }
  };

  const getGroups = async () => {
    try {
      const createdGroups = await axios.get(
        `${BACKEND_URL}/api/user/created-groups`,
        options
      );
      const groupsAddedTo = await axios.get(
        `${BACKEND_URL}/api/user/groups-added-to`,
        options
      );
      setAllGroups([...createdGroups.data, ...groupsAddedTo.data]);
    } catch (error) {
      setError("Error Fetching Groups.");
    }
  };

  const closeModal = () => {
    setGroupImageQuery("");
    setGroupImageUrl("");
    setGroupName("");
    setMemberInput([]);
    setMembers([]);
    onCreateGroupModalClose();
  };

  useEffect(() => {
    setAllGroups([]);
    if (!token) {
      navigate("/login");
    }
    groupImageQuery && getGroupImageUrl(groupImageQuery, 200, 500);
    getGroups();
  }, [token, BACKEND_URL, groupImageQuery]);

  const handleAddMembers = () => {
    if (memberInput) {
      setMembers([...members, memberInput]);
      setMemberInput("");
    }
  };

  const handleCreateNewGroup = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/new/code-group`,
        { groupName, members, imgUrl: groupImageUrl },
        { withCredentials: true }
      );
      setNewGroupId(response.data.group.id);
      getGroups();
    } catch (error) {
      setError("Error Creating Group. Try again");
    } finally {
      setGroupImageQuery("");
      setGroupImageUrl("");
      setMembers([]);
      onCreateGroupModalClose();
      onGroupDetailsModalOpen();
    }
  };

  function handleChange(event, setValue) {
    event.preventDefault();
    setValue(event.target.value);
  }
  function handleCheckbox(event, setValue) {
    const value = event.target.value;
    setValue((prev) => {
      if (prev?.includes(value)) {
        return prev.filter((val) => val !== value);
      } else {
        return [...prev, value];
      }
    });
  }

  const handleRecommendUsers = async (groupId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/recommendations/${groupId}`
      );
      setRecommendations(response.data);
    } catch (error) {
      setError(error);
    }
  };

  const handleAddGroupDetails = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/group/${newGroupId}/update-code-group`,
        { preferredAvailability, category, preferredSkills },
        options
      );
    } catch (error) {
      setError(error);
    } finally {
      setPreferredAvailability("");
      setCategory([]);
      setPreferredSkills([]);
      onGroupDetailsModalClose();
      onRecommendationOpen();
      handleRecommendUsers(newGroupId);
    }
  };
  const handleSelectRecommendedUser = (item) => {
    if (!members.includes(item)) {
      setMembers((prev) => [...prev, item]);
    }
  };
  const removeSelectedUsers = (item) => {
    if (members.includes(item)) {
      setMembers((prev) => prev.filter((user) => user !== item));
    }
  };
  const handleAddRecommendedUsers = async (groupId) => {
    const newMembers = members;
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/group/${groupId}/update-code-group`,
        { newMembers },
        options
      );
    } catch (error) {
      setError("Error updating group details");
    } finally {
      onRecommendationClose();
      navigate(`/group/${groupId}`);
    }
  };

  return (
    <div id="CodeGroups">
      <Button onClick={onCreatGroupModalOpen} mt={4} ml={2}>
        Create New Code Group
      </Button>
      <div className="home-group-list">
        {allGroups.map((group, index) => (
          <div
            className="home-group-list-item"
            key={index}
            onClick={() => handleGroupClick(group.id)}
          >
            <img src={group.imgUrl} alt={group.groupName} />
            <div>{group.groupName}</div>
            <div>
              Created by {group.creator.username} at {""}
              {new Date(group.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isCreateGroupModalOpen} onClose={onCreateGroupModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Code Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleCreateNewGroup}>
              <Box mb={4}>
                <label>Group Name</label>
                <Input
                  mt={2}
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </Box>
              <Box mb={6}>
                <label>Add Members</label>
                <Input
                  mt={2}
                  type="text"
                  value={memberInput}
                  placeholder="optional"
                  onChange={(e) => setMemberInput(e.target.value)}
                />
                <Button mt={2} mb={4} onClick={() => handleAddMembers()}>
                  Add to queue
                </Button>
                <ul>
                  {members.map((member, index) => (
                    <li key={index}>
                      <Text fontSize={20}>
                        {member}
                        <Button
                          style={{ display: "inline" }}
                          ml={4}
                          mb={4}
                          type="button"
                          onClick={() => removeSelectedUsers(member)}
                        >
                          &times;
                        </Button>
                      </Text>
                    </li>
                  ))}
                </ul>
              </Box>

              <Box mb={4}>
                <label>Describe your team with one word</label>
                <Input
                  mt={2}
                  type="text"
                  value={groupImageQuery}
                  onChange={(e) => setGroupImageQuery(e.target.value)}
                  required
                />
              </Box>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeModal}>
              Close
            </Button>
            <Button type="submit" onClick={handleCreateNewGroup}>
              Create New Code Group
            </Button>
          </ModalFooter>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isGroupDetailsModalOpen}
        onClose={onGroupDetailsModalClose}
      >
        <ModalOverlay />
        <ModalContent minWidth={"fit-content"}>
          <ModalHeader>Add Group Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb={6}>
              <Text mb={2}>What Tech Category is Your Project In?</Text>
              <Select
                placeholder="Select option"
                value={category}
                onChange={(event) => setCategory([event.target.value])}
              >
                <option value="Frontend Development">
                  Frontend Development
                </option>
                <option value="Backend Development">Backend Development</option>
                <option value="Fullstack Development">
                  Fullstack Development
                </option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Hardware/IoT">Hardware/IoT</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Game Development">Game Development</option>
                <option value="Embedded Systems">Embedded Systems</option>
                <option value="Enterprise Software">Enterprise Software</option>
                <option value="Open Source">Open Source</option>
              </Select>
            </Box>
            <Box mb={6}>
              <Text mb={2}>What Skills Are Best Suited For Your Project? </Text>{" "}
              <CheckboxGroup
                colorScheme="green"
                onChange={() => handleCheckbox(event, setPreferredSkills)}
                value={preferredSkills}
              >
                <HStack spacing={10}>
                  <Stack>
                    <Checkbox value="Javascript">Javascript</Checkbox>
                    <Checkbox value="Python">Python</Checkbox>
                    <Checkbox value="C#">C#</Checkbox>
                    <Checkbox value="PHP">PHP</Checkbox>
                  </Stack>
                  <Stack>
                    <Checkbox value="Java">Java</Checkbox>
                    <Checkbox value="Typescript">Typescript</Checkbox>
                    <Checkbox value="Go">Go</Checkbox>
                    <Checkbox value="C++">C++</Checkbox>
                  </Stack>
                  <Stack>
                    <Checkbox value="Rust">Rust</Checkbox>
                    <Checkbox value="MongoDB">MongoDB</Checkbox>
                    <Checkbox value="SQL">SQL</Checkbox>
                    <Checkbox value="HTML/CSS">HTML/CSS</Checkbox>
                  </Stack>
                  <Checkbox value="React">React</Checkbox>
                </HStack>
              </CheckboxGroup>
            </Box>
            <Box mb={6}>
              <Text mb={2}>
                How often would you want your peers to work on this?
              </Text>{" "}
              <RadioGroup
                colorScheme="green"
                onChange={() => handleChange(event, setPreferredAvailability)}
                value={preferredAvailability}
              >
                <Stack direction="column">
                  <Radio value="low">1-3 hours per week</Radio>
                  <Radio value="mid">3-6 hours per week</Radio>
                  <Radio value="high">6-10 hours per week</Radio>
                  <Radio value="highest">More than 10 hours per week</Radio>
                </Stack>
              </RadioGroup>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddGroupDetails}>
              Add Group Details{" "}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isRecommendationModalOpen}
        onClose={onRecommendationClose}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent minWidth={"fit-content"}>
          <ModalHeader>Recommended Code Peers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              {recommendations && recommendations.length > 0
                ? recommendations?.map((item, index) => {
                    return (
                      <Box key={index}>
                        <Box display={"inline"} fontSize={15} mr={6}>
                          {item.user.fullName}
                        </Box>
                        <Box display={"inline"} fontSize={12} mr={6}>
                          {item.user.username}&nbsp;
                        </Box>
                        <Box display={"inline"} fontSize={12} mr={6}>
                          {item.score * 100}% match
                        </Box>
                        <span
                          onClick={() =>
                            handleSelectRecommendedUser(item.user.username)
                          }
                        >
                          <Button>add to queue</Button>
                        </span>
                      </Box>
                    );
                  })
                : "No users fit your required profile. Search and manually"}
            </div>
            {members.length > 0 && (
              <Text fontSize={25} mt={4} fontWeight={900}>
                Queue
              </Text>
            )}
            {members.length > 0 &&
              members.map((user, index) => {
                return (
                  <div key={index}>
                    {user}&nbsp;&nbsp;&nbsp;
                    <Button onClick={() => removeSelectedUsers(user)}>
                      &times;
                    </Button>
                  </div>
                );
              })}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleAddRecommendedUsers(newGroupId)}
            >
              Add Users to Code Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
export default CodeGroups;
