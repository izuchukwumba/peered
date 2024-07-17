import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "../landingPage/LandingPage";
import AuthCallback from "../authentication/GithubAuthCallback";
import Home from "../homePage/Home";
import LoginPage from "../authentication/LoginPage";
import SignUp from "../authentication/SignUp";
import UserInfoContextProvider from "../contexts/userInfoContext";
import { AuthenticatedContextProvider } from "../contexts/authenticatedContext";
import ProtectedHomeRoute from "../authentication/ProtectedHomeRoute";
import CodeGroup from "../workStation/CodeGroup";
import WorkStation from "../workStation/WorkStation";
import ProfileSetUp from "../authentication/ProfileSetUp";
import ProfilePage from "../authentication/ProfilePage";
import ProfileEdit from "../authentication/ProfileEdit";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <UserInfoContextProvider>
      <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
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
              <Route path="/signup" element={<SignUp />} />
              <Route path="/user/:username/profile" element={<ProfilePage />} />
              <Route
                path="/user/:username/edit-profile"
                element={<ProfileEdit />}
              />
              <Route
                path="/user/:username/profile-build"
                element={<ProfileSetUp />}
              />
              <Route path="/group/:groupId" element={<CodeGroup />} />
              <Route
                path="/group/:groupId/files/:fileId/workstation"
                element={<WorkStation />}
              />
            </Routes>
          </AuthenticatedContextProvider>
        </Router>
      </Box>
    </UserInfoContextProvider>
  );
}

export default App;
