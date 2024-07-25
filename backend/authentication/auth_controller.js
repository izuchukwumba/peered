const axios = require("axios");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prisma_client");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
require("dotenv").config();

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

exports.register = [
  //Validation checks
  check("username", "Username is required").not().isEmpty(),
  check("email", "Please add email address").not().isEmpty(),
  check("password", "Password must be at least 5 characters").isLength({
    min: 5,
  }),
  check("fullName", "Add first and last name").not().isEmpty(),

  //router handler
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password, fullName } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
        },
      });
      res.redirect(`${FRONTEND_URL}/login`);
    } catch (err) {
      res.status(500).json({
        error: "Error creating account. Try again.",
      });
    }
  },
];

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "Lax" });
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({
        messsage: "Invalid username or password",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });
    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({
      error: "Error logging in. Try again",
    });
  }
};

exports.githubAuth = (req, res) => {
  const redirect_uri = `${BACKEND_URL}/auth/github/callback`;
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}`
  );
};

exports.githubCallback = async (req, res) => {
  const { code } = req.query;
  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  };
  const opts = {
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      body,
      opts
    );
    if (response.data.error) {
      throw new Error(response.data.error_description);
    }
    const accessToken = response.data.access_token;

    const userInfoResponse = await axios.get("https:api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });
    const userInfo = userInfoResponse.data;

    let user = await prisma.user.findUnique({
      where: { username: userInfo.login },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: userInfo.login,
          email: userInfo.email,
          fullName: userInfo.name,
          imageUrl: userInfo.avatar_url || null,
        },
      });
    }
    //Generate JWT
    const token = jwt.sign(
      { accessToken, id: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    //Bind cookie to response
    res.cookie("jwt", token, {
      httpOnly: false,
    });

    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update User Profile
exports.updateProfile = async (req, res) => {
  const { username } = req.params;
  const { newFullName, newImageUrl, availability, skills, interests } =
    req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    let newProfileData = {};

    if (newFullName) {
      newProfileData.fullName = newFullName;
    }
    if (newImageUrl) {
      newProfileData.imageUrl = newImageUrl;
    }
    if (availability) {
      newProfileData.availability = availability;
    }

    const updatedUserProfile = await prisma.user.update({
      where: {
        username: username,
      },
      data: newProfileData,
    });

    if (interests && interests.length > 0) {
      await prisma.interest.deleteMany({
        where: {
          userId: user.id,
        },
      });

      const InterestData = interests.map((interest) => ({
        interest: interest,
        userId: user.id,
      }));
      await prisma.interest.creatMany({
        data: InterestData,
      });
    }
    if (skills && skills.length > 0) {
      await prisma.skill.deleteMany({
        where: {
          userId: user.id,
        },
      });

      const skillData = skills.map((skill) => ({
        skill: skill,
        userId: user.id,
      }));
      await prisma.skill.creatMany({
        data: skillData,
      });
    }
    const updatedProfile = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({
      error: "Error updating user profile",
    });
  }
};

//Fetch User Info
exports.getUserInfo = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        skills: true,
        interests: true,
        groups_created: true,
        groups_added_to: true,
        files_created: true,
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching user info",
    });
  }
};

//Log Out
exports.logout = (req, res) => {
  res.clearCookie("jwt", { httpOnly: true });
  res.redirect(`${FRONTEND_URL}/`);
};
