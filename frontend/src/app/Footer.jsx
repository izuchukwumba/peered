import { useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";
import { Stack, Link, Image, IconButton } from "@chakra-ui/react";
import "./Footer.css";
import logo from "../../assets/logo.png";

const accounts = [
  {
    url: "https://github.com/izuchukwumba",
    label: "Github Account",
    type: "gray",
    icon: <i className="fa-brands fa-github"></i>,
  },
  {
    url: "https://twitter.com/the_izuchukwu",
    label: "Twitter Account",
    type: "twitter",
    icon: <i className="fa-brands fa-twitter"></i>,
  },
  {
    url: "https://www.linkedin.com/in/bartholomew-mba",
    label: "LinkedIn Account",
    type: "linkedin",
    icon: <i className="fa-brands fa-linkedin"></i>,
  },
];

function Footer() {
  const [error, setError] = useState("");
  const { logout, isUserAuthenticated } = useAuthenticatedContext();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = () => {
    //General logout
    localStorage.removeItem("jwt");
    localStorage.removeItem("userInfo");
    Cookies.remove("jwt");
    logout();

    //Github logout
    fetch(`${BACKEND_URL}/auth/github/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          logout();
        }
      })
      .catch((error) => {
        setError("Error while logging out. Try again.");
      });
  };

  return (
    <div id="Footer">
      <Stack
        maxW="5xl"
        marginInline="auto"
        p={2}
        spacing={{ base: 8, md: 0 }}
        justifyContent="space-between"
        alignItems="center"
        direction={{ base: "column", md: "row" }}
      >
        <Image boxSize="60px" src={logo} alt="logo" mr={6} />
        <Text>Peered. 2024. All rights reserved</Text>{" "}
        <Button mb={4} mt={4} onClick={handleLogout}>
          Logout
        </Button>
        <Stack
          direction="row"
          spacing={5}
          pt={{ base: 4, md: 0 }}
          alignItems="center"
        >
          {accounts.map((media, index) => (
            <IconButton
              key={index}
              as={Link}
              isExternal
              href={media.url}
              aria-label={media.label}
              colorScheme={media.type}
              icon={media.icon}
              rounded="md"
            />
          ))}
        </Stack>
      </Stack>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default Footer;
