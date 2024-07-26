const prisma = require("../prisma/prisma_client");

exports.saveNewNotification = async (req, res) => {
  const { data } = req.body;
  const receiverId = req.user.id;
  if (!data) {
    return res
      .status(400)
      .json({ error: "Error. Notification data is invalid" });
  }
  try {
    const newNotification = await prisma.notification.create({
      data: {
        data,
        user: {
          connect: { id: receiverId },
        },
      },
    });
    return res.status(201).json({
      message: "New notification added",
      notification: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to save notification",
    });
  }
};

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        id: "desc",
      },
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching notifications",
    });
  }
};

exports.updateReadNotifications = async (req, res) => {
  const { notifId } = req.params;
  const userId = req.user.id;
  try {
    const updatedNotif = await prisma.notification.update({
      where: {
        id: parseInt(notifId),
        receiverId: userId,
      },
      data: { isRead: true },
    });
    return res.status(201).json(updatedNotif);
  } catch (error) {
    res.status(500).json({
      error: "Error updating notifications",
    });
  }
};

exports.updateAllOfflineNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const updatedNotif = await prisma.notification.updateMany({
      where: {
        receiverId: userId,
      },
      data: { isOffline: false },
    });
    return res.status(201).json(updatedNotif);
  } catch (error) {
    res.status(500).json({
      error: "Error updating offline notifications",
    });
  }
};

exports.saveNewNotificationInteraction = async (req, res) => {
  const userId = req.user.id;
  const { category, notificationId } = req.body;
  try {
    await prisma.notificationInteractions.create({
      data: {
        userId: userId,
        timestamp: new Date(),
        category: category,
        notificationId: notificationId,
      },
    });
    return res.status(200).json(newInteraction);
  } catch (error) {
    res.status(500).json({
      error: "Error saving notification interaction",
    });
  }
};
