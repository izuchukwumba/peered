class RateLimiter {
  constructor(time_window, maximum_requests) {
    this.time_window = time_window * 1000;
    this.maximum_requests = maximum_requests;
    this.userRequestMap = new Map();
  }

  useRateLimiter(userId) {
    const currentTime = Date.now();

    if (!this.userRequestMap.has(userId)) {
      this.userRequestMap.set(userId, []);
    }
    const requests = this.userRequestMap.get(userId);

    while (
      requests.length > 0 &&
      currentTime - requests[0] > this.time_window
    ) {
      requests.shift();
    }
    if (requests.length >= this.maximum_requests) {
      const timeTillReset =
        (this.time_window - (currentTime - requests[0])) / 1000;
      return {
        error: true,
        message: `Too many notifications sent to the same user. New notifications will be sent to user after ${timeTillReset} seconds`,
      };
    }
    requests.push(currentTime);
    this.userRequestMap.set(userId, requests);
  }
}

module.exports = RateLimiter;
