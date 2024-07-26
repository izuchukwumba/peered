import "./Home.css";
import Nav from "../app/Nav";
import CodeGroupsList from "./CodeGroupsList";
import Files from "./Files";
import Notifications from "../notification/Notification";
import Footer from "../app/Footer";
import { Box } from "@chakra-ui/react";

function Home() {
  return (
    <div id="Home">
      <Nav />
      <Box id="home-body" pt={24}>
        <div id="home-body-left">
          <CodeGroupsList />
          <Files />
        </div>
        <div id="home-body-right">
          <Notifications />
        </div>
      </Box>
      <Footer />
    </div>
  );
}
export default Home;
