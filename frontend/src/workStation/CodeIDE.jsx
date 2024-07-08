import { Box, HStack, Button } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Terminal from "./Terminal";
import LanguageSelector from "./LanguageSelector";
import axios from "axios";

function CodeIDE() {
  const [fileData, setFileData] = useState([]);
  const [newFileContent, setNewFileContent] = useState();
  const [language, setLanguage] = useState("javascript");
  const [version, setVersion] = useState("18.15.0");
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");

  const editorRef = useRef();
  const { groupId, fileId } = useParams();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("jwt");

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
      setFileData(response.data);
    } catch (error) {
      setError("Error fetching file details");
    }
  };

  useEffect(() => {
    fetchFileDetails();
    const timer = setTimeout(() => {
      setShowEditor(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  function onMount(editor) {
    editorRef.current = editor;
    editor.focus();
  }
  function onLanguageSelect(language, version) {
    setLanguage(language);
    setVersion(version);
  }
  const updateFileDetails = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/group/${groupId}/files/${fileId}/update-file`,
        { newFileContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      setError("Error updating file details");
    } finally {
      fetchFileDetails();
    }
  };

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="75%" id="CodeIDE">
          <HStack>
            <LanguageSelector
              onLanguageSelect={onLanguageSelect}
              language={language}
              version={version}
              fileName={fileData.fileName}
            />
            <Button mt={5} ml={12} onClick={updateFileDetails}>
              Save File Content
            </Button>
          </HStack>
          {showEditor && (
            <Editor
              height="75vh"
              theme="vs-dark"
              language={language}
              defaultValue={
                fileData.fileContent
                  ? fileData.fileContent
                  : "//Start coding..."
              }
              onMount={onMount}
              value={newFileContent}
              onChange={(value) => setNewFileContent(value)}
            />
          )}
        </Box>
        <Box w="25%">
          <Terminal
            editorRef={editorRef}
            language={language}
            version={version}
            fileContent={fileData.fileContent}
          />
        </Box>
      </HStack>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </Box>
  );
}
export default CodeIDE;