import { useState } from "react";
import { Button } from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isUserAuthenticated } = useAuthenticatedContext();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.message || "Error logging in. Refresh and try again"
        );
      }
      const data = await response.json();
      //Get auth cookies and store in local storage
      Cookies.set("jwt", data.token, { expires: 1, sameSite: "Lax" });
      localStorage.setItem("jwt", data.token);
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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
export default LoginPage;
