import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

function BackButton() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };
  return (
    <Button onClick={handleBackClick} className="Backbutton">
      <i className="fa-solid fa-arrow-left" style={{ fontWeight: "bold" }}></i>
    </Button>
  );
}

export default BackButton;
