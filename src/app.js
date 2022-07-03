const express = require("express");
const app = express();
const mongoose = require("mongoose");
const user = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWTSecret = "kosadkapoqwpooiADJON";

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/picturesproject").catch((err) => {
  console.log(err);
});

let User = mongoose.model("User", user);

app.get("/", (req, res) => {
  res.json({});
});

app.post("/user", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.sendStatus(400);
  }

  try {
    let user = await User.findOne({ email: email });

    if (user) {
      return res.status(400).json({ err: "E-mail já cadastrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let newUser = new User({ name, email, password: hash });
    await newUser.save();

    return res.status(201).json({ email });
  } catch (err) {
    return res.sendStatus(500);
  }
});

app.delete("/user/:email", async (req, res) => {
  const { email } = req.params;

  await User.deleteOne({ email: email });
  return res.sendStatus(200);
});

app.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(403)
      .json({ errors: { email: "O usuário não está cadastrado!" } });
  }

  const isAuthenticated = await bcrypt.compare(password, user.password);

  if (!isAuthenticated) {
    return res
      .status(403)
      .json({ errors: { password: "Usuário ou senha incorretos" } });
  }

  jwt.sign(
    { email, name: user.name, id: user._id },
    JWTSecret,
    { expiresIn: "48h" },
    (err, token) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      } else {
        res.json({ token });
      }
    }
  );
});

module.exports = app;
