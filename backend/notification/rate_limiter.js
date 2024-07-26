const prisma = require("../prisma/prisma_client");

class RateLimiter {
  constructor(timeWindow, maximumRequests) {
    this.timeWindow = timeWindow * 1000;
    this.maximumRequests = maximumRequests;
    this.userRequestMap = new Map();
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
    const hourCounts = {};
    interactions.forEach((item) => {
      const hour = new Date(item.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const sortedHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([hour]) => parseInt(hour));
    return sortedHours.slice(0, 3);
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
    const isUserActiveTimeWindow = userMostActiveHours.includes(currentHour);
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
      return {
        isRateLimited: true,
      };
    }
    requests.push(currentTime);
    this.userRequestMap.set(userId, requests);
    return {
      isRateLimited: false,
    };
  }
}

module.exports = RateLimiter;
