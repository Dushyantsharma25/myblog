import express from "express";
import { dirname, join } from "path";
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
    const username = req.query.user;

    if (username && users.has(username)) {
        res.locals.Username = username;
    } else {
        res.locals.Username = null;
    }

    next();
});


app.get("/logout", (req, res) => {
  const username = req.query.user;

  if (username && users.has(username)) {
    const userData = users.get(username);
    userData.islogged = false;
    users.set(username, userData);
  }

  res.redirect("/");
});

app.post("/register", (req, res) => {
  const username = req.body["name"];
  const password = req.body["pass"];

  if (users.has(username)) {
    res.send(`User already exists. Please login.<br><a href="./login">Login</a>`);
  } else {
    users.set(username, {
      password: password,
      islogged: false
    });
    res.send(`Registration successful!<br><a href="./login">Login</a>`);
  }
});

app.get("/profile", (req, res) => {
  const username = req.query.user;

  if (username && users.has(username)) {
    const userData = users.get(username);

    if (userData.islogged) {
      res.render(dn + "/views/user/blogpost.ejs", {
        Username: username,
        posts: posts.reverse()
      });
    } else {
      res.render(dn + "/views/user/logout.ejs");
    }

  } else {
    res.redirect("/login");
  }
});

app.post("/login", (req, res) => {
  const username = req.body["name"];
  const password = req.body["pass"];

  if (users.has(username)) {
    const userData = users.get(username);

    if (userData.password === password) {
      userData.islogged = true;
      users.set(username, userData);

     
      res.redirect("/profile?user=" + username);
    } else {
      res.send("Incorrect password!");
    }
  } else {
    res.send("User does not exist!");
  }
});

app.get("/login", (req, res) => {
  res.render(dn + "/views/up/login.ejs", {});
});

app.get("/register", (req, res) => {
  res.render(dn + "/views/up/register.ejs", {});
});

app.get("/blogs", (req, res) => {
    const username = req.query.user;

    res.render(dn + "/views/up/blogs.ejs", {
        Username: username || null,
        posts: posts.reverse()
    });
});

app.get("/contacts", (req, res) => {
  res.render(dn + "/views/up/contacts.ejs", {});
});

app.get("/about", (req, res) => {
  res.render(dn + "/views/up/about.ejs", {});
});

app.get("/", (req, res) => {
  const username = req.query.user;

  const topPosts = posts.slice(-3).reverse();

  res.render(dn + "/views/index.ejs", {
    Username: username || null,
    posts: topPosts
  });
});

app.post("/profile", (req, res) => {
  const username = req.query.user;

  if (username && users.has(username)) {
    const userData = users.get(username);

    if (userData.islogged) {
      const date = new Date();

      posts.push({
        user: username,
        title: req.body["title"],
        text: req.body["text"],
        date_created: date.toDateString(),
        time_created: date.toLocaleTimeString()
      });

      res.redirect("/profile?user=" + username);
    } else {
      res.redirect("/login");
    }

  } else {
    res.redirect("/login");
  }
});

app.post("/delete", (req, res) => {
    const username = req.query.user;
    const index = req.body["index"];

    if (username && users.has(username)) {
        posts.splice(index, 1);
        res.redirect("/profile?user=" + username);
    } else {
        res.redirect("/login");
    }
});


app.post("/update", (req, res) => {
  const username = req.query.user;
  const index = req.body["index"];

  if (username && users.has(username)) {
    res.render(dn + "/views/user/update.ejs", {
      Username: username,
      posts: posts,
      index: index,
    });
  } else {
    res.redirect("/login");
  }
});


app.post("/post_update", (req, res) => {
  const username = req.query.user;
  const index = req.body["index"];
  const Title = req.body["title"];
  const content = req.body["text"];

  if (username && users.has(username)) {

    posts.splice(index, 1);

    const date = new Date();

    posts.push({
      user: username,
      title: Title,
      text: content,
      date_created: date.toDateString(),
      time_created: date.toLocaleTimeString()
    });

    res.redirect("/profile?user=" + username);

  } else {
    res.redirect("/login");
  }
});


// app.get("/")

app.listen(port, () => {
  console.log(`App is started on ${port}`);
  console.log(`http://localhost:${port}`);
});




