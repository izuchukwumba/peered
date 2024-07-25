const prisma = require("../prisma/prisma_client");

class RateLimiter {
  constructor(timeWindow, maximumRequests) {
    this.timeWindow = timeWindow * 1000;
    this.maximumRequests = maximumRequests;
    this.userRequestMap = new Map();
  }

  async saveNotificationInteraction(userId, category, notificationId) {
    await prisma.notificationInteractions.create({
      data: {
        userId: userId,
        timestamp: new Date(),
        category: category,
        notificationId: notificationId,
      },
    });
  }

  async getNotificationInteractionsData(userId) {
    const interactions = await prisma.notificationInteractions.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        timestamp: "desc",
      },
    });
    return interactions;
  }

  async getUserMostActiveTimeWIndows(userId) {
    const interactions = await this.getNotificationInteractionsData(userId);
    const hourCounts = new Array(24).fill(0);
    interactions.forEach((item) => {
      const hour = new Date(item.timestamp).getHours();
      hourCounts[hour]++;
    });

    const activeHours = hourCounts.map((numberOfClicks, hourIndex) => ({
      hourIndex,
      numberOfClicks,
    }));
    return activeHours
      .sort((a, b) => b.numberOfClicks - a.numberOfClicks)
      .slice(0, 3); //Returns top user's top 3 active hours
  }

  async getUserPreferredNotificationCategory(userId) {
    const interactions = await this.getNotificationInteractionsData(userId);
    const categoriesCount = {};
    interactions.forEach((item) => {
      categoriesCount[item.category] =
        (categoriesCount[item.category] || 0) + 1;
    });
    const sortedCategories = Object.entries(categoriesCount).sort(
      (a, b) => b[1] - a[1]
    );
    return sortedCategories[0][0]; //Returns most preffered category
  }

  async useRateLimiter(userId, category) {
    const currentTime = Date.now();
    const currentHour = new Date().getHours();
    const userMostActiveHours = await this.getUserMostActiveTimeWIndows(userId);
    const userActiveHours = userMostActiveHours.filter(
      (item) => item.hourIndex === currentHour
    );
    const isUserActiveTimeWindow = userActiveHours.length > 0;
    const preferredNotificationCategory =
      await this.getUserPreferredNotificationCategory();

    let dynamicTimeWindow = this.timeWindow;
    let dynamicMaximumRequests = this.maximumRequests;

    if (isUserActiveTimeWindow && preferredNotificationCategory === category) {
      dynamicTimeWindow = this.timeWindow / 3;
      dynamicMaximumRequests = this.maximumRequests * 3;
    } else if (
      isUserActiveTimeWindow ||
      preferredNotificationCategory === category
    ) {
      dynamicTimeWindow = this.timeWindow / 2;
      dynamicMaximumRequests = this.maximumRequests * 2;
    }

    if (!this.userRequestMap.has(userId)) {
      this.userRequestMap.set(userId, []);
    }
    const requests = this.userRequestMap.get(userId);
    while (
      requests.length > 0 &&
      currentTime - requests[0] > dynamicTimeWindow
    ) {
      requests.shift();
    }

    if (requests.length >= dynamicMaximumRequests) {
      const timeTillReset =
        (dynamicTimeWindow - (currentTime - requests[0])) / 1000;
      return {
        isRateLimited: true,
        timeTillReset: timeTillReset,
        message: `Too many notifications sent to the same user. New notifications will be sent to user after ${timeTillReset} seconds`,
      };
    }

    requests.push(currentTime);
    this.userRequestMap.set(userId, requests);
    return {
      isRateLimited: false,
      timeLeft: (dynamicTimeWindow - (currentTime - requests[0])) / 1000,
      requestLeft: dynamicMaximumRequests - requests.length,
      message: "Notification will be sent to receiver",
    };
  }
}

module.exports = RateLimiter;
