import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div id="SignUp">
      <h2>SignUp</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            placeholder="Type in username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Type in email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Type in password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Full Name:</label>
          <input
            type="fullName"
            placeholder="Type in fullname..."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            // required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" className="btn">
          Sign Up
        </button>
      </form>
    </div>
  );
}
export default SignUp;
