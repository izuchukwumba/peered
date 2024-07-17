import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./landingPage/LandingPage";
import AuthCallback from "./authentication/GithubAuthCallback";
import Home from "./homePage/Home";
import LoginPage from "./authentication/LoginPage";
import SignUp from "./authentication/SignUp";
import UserInfoContextProvider from "./contexts/userInfoContext";
import { AuthenticatedContextProvider } from "./contexts/authenticatedContext";
import ProtectedHomeRoute from "./authentication/ProtectedHomeRoute";

function App() {
  return (
    <UserInfoContextProvider>
      <Router>
        <AuthenticatedContextProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/home"
              element={
                <ProtectedHomeRoute>
                  <Home />
                </ProtectedHomeRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignUp />} />
          </Routes>
        </AuthenticatedContextProvider>
      </Router>
    </UserInfoContextProvider>
  );
}

export default App;
