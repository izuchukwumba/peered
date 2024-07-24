const RecommendationTree = require("./recommendation_tree");
const prisma = require("../prisma/prisma_client");

const WEIGHTS = {
  availability: 0.3,
  interests: 0.4,
  skills: 0.3,
};
const NEAREST_NEIGHBOURS_TO_FIND = 10;

const calculateAvailabilityScore = (
  userAvailability,
  groupPreferredAvailability
) => {
  return userAvailability === groupPreferredAvailability ? 1 : 0;
};

const calculateArrayScore = (userValue, groupValue) => {
  let matchedValue = [];
  const flatArray = (arrayOfObjects) => {
    return arrayOfObjects.flatMap((value) =>
      Object.values(value).filter((val) => typeof val === "string")
    );
  };
  const flatUser = flatArray(userValue);
  const flatGroup = flatArray(groupValue);

  matchedValue = matchedValue.concat(
    flatUser.filter((value) => flatGroup.includes(value))
  );
  return matchedValue?.length / groupValue?.length;
};

const calculateVector = (user, group) => {
  const availabilityScore = calculateAvailabilityScore(
    user.availability,
    group?.preferred_availability
  );
  const skillScore = calculateArrayScore(user.skills, group?.preferred_skills);
  const interestScore = calculateArrayScore(user.interests, group?.category);
  return [
    availabilityScore * WEIGHTS.availability,
    interestScore * WEIGHTS.interests,
    skillScore * WEIGHTS.skills,
  ];
};

const recommendUsers = async (groupId) => {
  try {
    const group = await prisma.codeGroup.findUnique({
      where: {
        id: parseInt(groupId),
      },
      include: {
        preferred_skills: true,
        category: true,
      },
    });
    const allUsers = await prisma.user.findMany({
      include: {
        skills: true,
        interests: true,
      },
    });

    let userVectors = allUsers.map((user) => ({
      vector: calculateVector(user, group),
      user,
    }));

    const recommendationTree = new RecommendationTree(userVectors);

    const groupVector = calculateVector(
      {
        availability: group.preferred_availability,
        interests: group.category,
        skills: group.preferred_skills,
      },
      group
    );
    const nearestNeighbours = recommendationTree.findNearestNeighbours(
      groupVector,
      NEAREST_NEIGHBOURS_TO_FIND
    );

    return nearestNeighbours.map((neighbour) => ({
      user: neighbour.user,
      score: neighbour.vector.reduce((a, b) => a + b),
    }));
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = recommendUsers;
