import { useState, useEffect } from "react";
import "./CodeGroups.css";
import axios from "axios";
import { useAuthenticatedContext } from "../contexts/authenticatedContext";

function CodeGroups() {
  const [allGroups, setAllGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState("");
  const [error, setError] = useState("");
  const { isUserAuthenticated, logout } = useAuthenticatedContext();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getGroups = async () => {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };

    try {
      const createdGroups = await axios.get(
        `${BACKEND_URL}/api/user/created-groups`,
        options
      );

      const groupMemberships = await axios.get(
        `${BACKEND_URL}/api/user/group-memberships`,
        options
      );

      setAllGroups([...createdGroups.data, ...groupMemberships.data]);
    } catch (error) {
      setError("Error Fetching Groups.");
    }
  };
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    setAllGroups([]);
    if (!isUserAuthenticated || !token) {
      logout();
    }
    getGroups();
  }, [token, BACKEND_URL]);

  const handleAddMembers = () => {
    if (memberInput) {
      setMembers([...members, memberInput]);
      setMemberInput("");
    }
  };
  const handleRemoveMember = (memberUsername) => {
    setMembers(members.filter((member) => member !== memberUsername));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/new/code-group`,
        { groupName, members },
        { withCredentials: true }
      );
      getGroups();
    } catch (error) {
      setError("Error Creating Group. Try again");
    }
  };

  return (
    <div id="CodeGroups">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
        <div>
          <div>Add Members</div>
          <input
            type="text"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
          />
          <button type="button" onClick={handleAddMembers}>
            Add Members
          </button>
        </div>
        <ul>
          {members.map((member, index) => (
            <li key={index}>
              {member}
              <button type="button" onClick={() => handleRemoveMember(member)}>
                &times;
              </button>
            </li>
          ))}
        </ul>
        <button type="submit" className="btn">
          Create New Group
        </button>
      </form>

      <div className="home-group-list">
        {allGroups.map((group, index) => (
          <div className="home-group-list-item" key={index}>
            <img src={group.imgUrl} alt={group.groupName} />
            <div>{group.groupName}</div>
            <div>
              Created by {group.creatorId} at {group.createdAt.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default CodeGroups;
