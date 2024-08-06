import {
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { all_languages, language_extensions } from "./languages";

const ACTIVE_COLOR = "blue.400";

function LanguageSelector({ language, onLanguageSelect, fileName }) {
  useEffect(() => {
    if (!fileName) {
      return;
    }
    const fileExtension = fileName.split(".").pop();
    const fileLanguage = language_extensions[fileExtension];
    if (fileLanguage) {
      onLanguageSelect(fileLanguage, all_languages[fileLanguage]);
    }
  }, [fileName]);

  return (
    <Box>
      <Menu isLazy>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          {language}
        </MenuButton>
        <MenuList bg="#110c1b">
          {Object.entries(all_languages).map(([lang, version], index) => {
            return (
              <MenuItem
                key={index}
                onClick={() => onLanguageSelect(lang, version)}
                color={lang === language ? ACTIVE_COLOR : ""}
                bg={lang === language ? "gray.900" : "transparent"}
                _hover={{
                  color: ACTIVE_COLOR,
                  bg: "gray.900",
                }}
              >
                {lang}&nbsp;&nbsp;({version})
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    </Box>
  );
}
export default LanguageSelector;
