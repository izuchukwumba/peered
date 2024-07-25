const axios = require("axios");
const prisma = require("../prisma/prisma_client");
const { userSocketMap, rateLimiter } = require("../notification/socket");
const {
  notif_categories,
  socket_names,
} = require("../notification/notif_categories_backend");
const { saveNotification } = require("../workstation/ws_controllers");
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

//Get all groups User was added to
exports.getGroupMemberships = async (req, res) => {
  const userId = req.user.id;

  try {
    const groupMemberships = await prisma.groupMember.findMany({
      where: { userId: userId },
      include: {
        group: {
          include: {
            creator: true,
            members: {
              include: { user: true },
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
  const { groupName, members, imgUrl } = req.body;
  const creatorId = req.user.id;
  if (!groupName) {
    return res.status(400).json({ error: "Invalid group name" });
  }
  try {
    const newGroup = await prisma.codeGroup.create({
      data: {
        groupName,
        imgUrl,
        creator: {
          connect: { id: creatorId },
        },
        members: {
          create: members
            ? members.map((memberUsername) => ({
                user: { connect: { username: memberUsername } },
              }))
            : [],
        },
      },
      include: {
        members: {
          include: {
            user: true,
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
    res.status(500).json({
      error: "Failed to create group",
    });
  }
};

//Get Group Data for Workstation
exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId: parseInt(groupId),
        userId: userId,
      },
    });
    const isCreator = await prisma.codeGroup.findFirst({
      where: {
        id: parseInt(groupId),
        creatorId: userId,
      },
    });

    if (!isMember && !isCreator) {
      return res.status(403).json({
        error: "You do not have access to this group",
      });
    }
    const group = await prisma.codeGroup.findUnique({
      where: {
        id: parseInt(groupId),
      },
      include: {
        creator: true,
        members: {
          include: {
            user: true,
          },
        },
        files: true,
      },
    });
    if (!group) {
      return res.status(404).json({
        error: "group not found",
      });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error getting group details" });
  }
};

//Get Random Image for Code Group
exports.getGroupImageUrl = async (req, res) => {
  const accessKey = process.env.IMAGE_API_ACCESS_KEY;
  const { query, width, height } = req.query;

  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query: query,
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });
    if (response.data.results.length > 0) {
      const image = await response.data.results[0];
      const imageUrl = `${image.urls.raw}&w=${width}&h=${height}`;
      res.status(200).json(imageUrl);
    } else {
      res.status(404).json({ message: "No result found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error getting image" });
  }
};

//Update Group Details: Group Name, Image and Add More Members
exports.updateGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  const { newGroupName, newGroupImageUrl, newMembers } = req.body;
  const userId = req.user.id;
  try {
    //find group
    const group = await prisma.codeGroup.findUnique({
      where: {
        id: parseInt(groupId),
      },
      include: {
        creator: true,
      },
    });
    if (!group) {
      return res.status(404).json({
        error: "Group not found",
      });
    }
    if (group.creatorId !== userId) {
      return res.status(403).json({
        error: "You do not have permission to update this group",
      });
    }

    let updatedGroupData = {};

    if (newGroupName) {
      updatedGroupData.groupName = newGroupName;
    }
    if (newGroupImageUrl) {
      updatedGroupData.imgUrl = newGroupImageUrl;
    }
    const updatedGroup = await prisma.codeGroup.update({
      where: {
        id: parseInt(groupId),
      },
      data: updatedGroupData,
      include: {
        members: true,
        creator: true,
      },
    });
    //find user and create group membership
    if (newMembers && newMembers.length > 0) {
      for (const memberUsername of newMembers) {
        const potentialMember = await prisma.user.findUnique({
          where: {
            username: memberUsername,
          },
        });
        if (potentialMember) {
          try {
            await prisma.groupMember.create({
              data: {
                addedById: userId,
                group: {
                  connect: {
                    id: group.id,
                  },
                },
                user: {
                  connect: {
                    id: potentialMember.id,
                  },
                },
              },
            });

            const userSocketId = userSocketMap.get(potentialMember.id);
            const notificationMessage = `You have been added to the code group: ${group.groupName}`;
            const saveAddedToGroupNotification = async () => {
              await saveNotification(
                notificationMessage,
                notif_categories.added_to_group,
                userId,
                potentialMember.id,
                userSocketId,
                group,
                { id: null }
              );
            };
            if (userSocketId) {
              const rateLimitResponse = await rateLimiter.useRateLimiter(
                potentialMember.id,
                notif_categories.added_to_group
              );
              if (rateLimitResponse?.isRateLimited) {
                const selfSocketId = userSocketMap.get(userId);
                selfSocketId.emit(
                  socket_names.rate_limit,
                  rateLimitResponse.message
                );
              } else if (!rateLimitResponse?.isRateLimited) {
                await saveAddedToGroupNotification();
                userSocketId.emit(socket_names.added_user_to_group, {
                  message: notificationMessage,
                  category: notif_categories.added_to_group,
                });
              }
            } else {
              await saveAddedToGroupNotification();
            }
          } catch (error) {
            res
              .status(500)
              .json({ message: "User is already a member or does not exist" });
          }
        }
      }
    }
    const updatedGroupWithNewMembers = await prisma.codeGroup.findUnique({
      where: {
        id: parseInt(groupId),
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        creator: true,
      },
    });
    return res.status(200).json({
      message: "Group updated successfully",
      group: updatedGroupWithNewMembers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating group details" });
  }
};
