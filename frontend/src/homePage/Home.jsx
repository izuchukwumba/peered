import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Nav from "../app/Nav";
import CodeGroups from "./CodeGroups";
import Files from "./Files";
import Activities from "./Activities";
import Footer from "../app/Footer";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";

function Home() {
  const { isUserAuthenticated } = useAuthenticatedContext();
  const navigate = useNavigate();

  return (
    <div id="Home">
      <Nav />
      <main id="home-body">
        <div id="home-body-left">
          <CodeGroups />
          <Files />
        </div>
        <div id="home-body-right">
          <Activities />
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default Home;
