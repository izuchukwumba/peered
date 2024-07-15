const axios = require("axios");
const prisma = require("../prisma/prisma_client");
require("dotenv").config();
const { userSocketMap, rateLimiter } = require("../notification/socket");
const { notif_categories } = require("../notification/notif_categories");

const findFile = async (fileId) => {
  return await prisma.file.findUnique({
    where: {
      id: parseInt(fileId),
    },
    include: {
      user: true,
      codeGroup: {
        include: {
          members: true,
        },
      },
    },
  });
};
const findUser = async (userId) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};
const findGroup = async (groupId) => {
  return await prisma.codeGroup.findUnique({
    where: {
      id: parseInt(groupId),
    },
    include: {
      members: true,
    },
  });
};

//Create New File
exports.createNewFile = async (req, res) => {
  const { groupId } = req.params;
  const { newFileName } = req.body;
  const userId = req.user.id;

  if (!newFileName) {
    return res.status(400).json({
      error: "File name is required",
    });
  }

  try {
    const group = await findGroup(groupId);
    if (!group) {
      return res.status(404).json({
        error: "Group not found",
      });
    }
    const isMember = group.members.some((member) => member.userId === userId);
    if (!isMember && group.creatorId !== userId) {
      return res.status(403).json({
        error: "You do not have access to this group",
      });
    }
    const newFile = await prisma.file.create({
      data: {
        fileName: newFileName,
        user: {
          connect: {
            id: userId,
          },
        },
        codeGroup: {
          connect: {
            id: parseInt(groupId),
          },
        },
      },
    });

    //Notify group members about file creation
    const notif_sender = await findUser(userId);
    const userIds = group.members.map((member) => member.userId);
    const allUserIds = [...userIds, group.creatorId].filter(
      (id) => id !== userId
    );
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      if (userSocketId) {
        try {
          await rateLimiter.consume(allUserIds[user_id]);

          userSocketId.emit("notify_group", {
            message: `User ${userId} has created a file: ${newFile.fileName}`,
          });
        } catch (rejRes) {
          socket.emit("Too many notifications. Please try again later.");
        }
      }

      await prisma.notification.create({
        data: {
          message: `${notif_sender.fullName} has created a file: ${newFile.fileName}`,
          category: notif_categories.file_created,
          fileId: newFile.id,
          groupId: group.id,
          isImportant: true,
          isOffline: !userSocketId && true,
          sender: {
            connect: { id: userId },
          },
          receiver: {
            connect: { id: allUserIds[user_id] },
          },
        },
      });
    }
    return res.status(201).json({
      message: "File created successfully",
      file: newFile,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error creating file.",
    });
  }
};

//Get File Details
exports.getFileDetails = async (req, res) => {
  const { groupId, fileId } = req.params;
  const userId = req.user.id;

  try {
    const group = await findGroup(groupId);

    if (!group) {
      return res.status(404).json({
        error: "Group not found",
      });
    }

    const isMember = group.members.some((member) => member.userId === userId);
    if (!isMember && group.creatorId !== userId) {
      return res.status(403).json({
        error: "you do not have access to this group",
      });
    }

    const file = await findFile(fileId);
    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    return res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ error: "Failed to get file details." });
  }
};

//Update File
exports.updateFileDetails = async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;
  const { newFileName, newFileContent } = req.body;

  try {
    const file = await findFile(fileId);
    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    let updatedFileData = {};
    if (newFileName) {
      updatedFileData.fileName = newFileName;
    }
    if (newFileContent) {
      updatedFileData.fileContent = newFileContent;
    }

    const updatedFile = await prisma.file.update({
      where: {
        id: parseInt(fileId),
      },
      data: updatedFileData,
    });

    //Notify group members about file update
    const notif_sender = await findUser(userId);
    const userIds = file.codeGroup.members.map((member) => member.userId);
    const allUserIds = [...userIds, file.codeGroup.creatorId].filter(
      (id) => id != userId
    );
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      if (userSocketId) {
        try {
          await rateLimiter.consume(allUserIds[user_id]);

          userSocketId.emit("notify_group", {
            message: `${notif_sender.fullName} has edited file: ${file.fileName} in group: ${file.codeGroup.groupName}`,
          });
        } catch (rejRes) {
          socket.emit("Too many notifications. Please try again later.");
        }
      }

      await prisma.notification.create({
        data: {
          message: `${notif_sender.fullName} has edited file: ${file.fileName} in group: ${file.codeGroup.groupName}`,
          category: notif_categories.file_updated,
          fileId: file.id,
          groupId: file.codeGroup.id,
          isImportant: true,
          isOffline: !userSocketId && true,
          sender: {
            connect: { id: userId },
          },
          receiver: {
            connect: { id: allUserIds[user_id] },
          },
        },
      });
    }

    return res.status(201).json(updatedFile);
  } catch (error) {
    res.status(500).json({ error: "Error updating file" });
  }
};

//Delete File
exports.deleteFile = async (req, res) => {
  const { groupId, fileId } = req.params;
  const userId = req.user.id;

  try {
    const group = await findGroup(groupId);
    if (!group) {
      return res.status(404).json({
        error: "Group not found",
      });
    }
    const isMember = group.members.some((member) => member.userId === userId);
    if (!isMember && group.creatorId !== userId) {
      return res.status(403).json({
        error: "You do not have access to this group",
      });
    }
    const file = await findFile(fileId);
    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    if (file.creatorId !== userId && group.creatorId !== userId) {
      return res.status(403).json({
        error: "You do not have permission to delete this file",
      });
    }
    await prisma.file.delete({
      where: {
        id: parseInt(fileId),
      },
    });
    //Notify group members about file deletion
    const notif_sender = await findUser(userId);
    const userIds = group.members.map((member) => member.userId);
    const allUserIds = [...userIds, group.creatorId].filter(
      (id) => id != userId
    );
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      if (userSocketId) {
        try {
          await rateLimiter.consume(allUserIds[user_id]);
          userSocketId.emit("notify_group", {
            message: `${notif_sender.fullName} has deleted file: ${file.fileName} in group: ${group.groupName}`,
          });
        } catch (rejRes) {
          socket.emit("Too many notifications. Please try again later.");
        }
      }
      await prisma.notification.create({
        data: {
          message: `${notif_sender.fullName} has deleted file: ${file.fileName} in group: ${group.groupName}`,
          category: notif_categories.file_deleted,
          fileId: file.id,
          groupId: group.id,
          isImportant: true,
          isOffline: !userSocketId && true,
          sender: {
            connect: { id: userId },
          },
          receiver: {
            connect: { id: allUserIds[user_id] },
          },
        },
      });
    }
    return res.status(200).json({
      message: `File named ${file.fileName} has been deleted`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete file" });
  }
};

//Run Code
exports.runCode = async (req, res) => {
  const { language, version, codeBase } = req.body;
  const api_url = "https://emkc.org/api/v2/piston/execute";
  const params = {
    language: language,
    version: version,
    files: [
      {
        content: codeBase,
      },
    ],
  };

  try {
    const response = await axios.post(api_url, params);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error running file. Try again" });
  }
};
console;
