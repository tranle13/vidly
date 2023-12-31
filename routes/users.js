const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// GET log in
router.get("/me", auth, async (req, res) => {
  // req.user._id comes from jwt
  const user = User.findById(req.user._id).select("-password");
  res.send(user);
});

// POST register
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  // this could be stored on the client to get info about current user
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
