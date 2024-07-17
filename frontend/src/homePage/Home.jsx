import "./Home.css";
import Nav from "../app/Nav";
import CodeGroupsList from "./CodeGroupsList";
import Files from "./Files";
import Notifications from "../notification/Notification";
import Footer from "../app/Footer";

function Home() {
  return (
    <div id="Home">
      <Nav />
      <main id="home-body">
        <div id="home-body-left">
          <CodeGroupsList />
          <Files />
        </div>
        <div id="home-body-right">
          <Notifications />
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default Home;
