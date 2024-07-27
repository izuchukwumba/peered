const recommendUsers = require("./user_recommendation");

exports.recommendPeers = async (req, res) => {
  const { groupId } = req.params;
  const recommendations = await recommendUsers(groupId);
  return res.status(200).json(recommendations);
};
