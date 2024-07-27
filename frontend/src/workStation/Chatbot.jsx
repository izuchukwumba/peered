import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";
import Loading from "../app/Loading";

function Chatbot() {
  const [input, setInput] = useState("");
  const [allChatbotMessages, setAllChatbotMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("jwt");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };
  const containerRef = useRef(null);

  const saveChatBotMessage = async (chatbotMessage, messageType) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/group/save-chatbot-message`,
        { chatbotMessage, messageType },
        options
      );
    } catch (error) {
      setError(error);
    }
  };

  const fetchAllChatbotMessages = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/group/get-chatbot-messages`,
        options
      );
      const messagesSortedByTime = response.data.sort(
        (a, b) => new Date(a.timestamp - new Date(b.timestamp))
      );
      setAllChatbotMessages(messagesSortedByTime);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    fetchAllChatbotMessages();
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [allChatbotMessages.length]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/group/chatbot`,
        {
          input,
        },
        {
          withCredentials: true,
        }
      );
      const newResponse = response.data.choices[0].message.content;
      saveChatBotMessage(input, "question");
      fetchAllChatbotMessages();
      saveChatBotMessage(newResponse, "answer");
    } catch (error) {
      setError(error);
    } finally {
      fetchAllChatbotMessages();
      setInput("");
      setIsLoading(false);
    }
  };

  return (
    <div id="Chatbot">
      <div id="chatbot-container" ref={containerRef}>
        <h1 className="chatbot-header">AI Chatbot</h1>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="message-container-1">
            {allChatbotMessages.length > 0 &&
              allChatbotMessages.map((message) => {
                return (
                  <div className="message-container-2">
                    <div
                      className={
                        message.type === "question"
                          ? "question-message"
                          : message.type === "answer"
                          ? "answer-message"
                          : ""
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        <div className="ai-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="ai-input"
          />
          <div className="btn submit-ai-btn" onClick={handleSubmit}>
            Submit
          </div>
        </div>
        {error && <div>{error}</div>}
      </div>
    </div>
  );
}

export default Chatbot;
