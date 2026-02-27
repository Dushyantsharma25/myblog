import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import session from "express-session";

const dn = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

const users = new Map();   
const posts = [];

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});


app.use((req, res, next) => {
  res.locals.Username = req.session.username || null;
  next();
});




app.post("/register", (req, res) => {
  const username = req.body.name;
  const password = req.body.pass;

  if (users.has(username)) {
    return res.send("User already exists. Please login.");
  }

  users.set(username, password);
  res.redirect("/login");
});


app.post("/login", (req, res) => {
  const username = req.body.name;
  const password = req.body.pass;

  if (!users.has(username)) {
    return res.send("User does not exist.");
  }

  if (users.get(username) !== password) {
    return res.send("Incorrect password.");
  }

  
  req.session.username = username;

  res.redirect("/profile");
});


app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});




app.get("/profile", (req, res) => {

  if (!req.session.username) {
    return res.redirect("/login");
  }

  const userPosts = posts.filter(p => p.user === req.session.username);

  res.render(dn + "/views/user/blogpost.ejs", {
    posts: userPosts
  });
});




app.post("/profile", (req, res) => {

  if (!req.session.username) {
    return res.redirect("/login");
  }

  const date = new Date();

  posts.push({
    user: req.session.username,
    title: req.body.title,
    text: req.body.text,
    date_created: date.toDateString(),
    time_created: date.toLocaleTimeString()
  });

  res.redirect("/profile");
});


app.post("/delete", (req, res) => {

  if (!req.session.username) {
    return res.redirect("/login");
  }

  const index = req.body.index;

  if (posts[index] && posts[index].user === req.session.username) {
    posts.splice(index, 1);
  }

  res.redirect("/profile");
});


app.post("/update", (req, res) => {

  if (!req.session.username) {
    return res.redirect("/login");
  }

  const index = req.body.index;

  if (!posts[index] || posts[index].user !== req.session.username) {
    return res.redirect("/profile");
  }

  res.render(dn + "/views/user/update.ejs", {
    post: posts[index],
    index: index
  });
});


app.post("/post_update", (req, res) => {

  if (!req.session.username) {
    return res.redirect("/login");
  }

  const index = req.body.index;

  if (posts[index] && posts[index].user === req.session.username) {

    posts[index].title = req.body.title;
    posts[index].text = req.body.text;

    const date = new Date();
    posts[index].date_created = date.toDateString();
    posts[index].time_created = date.toLocaleTimeString();
  }

  res.redirect("/profile");
});




app.get("/", (req, res) => {
  const topPosts = posts.slice(-3).reverse();
  res.render(dn + "/views/index.ejs", { posts: topPosts });
});


app.get("/blogs", (req, res) => {
  res.render(dn + "/views/up/blogs.ejs", {
    posts: posts.slice().reverse()
  });
});


app.get("/login", (req, res) => {
  res.render(dn + "/views/up/login.ejs");
});

app.get("/register", (req, res) => {
  res.render(dn + "/views/up/register.ejs");
});

app.get("/about", (req, res) => {
  res.render(dn + "/views/up/about.ejs");
});

app.get("/contacts", (req, res) => {
  res.render(dn + "/views/up/contacts.ejs");
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});