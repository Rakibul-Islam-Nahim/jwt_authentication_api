require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

app.listen(3000);
app.use(express.json());

const users = [];
let isLogin = false;

const posts = [
  {
    name: "Sakib",
    content: "this is my first post",
  },
  {
    name: "Sushil",
    content: "I am beautiful so I dont need to code anything",
  },
  {
    name: "Nahim",
    content: "Hello my name is nahim and I am a software engineer",
  },
];

app.get("/posts", authentication, (req, res) => {
  const user = req.user.naming; // the middle ware return the jwt object. This object is the modle what we create . means its the decoded version of the token. so the parameter I set as a model is naming
  const userPosts = posts.find((post) => post.name === user);
  if (userPosts) {
    return res.json(userPosts);
  }
  res.status(404).send(`No posts found for this ${user}`);
});

app.post("/signup", async (req, res) => {
  const sault = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body["password"], sault);
  const name = req.body["name"];
  const user = { name: name, password: hashedPassword };
  const formate = { naming: name }; // this will be the module of the token. means the decode token has the title naming for the username
  const token = jwt.sign(formate, process.env.ACCESS_TOKEN_SECRET);
  res.json({ token: token, messaeg: "User Created Successfully" });
  users.push(user);
});

app.post("/login", async (req, res) => {
  const name = req.body["name"];
  const password = req.body["password"];
  const user = users.find((user) => user.name === name);
  if (!user) {
    return res.status(404).send("User not found");
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      isLogin = true;
      return res.send("Login Successful");
    } else {
      return res.status(401).send("Invalid Password");
    }
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
});

function authentication(req, res, next) {
  if (!isLogin) {
    return res.status(401).send("Unauthorized");
  }
  const HeaderPart = req.headers["authorization"];
  const token = HeaderPart && HeaderPart.split(" ")[1];
  if (token == "null") {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("Forbidden");
    }
    req.user = user;
    next();
  });
}

app.get("/user", (req, res) => {
  res.json(users);
});
