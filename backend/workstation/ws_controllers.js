const axios = require("axios");
const prisma = require("../prisma/prisma_client");
require("dotenv").config();
const { userSocketMap, rateLimiter } = require("../notification/socket");
const {
  notif_categories,
  socket_names,
} = require("../notification/notif_categories_backend");

const findFile = async (fileId) => {
  return await prisma.file.findUnique({
    where: {
      id: parseInt(fileId),
    },
    include: {
      creator: true,
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

const checkGroup = async (groupId, userId) => {
  const group = await prisma.codeGroup.findUnique({
    where: {
      id: parseInt(groupId),
    },
    include: {
      members: true,
    },
  });
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
  return group;
};

exports.saveNotification = async (
  message,
  category,
  senderId,
  receiverId,
  userSocketId,
  group,
  file
) => {
  await prisma.notification.create({
    data: {
      message: message,
      category: category,
      fileId: file.id,
      isOffline: !userSocketId ? true : false,
      groupId: group.id,
      senderId: senderId,
      receiverId: receiverId,
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
    const group = await checkGroup(groupId, userId);
    const newFile = await prisma.file.create({
      data: {
        fileName: newFileName,
        creator: {
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
    const notificationMessage = `${notif_sender.fullName} has created a file: ${newFile.fileName}`;
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      const saveCreatedFileNotification = async () => {
        await this.saveNotification(
          notificationMessage,
          notif_categories.file_created,
          userId,
          allUserIds[user_id],
          userSocketId,
          group,
          newFile
        );
      };
      if (userSocketId) {
        const rateLimitResponse = await rateLimiter.useRateLimiter(
          allUserIds[user_id],
          notif_categories.file_created
        );
        if (rateLimitResponse?.isRateLimited) {
          const selfSocketId = userSocketMap.get(userId);
          selfSocketId.emit(socket_names.rate_limit, rateLimitResponse.message);
        } else if (!rateLimitResponse?.isRateLimited) {
          await saveCreatedFileNotification();
          userSocketId.emit(socket_names.group_notifications, {
            message: notificationMessage,
            category: notif_categories.file_created,
          });
        }
      } else {
        await saveCreatedFileNotification();
      }
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
    await checkGroup(groupId, userId);
    const file = await prisma.file.findUnique({
      where: {
        id: parseInt(fileId),
      },
      include: {
        creator: true,
        codeGroup: true,
      },
    });
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
    const notificationMessage = `${notif_sender.fullName} has edited file: ${file.fileName} in group: ${file.codeGroup.groupName}`;
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      const saveUpdatedFileNotification = async () => {
        await this.saveNotification(
          notificationMessage,
          notif_categories.file_updated,
          userId,
          allUserIds[user_id],
          userSocketId,
          file.codeGroup,
          file
        );
      };
      if (userSocketId) {
        const rateLimitResponse = await rateLimiter.useRateLimiter(
          allUserIds[user_id],
          notif_categories.file_updated
        );
        if (rateLimitResponse?.isRateLimited) {
          const selfSocketId = userSocketMap.get(userId);
          selfSocketId.emit(socket_names.rate_limit, rateLimitResponse.message);
        } else {
          await saveUpdatedFileNotification();
          userSocketId.emit(socket_names.group_notifications, {
            message: notificationMessage,
            category: notif_categories.file_updated,
          });
        }
      } else {
        await saveUpdatedFileNotification();
      }
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
    const group = await checkGroup(groupId, userId);
    const file = await prisma.file.findUnique({
      where: {
        id: parseInt(fileId),
      },
    });
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
    const notificationMessage = `${notif_sender.fullName} has deleted file: ${file.fileName} in group: ${group.groupName}`;
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      const saveDeletedFileNotification = async () => {
        await this.saveNotification(
          notificationMessage,
          notif_categories.file_deleted,
          userId,
          allUserIds[user_id],
          userSocketId,
          group,
          file
        );
      };
      if (userSocketId) {
        const rateLimitResponse = await rateLimiter.useRateLimiter(
          allUserIds[user_id],
          notif_categories.file_deleted
        );
        if (rateLimitResponse?.isRateLimited) {
          const selfSocketId = userSocketMap.get(userId);
          selfSocketId.emit(socket_names.rate_limit, rateLimitResponse.message);
        } else if (!rateLimitResponse?.isRateLimited) {
          await saveDeletedFileNotification();
          userSocketId.emit(socket_names.group_notifications, {
            message: `${notif_sender.fullName} has deleted file: ${file.fileName} in group: ${group.groupName}`,
            category: notif_categories,
          });
        }
      } else {
        await saveDeletedFileNotification();
      }
    }
    return res.status(200).json({
      message: `File named ${file.fileName} has been deleted`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete file" });
  }
};

exports.downloadFile = async (req, res) => {
  const { fileId } = req.params;
  try {
    const file = await findFile(fileId);
    res.setHeader("Content-type", "application/octet-stream");
    res.send(file.fileContent);
  } catch (error) {
    res.status(500).json({ error: "Error downloading file" });
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

exports.chatbot = async (req, res) => {
  const apiKey = process.env.GROQ_CHATBOT_API_KEY;
  const { input } = req.body;
  const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
  const MODEL = "llama3-8b-8192";
  try {
    const response = await axios.post(
      groqUrl,
      { messages: [{ role: "user", content: input }], model: MODEL },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveChatbotMessage = async (req, res) => {
  const userId = req.user.id;
  const { chatbotMessage, messageType } = req.body;
  if (!chatbotMessage) {
    return res.status(400).json({ error: "Error. No message detected" });
  }

  try {
    const newMessage = await prisma.chatbotMessage.create({
      data: {
        content: chatbotMessage,
        type: messageType,

        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatBotMessages = async (req, res) => {
  const userId = req.user.id;
  try {
    const allMessages = await prisma.chatbotMessage.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json(allMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
