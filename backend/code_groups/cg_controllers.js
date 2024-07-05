const axios = require("axios");
const prisma = require("../prisma/prisma_client");
require("dotenv").config();

//Get All Groups Created by User
exports.getGroupsCreatedByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const groups = await prisma.codeGroup.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        members: {
          include: {
            user: true,
            addedBy: true,
          },
        },
        creator: true,
        files: true,
      },
    });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching groups",
    });
  }
};
//Get All groups User was added to
exports.getAddedGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const groupMemberships = await prisma.groupMember.findMany({
      where: { userId: userId },
      include: {
        group: {
          include: {
            creator: true,
            members: {
              include: { user: true, addedBy: true },
            },
            files: true,
          },
        },
      },
    });
    const groups = groupMemberships.map((group) => group?.group);
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Create New Code Group
exports.createGroup = async (req, res) => {
  const { groupName, members } = req.body;
  const creatorId = req.user.id;
  if (!groupName) {
    return res.status(400).json({ error: "Invalid group name" });
  }
  try {
    const newGroup = await prisma.codeGroup.create({
      data: {
        groupName,
        creator: {
          connect: { id: creatorId },
        },
        members: {
          create: members
            ? members.map((memberUsername) => ({
                user: { connect: { username: memberUsername } },
                addedBy: { connect: { id: creatorId } },
              }))
            : [],
        },
      },
      include: {
        members: {
          include: {
            user: true,
            addedBy: true,
          },
        },
        creator: true,
      },
    });
    return res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create group",
    });
  }
};
