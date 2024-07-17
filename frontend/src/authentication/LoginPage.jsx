import { useState } from "react";
import { Button, Box } from "@chakra-ui/react";
import Cookies from "js-cookie";
import axios from "axios";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isUserAuthenticated, setIsUserAuthenticated } =
    useAuthenticatedContext();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const fetchUserInfo = async (username, token) => {
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
      localStorage.setItem("userInfo", JSON.stringify(response.data));
    } catch (errorr) {
      setError("Error fetching user info. Refresh and try again.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        setError("Error logging in. Refresh and try again");
        throw new Error(
          errorResponse.message || "Error logging in. Refresh and try again"
        );
      }

      //Get auth cookies, store in local storage and fetch user info
      const data = await response.json();
      Cookies.set("jwt", data.token, { expires: 1, sameSite: "Lax" });
      localStorage.setItem("jwt", data.token);
      setIsUserAuthenticated(true);
      fetchUserInfo(username, data.token);
      login();
    } catch (err) {
      setError(err.message);
    }
  };
  const handleLoginWithGithub = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };
  return (
    <div id="LoginPage">
      <h1>Welcome to Peered</h1>
      {!isUserAuthenticated && <div>Logged Out</div>}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="btn">
          Login
        </Button>
      </form>
      OR
      <Button className="btn" onClick={handleLoginWithGithub}>
        Login with Github
      </Button>
      <Box>
        Don't have an account?
        <Button onClick={() => navigate("/signup`")}>Sign Up Now</Button>
      </Box>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
export default LoginPage;
