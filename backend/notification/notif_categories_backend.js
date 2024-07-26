const notif_categories = {
  added_to_group: "added_to_group",
  file_created: "file_created",
  file_updated: "file_updated",
  file_deleted: "file_deleted",
};

const socket_names = {
  connection: "connection",
  disconnect: "disconnect",
  register: "register",
  rate_limit: "rate-limit",
  group_notifications: "notify_group",
  added_user_to_group: "added_user_to_group",
};

module.exports = { notif_categories, socket_names };
