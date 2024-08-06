import { Box, Text, Button, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";

function Terminal({ editorRef, language, version, fileContent }) {
  const [codeOutput, setCodeOutput] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [isCodeBugged, setIsCodeBugged] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const toast = useToast();
  const { groupId, fileId } = useParams();

  const handleRunCode = async () => {
    setCodeOutput("");
    const sourceCode = editorRef.current.getValue();
    const params = {
      language: language,
      version: version,
      codeBase: fileContent,
    };
    try {
      if (!sourceCode) {
        throw new Error(
          "No code found. Write some code before attempting to run."
        );
      }

      setisLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/group/${groupId}/files/${fileId}/workstation/run-code`,
        params,
        { withCredentials: true }
      );
      setCodeOutput(response.data.run.output.split("\n"));
      response.data.run.stderr ? setIsCodeBugged(true) : setIsCodeBugged(false);
    } catch (error) {
      toast({
        title: "An error occured",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setisLoading(false);
    }
  };

  return (
    <Box id="Terminal">
      <Button
        bg={"rgb(151, 232, 169)"}
        color="black"
        mt={8}
        mb={4}
        isLoading={isLoading}
        onClick={handleRunCode}
        _hover={{
          bg: "#0f0a19",
          color: "#97e8a9",
          border: "1px solid",
          borderColor: "#97e8a9",
        }}
      >
        Run Code
      </Button>
      <Box
        height="70vh"
        p={2}
        border="1px solid"
        borderRadius={4}
        color={isCodeBugged ? "red.400" : "rgba(151, 232, 169, 0.8)"}
        borderColor={isCodeBugged ? "red.500" : "#333"}
      >
        {codeOutput
          ? codeOutput.map((output, index) => {
              return <Text key={index}>{output}</Text>;
            })
          : "Click 'Run Code' to see code output"}
      </Box>
    </Box>
  );
}
export default Terminal;
