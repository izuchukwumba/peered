import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, Text } from "@chakra-ui/react";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          fullName,
        }),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.errors
            ? errorResponse.errors.map((err) => err.msg).join(", ")
            : "Failed to register"
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      navigate(`/user/${username}/profile-setup`);
    }
  };
  return (
    <div id="SignUp">
      <Text fontSize={25} color={"white"} mb={4}>
        Create An Account
      </Text>
      <form onSubmit={handleSubmit}>
        <Box mb={6} color={"white"}>
          <label>Username:</label>
          <Input
            w="50%"
            ml={4}
            type="text"
            placeholder="Type in username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Box>
        <Box mb={6} color={"white"}>
          <label>Email:</label>
          <Input
            w="50%"
            ml={12}
            type="email"
            placeholder="Type in email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Box>
        <Box mb={6} color={"white"}>
          <label>Password:</label>
          <Input
            w="50%"
            ml={4}
            type="password"
            placeholder="Type in password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Box>
        <Box mb={6} color={"white"}>
          <label>Full Name:</label>
          <Input
            w="50%"
            ml={4}
            type="fullName"
            placeholder="Type in fullname..."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Box>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Button type="submit" className="btn" onClick={handleSubmit} mb={50}>
          Sign Up
        </Button>
      </form>
      <Box>
        Already have an account?
        <Button onClick={() => navigate("/login")}>Login Now</Button>
      </Box>
    </div>
  );
}
export default SignUp;
