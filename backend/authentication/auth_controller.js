const axios = require("axios");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma_client");
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
        error: err.message,
      });
    }
  },
];

// exports.register = async (req, res) => {
//   const { username, email, password, fullName } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//     const user = await prisma.user.create({
//       data: {
//         username,
//         email,
//         password: hashedPassword,
//         fullName,
//       },
//     });
//     // res.status(200).json({
//     //   message: "Account created successfully",
//     // });
//     res.redirect(`${FRONTEND_URL}/login`);
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// };

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "Lax" });
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({
        messsage: "Wrong password",
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
      path: "/home",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({
      error: err.message,
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
    const token = jwt.sign({ accessToken, userInfo }, JWT_SECRET, {
      expiresIn: "1h",
    });
    //Bind cookie to response
    res.cookie("jwt", token, {
      httpOnly: false,
    });

    res.redirect(`${FRONTEND_URL}/auth/callback`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwt", { httpOnly: true });
  // res.status(200).json({ message: "Logged out successfully" });
  res.redirect(`${FRONTEND_URL}/`);
};
