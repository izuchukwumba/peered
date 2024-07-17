import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

function BackButton() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };
  return <Button onClick={handleBackClick}>Back</Button>;
}

export default BackButton;
