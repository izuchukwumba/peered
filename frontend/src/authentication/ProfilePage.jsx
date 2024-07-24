import axios from "axios";
import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Stack,
  HStack,
  Flex,
  AbsoluteCenter,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  CheckboxGroup,
  Checkbox,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import BackButton from "../app/BackButton";
import Nav from "../app/Nav";
import Footer from "../app/Footer";

function ProfilePage() {
  const [userInfo, setUserInfo] = useState([]);
  const [isUser, setIsUser] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState("");
  const [error, setError] = useState("");

  const { username } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("jwt");
  const user_availability =
    userInfo?.availability === "low"
      ? "1-3"
      : userInfo?.availability === "mid"
      ? "3-6"
      : userInfo?.availability === "high"
      ? "6-10"
      : "More than 10";

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
      setUserInfo(response.data);
    } catch (error) {
      setError(
        "Error fetching user information. Refresh the page and try again."
      );
    }
  };

  const loggedInUser = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchUserInfo();
    if (userInfo !== null && loggedInUser?.id == userInfo.id) {
      setIsUser(true);
      setNewFullName(userInfo.fullName);
      setNewImageUrl(userInfo.imageUrl);
      setInterests(userInfo.interests?.map((interest) => interest.Interest));
      setSkills(userInfo.skills?.map((skill) => skill.skill));
      setAvailability(userInfo.availability);
    }
  }, [userInfo.length]);

  if (loggedInUser === userInfo?.id) {
    setIsUser(true);
  }

  function handleChangeAvailability(event) {
    setAvailability(event.target.value);
  }

  function handleCheckbox(event, setValue) {
    const value = event.target.value;
    setValue((prev) => {
      if (prev?.includes(value)) {
        return prev.filter((val) => val !== value);
      } else if (prev) {
        return [...prev, value];
      } else {
        return [value];
      }
    });
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/auth/user/${username}/profile-build`,
        { newFullName, newImageUrl, availability, skills, interests },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      setError("Unable to submit. Try again");
    } finally {
      fetchUserInfo();
      onClose();
    }
  };

  return (
    <Box>
      <Nav />
      <Flex flexDirection={"row"} height="100vh" width="100vw">
        <Stack spacing={100}>
          <BackButton />
          {isUser && <Button onClick={onOpen}>Edit Profile</Button>}
        </Stack>
        <AbsoluteCenter mt={-10}>
          <img
            src={userInfo?.imageUrl}
            alt={`${userInfo?.username}'s profile image`}
          />
          <Stack mt={4} direction={"row"}>
            <Text color={"white"}>Username:</Text>
            <Text>{userInfo?.username}</Text>
          </Stack>
          <Stack mt={2} direction={"row"}>
            <Text color={"white"}>Name:</Text>
            <Text>{userInfo?.fullName}</Text>
          </Stack>
          <Stack mt={2} direction={"row"}>
            <Text color={"white"}>Bio:</Text>
            <Text>{userInfo?.userBio}</Text>
          </Stack>
          <Stack mt={2} direction={"row"}>
            <Text color={"white"}>Email:</Text>
            <Text>{userInfo?.email}</Text>
          </Stack>
          <Stack mt={2} direction={"row"}>
            <Text color={"white"}>Availability:</Text>
            <Text>{user_availability}&nbsp;hours per week</Text>
          </Stack>
          <Box mt={2}>
            <Text color={"white"}>Skills:</Text>
            {userInfo?.skills && (
              <HStack pt={2}>
                {userInfo?.skills.map((skill, index) => {
                  return (
                    <Box
                      mr={2}
                      key={index}
                      border={"0.1px solid"}
                      borderColor={"rgba(255,255,255,0.5)"}
                      borderRadius={8}
                      px={2}
                      py={1}
                    >
                      {skill.skill}
                    </Box>
                  );
                })}
              </HStack>
            )}
          </Box>
          <Box mt={2}>
            <Text color={"white"}>Interested Categories:</Text>
            {userInfo?.interests && (
              <HStack pt={2}>
                {userInfo?.interests.map((interest, index) => {
                  return (
                    <Box
                      key={index}
                      mr={2}
                      border={"0.1px solid"}
                      borderColor={"rgba(255,255,255,0.5)"}
                      borderRadius={8}
                      px={2}
                      py={1}
                    >
                      {interest.Interest}
                    </Box>
                  );
                })}
              </HStack>
            )}
          </Box>{" "}
          <Box mt={2}>
            <Text color={"white"}>CodeGroups Created:</Text>
            {userInfo?.groups_created && (
              <HStack pt={2}>
                {userInfo?.groups_created.map((group, index) => {
                  return (
                    <Box
                      mr={2}
                      key={index}
                      border={"0.1px solid"}
                      borderColor={"rgba(255,255,255,0.5)"}
                      borderRadius={8}
                      px={2}
                      py={1}
                    >
                      {group.groupName}
                    </Box>
                  );
                })}
              </HStack>
            )}
          </Box>
          <Stack mt={2} direction={"row"}>
            <Text color={"white"}>Number of Groups Added to:</Text>
            {userInfo?.groups_added_to && (
              <Text>{userInfo?.groups_added_to.length}</Text>
            )}
          </Stack>
          <Stack mt={2} direction={"row"}>
            <Text color={"white"}>Number of Files Created:</Text>
            {userInfo?.files && <Text>{userInfo?.files.length}</Text>}
          </Stack>{" "}
          <Stack mt={2} direction={"row"}>
            <Text color={"white"}>Member Since:</Text>
            <Text>
              {new Date(userInfo?.createdAt).toLocaleString().split(", ")[0]}
            </Text>
          </Stack>
        </AbsoluteCenter>

        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent minWidth={"fit-content"}>
            <ModalHeader>Edit Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody width="100%">
              <Box>
                <Text>Your New Name:</Text>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(event) => setNewFullName(event.target.value)}
                />
              </Box>
              <Box mt={4}>
                <Text>New ImageURL:</Text>
                <input
                  type="text"
                  value={newImageUrl ? newImageUrl : ""}
                  onChange={(event) => setNewImageUrl(event.target.value)}
                />
              </Box>

              <Box mt={10}>
                <Text color={"white"}>Preferred Categories</Text>
                <Text color="rgba(255,255,255,0.5)">
                  <i>What project categories are you interested in?</i>
                </Text>
                <CheckboxGroup
                  colorScheme="green"
                  onChange={() => handleCheckbox(event, setInterests)}
                  value={interests}
                >
                  <HStack spacing={10}>
                    <Stack>
                      <Checkbox value="Frontend Development">
                        Frontend Development
                      </Checkbox>
                      <Checkbox value="Backend Development">
                        Backend Development
                      </Checkbox>
                      <Checkbox value="Fullstack Development">
                        Fullstack Development
                      </Checkbox>
                      <Checkbox value="Mobile Development">
                        Mobile Development
                      </Checkbox>
                    </Stack>
                    <Stack>
                      <Checkbox value="Data Science">Data Science</Checkbox>
                      <Checkbox value="AI/ML">AI/ML</Checkbox>
                      <Checkbox value="Hardware/IoT">Hardware/IoT</Checkbox>
                      <Checkbox value="Cybersecurity">Cybersecurity</Checkbox>
                    </Stack>
                    <Stack>
                      <Checkbox value="Blockchain">Blockchain</Checkbox>
                      <Checkbox value="Cloud Computing">
                        Cloud Computing
                      </Checkbox>
                      <Checkbox value="Game Development">
                        Game Development
                      </Checkbox>
                      <Checkbox value="Embedded Systems">
                        Embedded Systems
                      </Checkbox>
                    </Stack>
                    <Stack>
                      <Checkbox value="Enterprise Software">
                        Enterprise Software
                      </Checkbox>
                      <Checkbox value="Open Source">Open Source</Checkbox>
                    </Stack>
                  </HStack>
                </CheckboxGroup>
              </Box>

              <Box mt={10}>
                <Text color={"white"}>What is your availability?</Text>
                <Text color="rgba(255,255,255,0.5)">
                  <i>Select one option only</i>
                </Text>
                <RadioGroup
                  colorScheme="green"
                  onChange={() => handleChangeAvailability(event)}
                  value={availability}
                >
                  <Stack direction="column">
                    <Radio value="low">1-3 hours per week</Radio>
                    <Radio value="mid">3-6 hours per week</Radio>
                    <Radio value="high">6-10 hours per week</Radio>
                    <Radio value="highest">More than 10 hours per week</Radio>
                  </Stack>
                </RadioGroup>
              </Box>

              <Box mt={10}>
                <Text color={"white"}>Skills</Text>
                <Text color="rgba(255,255,255,0.5)">
                  <i>What are your skills?</i>
                </Text>
                <CheckboxGroup
                  colorScheme="green"
                  onChange={() => handleCheckbox(event, setSkills)}
                  value={skills}
                >
                  <HStack spacing={20}>
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
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => handleUpdateProfile()}
              >
                Update Profile
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close without saving
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <Footer />
    </Box>
  );
}
export default ProfilePage;
