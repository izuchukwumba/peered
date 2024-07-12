const axios = require("axios");
const prisma = require("../prisma/prisma_client");
require("dotenv").config();
const { userSocketMap } = require("../notification/socket");

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
    const userIds = group.members.map((member) => member.userId);
    const allUserIds = [...userIds, group.creatorId];
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      if (userSocketId) {
        userSocketId.emit("notify_group_create_file", {
          message: `User ${userId} has created a file: ${newFile.fileName}`,
          userId: allUserIds[user_id],
          senderId: userId,
          fileId: newFile.id,
          groupId: group.id,
          category: "file_created",
          isImportant: true,
        });
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
        error: "you do not have access to this group",
      });
    }

    const file = await prisma.file.findUnique({
      where: {
        id: parseInt(fileId),
      },
      include: {
        user: true,
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
    const file = await prisma.file.findUnique({
      where: {
        id: parseInt(fileId),
      },
      include: {
        codeGroup: {
          include: {
            members: true,
          },
        },
      },
    });
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
    const userIds = file.codeGroup.members.map((member) => member.userId);
    const allUserIds = [...userIds, file.codeGroup.creatorId];
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      if (userSocketId) {
        userSocketId.emit("notify_group_update_file", {
          message: `User ${userId} has edited file: ${file.fileName} in group: ${file.codeGroup.groupName}`,
          userId: allUserIds[user_id],
          senderId: userId,
          fileId: file.id,
          category: "file_updated",
          isImportant: true,
        });
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
    const userIds = group.members.map((member) => member.userId);
    const allUserIds = [...userIds, group.creatorId];
    for (const user_id in allUserIds) {
      const userSocketId = userSocketMap.get(allUserIds[user_id]);
      if (userSocketId) {
        userSocketId.emit("notify_group_delete_file", {
          message: `User ${userId} has deleted file: ${file.fileName} in group: ${group.groupName}`,
          userId: allUserIds[user_id],
          senderId: userId,
          fileId: file.id,
          groupId: group.id,
          category: "file_deleted",
          isImportant: true,
        });
      }
    }
    return res.status(200).json({
      message: `File named ${file.fileName} has been deleted`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute code" });
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
