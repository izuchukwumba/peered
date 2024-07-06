import "./Home.css";
import Nav from "../app/Nav";
import CodeGroups from "./CodeGroupsList";
import Files from "./Files";
import Activities from "./Activities";
import Footer from "../app/Footer";

function Home() {
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
