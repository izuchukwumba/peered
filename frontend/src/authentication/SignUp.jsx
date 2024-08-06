import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, Text } from "@chakra-ui/react";
import logo from "../../assets/logo.png";
import "./SignUp.css";

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
      <div className="signup-heading">
        <img src={logo} alt="peered-logo" className="logo-signup" />
        <Text fontSize={18}>Welcome to the collaborative platform for </Text>
        <Text fontSize={18} style={{ color: "#97e8a9" }}>
          peer programming
        </Text>
        <Text fontSize={20} color={"white"} mb={2} mt={6}>
          Create An Account
        </Text>
      </div>
      <form onSubmit={handleSubmit} className="signup-form">
        <div>Username:</div>
        <input
          type="text"
          placeholder="Type in username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div>Email:</div>
        <input
          type="email"
          placeholder="Type in email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>Password:</div>
        <input
          type="password"
          placeholder="Type in password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div>Full Name:</div>
        <input
          type="fullName"
          placeholder="Type in fullname..."
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <div className="btn signup-btn-main" onClick={handleSubmit}>
        Sign Up
      </div>

      <Box className="signup-login-option">
        <div>Already have an account?</div>
        <div
          className="btn signup-login-btn"
          onClick={() => navigate("/login")}
        >
          Login Now
        </div>
      </Box>
    </div>
  );
}
export default SignUp;
