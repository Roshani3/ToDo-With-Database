const express = require("express");
const app = express();
const fs = require("fs");
const session = require("express-session");
const multer = require("multer");
const mongoose = require("mongoose");

const db = require("./model/db");
const UserModel = require("./model/User");
const TodoModel = require("./model/Todo");

app.use(
  session({
    secret: "somesecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const profileImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profileimg") {
      cb(null, "profiles/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const todoImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "todoimg") {
      cb(null, "uploads/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadProfileImg = multer({ storage: profileImgStorage });
const uploadTodoImg = multer({ storage: todoImgStorage });

app.use(express.static("profiles/"));
app.use(express.static("uploads/"));

// Routes
app.get("/", validateUser, (req, res) => {
  readData(function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }

    res.render("index", {
      user: "Namaste, " + req.session.username,
      data: data,
      pic: req.session.pic,
    });
  });
});

app.get("/about", validateUser, (req, res) => {
  readData(function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.render("about", {
      user: "Namaste, " + req.session.username,
      data: data,
      pic: req.session.pic,
    });
  });
});

app.get("/contact", validateUser, (req, res) => {
  readData(function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.render("contact", {
      user: "Namaste, " + req.session.username,
      data: data,
      pic: req.session.pic,
    });
  });
});

app.get("/todo", validateUser, (req, res) => {
  readData(function (err, data) {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }

    res.render("todo", {
      user: "Namaste, " + req.session.username,
      data: data,
      pic: req.session.pic,
    });
  });
});

app.get("/todoScript.js", validateUser, (req, res) => {
  res.sendFile(__dirname + "/public/script/todoScript.js");
});

app.post("/todo", uploadTodoImg.single("todoimg"), (req, res) => {
  const inp = req.body.inp;
  const pri = req.body.pri;
  const todoimg = req.file;

  if (!inp || !pri || !todoimg) {
    return res.status(400).send("Bad Request: Missing fields");
  }

  const todo = new TodoModel({
    id: Date.now(),
    inp: inp,
    pri: pri,
    done: "pending",
    todoimg: todoimg.filename,
  });

  todo.save()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error("Error saving todo:", err);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/tododata", function (req, res) {
  TodoModel.find()
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      res.status(500).send("Internal Server Error");
    });
});

app.put("/todo", function (req, res) {
  TodoModel.updateOne({ id: req.body.id }, { done: req.body.done })
    .then(function () {
      res.status(200).send("Success");
    })
    .catch(function (err) {
      res.status(500).send("Internal Server Error");
    });
});

app.delete("/todo", function (req, res) {
  TodoModel.findOneAndDelete({ id: req.body.id })
    .then(function (data) {
      if (data && data.todoimg) {
        const imagePath = "./uploads/" + data.todoimg;
        fs.unlink(imagePath, function (err) {
          if (err) {
            console.error("Error deleting image:", err);
          }
        });
      }
      res.status(200).send("Success");
    })
    .catch(function (err) {
      res.status(500).send("Internal Server Error");
    });
});

app.get("/file", validateUser, function (req, res) {
  const file = fs.readFileSync("./new.mp4", "utf-8");
  res.send(file);
});

app.get("/login", (req, res) => {
  res.render("login", { error: "" });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("login", { error: "You have been logged out" });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  req.session.username = username;

  UserModel.findOne({ username: username, password: password })
    .then(function (user) {
      if (user) {
        req.session.isLoggedIn = true;
        req.session.pic = user.profileimg;
        res.redirect("/");
      } else {
        res.render("login", { error: "Invalid username or password" });
      }
    })
    .catch(function (err) {
      res.status(500).send("Internal Server Error");
    });
});

app.get("/register", (req, res) => {
  res.render("register", { error: "" });
});

app.post("/register", uploadProfileImg.single("profileimg"), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const profileimg = req.file;

  const user = new UserModel({
    username: username,
    password: password,
    email: email,
    profileimg: profileimg.filename,
  });

  user.save()
    .then(function (data) {
      console.log("User created");
      res.redirect("/login");
    })
    .catch(function (err) {
      console.log("Error creating user");
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

db.init()
  .then(function () {
    console.log("db connected");
    app.listen(3000, () => {
      console.log("server started at http://localhost:3000");
    });
  })
  .catch(function (err) {
    console.log("db connection failed");
    console.log(err);
  });

function readData(callback) {
  TodoModel.find()
    .then(function (data) {
      callback(null, data);
    })
    .catch(function (err) {
      callback(err);
    });
}

function validateUser(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.render("login", { error: "To view that page you must login first.." });
  }
}

function readData(callback) {
  fs.readFile("./data.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    if (data === "") {
      data = "[]";
    }
    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (error) {
      callback(error);
    }
  });
}