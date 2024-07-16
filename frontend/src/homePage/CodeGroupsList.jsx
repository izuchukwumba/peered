import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import "./CodeGroupsList.css";
import axios from "axios";

function CodeGroups() {
  const [allGroups, setAllGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState("");
  const [groupImageQuery, setGroupImageQuery] = useState("");
  const [groupImageUrl, setGroupImageUrl] = useState("");
  const [error, setError] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("jwt");
  const navigate = useNavigate();
  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const getGroupImageUrl = async (query, width, height) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/search-for-image?query=${
          ("team ", query)
        }&width=${width}&height=${height}`
      );
      const data = await response.json();
      setGroupImageUrl(data);
    } catch (error) {
      setError("Error fetching group image");
    }
  };

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

  useEffect(() => {
    setAllGroups([]);
    if (!token) {
      navigate("/login");
    }
    groupImageQuery && getGroupImageUrl(groupImageQuery, 200, 500);
    getGroups();
  }, [token, BACKEND_URL, groupImageQuery]);

  const handleAddMembers = () => {
    if (memberInput) {
      setMembers([...members, memberInput]);
      setMemberInput("");
    }
  };

  const handleRemoveMember = (memberUsername) => {
    setMembers(members.filter((member) => member !== memberUsername));
  };

  const handleCreateNewGroup = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/new/code-group`,
        { groupName, members, imgUrl: groupImageUrl },
        { withCredentials: true }
      );
      getGroups();
      setGroupImageQuery("");
      setGroupImageUrl("");
    } catch (error) {
      setError("Error Creating Group. Try again");
    }
  };

  return (
    <div id="CodeGroups">
      <form onSubmit={handleCreateNewGroup}>
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
          <Button type="button" onClick={handleAddMembers}>
            Add Members
          </Button>
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
        <div>
          <label>Describe your team with one word</label>
          <input
            type="text"
            value={groupImageQuery}
            onChange={(e) => setGroupImageQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="btn">
          Create New Group
        </Button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>

      <div className="home-group-list">
        {allGroups.map((group, index) => (
          <div
            className="home-group-list-item"
            key={index}
            onClick={() => handleGroupClick(group.id)}
          >
            <img src={group.imgUrl} alt={group.groupName} />
            <div>{group.groupName}</div>
            <div>
              Created by {group.creator.username} at {""}
              {new Date(group.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default CodeGroups;
