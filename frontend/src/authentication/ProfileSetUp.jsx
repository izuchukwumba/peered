import { useState } from "react";
import axios from "axios";
import Nav from "../app/Nav";
import Footer from "../app/Footer";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../app/BackButton";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

function ProfileSetUp() {
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState("");
  const [userBio, setUserBio] = useState("");
  const [error, setError] = useState("");
  const { username } = useParams();
  const {
    isOpen: isSubmittedModalOpen,
    onOpen: onSubmittedModalOpen,
    onClose: onSubmittedModalClose,
  } = useDisclosure();

  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("jwt");
  const user = localStorage.getItem("userInfo");

  function handleChangeInterests(event) {
    setInterests((prev) => [...prev, event.target.value]);
  }
  function handleChangeSkills(event) {
    setSkills((prev) => [...prev, event.target.value]);
  }
  function handleChangeAvailability(event) {
    setAvailability(event.target.value);
  }
  const handleCompleteProfile = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/auth/user/${username}/profile-build`,
        {
          userBio,
          skills,
          availability,
          interests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      onSubmittedModalOpen();
    } catch (error) {
      setError("Unable to submit. try again");
    } finally {
      navigate("/login");
    }
  };
  return (
    <Box>
      <Nav />
      <BackButton />
      <Text fontWeight={"bold"} fontSize={25} color={"white"} mt={4} mb={4}>
        Tell Us About You
      </Text>
      <Box>
        <Text color={"white"}>Short Bio</Text>
        <Textarea
          type="textarea"
          w={"50%"}
          placeholder="Write something you'd want us to know..."
          value={userBio}
          onChange={(event) => setUserBio(event.target.value)}
        />
      </Box>
      <HStack spacing={40} mt={4}>
        <Box>
          <Text color={"white"}>Preferred Categories</Text>
          <i>What project categories would you like to work on?</i>
          <CheckboxGroup
            colorScheme="green"
            onChange={() => handleChangeInterests(event)}
          >
            <Stack spacing={[1, 3]} direction={["row", "column"]}>
              <Checkbox value="Frontend Web Development">
                Frontend Web Development
              </Checkbox>
              <Checkbox value="Backend Web Development">
                Backend Web Development
              </Checkbox>
              <Checkbox value="Fullstack Web Development">
                Fullstack Web Development
              </Checkbox>
              <Checkbox value="Mobile Development">Mobile Development</Checkbox>
              <Checkbox value="Data Science">Data Science</Checkbox>
              <Checkbox value="AI/ML">AI/ML</Checkbox>
              <Checkbox value="Hardware/IoT">Hardware/IoT</Checkbox>
              <Checkbox value="Cybersecurity">Cybersecurity</Checkbox>
              <Checkbox value="Blockchain">Blockchain</Checkbox>
              <Checkbox value="Cloud Computing">Cloud Computing</Checkbox>
              <Checkbox value="Game Development">Game Development</Checkbox>
              <Checkbox value="Embedded Systems">Embedded Systems</Checkbox>
              <Checkbox value="Enterprise Software">
                Enterprise Software
              </Checkbox>
              <Checkbox value="Open Source">Open Source</Checkbox>
            </Stack>
          </CheckboxGroup>
        </Box>
        <Box>
          <Text color={"white"}>Skills</Text>
          <i>What are your skills?</i>
          <CheckboxGroup
            colorScheme="green"
            onChange={() => handleChangeSkills(event)}
          >
            <Stack spacing={[1, 3]} direction={["row", "column"]}>
              <Checkbox value="Javascript">Javascript</Checkbox>
              <Checkbox value="Python">Python</Checkbox>
              <Checkbox value="C#">C#</Checkbox>
              <Checkbox value="PHP">PHP</Checkbox>
              <Checkbox value="Java">Java</Checkbox>
              <Checkbox value="Typescript">Typescript</Checkbox>
              <Checkbox value="Go">Go</Checkbox>
              <Checkbox value="C++">C++</Checkbox>{" "}
              <Checkbox value="Rust">Rust</Checkbox>
              <Checkbox value="MongoDB">MongoDB</Checkbox>
              <Checkbox value="SQL">SQL</Checkbox>
              <Checkbox value="HTML/CSS">HTML/CSS</Checkbox>
              <Checkbox value="React">React</Checkbox>
            </Stack>
          </CheckboxGroup>
        </Box>
        <Box mt={20}>
          <Text color={"white"}>What is your availability?</Text>
          <i>Select one option only</i>
          <RadioGroup
            colorScheme="green"
            onChange={() => handleChangeAvailability(event)}
          >
            <Stack direction="column">
              <Radio value="low">1-3 hours per week</Radio>
              <Radio value="mid">3-6 hours per week</Radio>
              <Radio value="high">6-10 hours per week</Radio>
              <Radio value="highest">More than 10 hours per week</Radio>
            </Stack>
          </RadioGroup>
        </Box>
      </HStack>

      <Button mt={20} onClick={handleCompleteProfile}>
        Complete Profile Set Up
      </Button>

      <Modal isOpen={isSubmittedModalOpen} onClose={onSubmittedModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New File</ModalHeader>
          <ModalCloseButton />
          <ModalBody></ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Create New File
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
}

export default ProfileSetUp;
