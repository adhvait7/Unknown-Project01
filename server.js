const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session middleware
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false, // ✅ Prevents storing empty sessions
    cookie: {
      secure: false,
      sameSite: "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    }, // ✅ 1-day session
  })
);

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "userdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

// Helper function to hash passwords
const hashPasswords = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Check if user exists
const checkUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, result) => {
        if (err) return reject({ message: "Database error", error: err });
        if (result.length === 0) return reject({ message: "User not found" });
        resolve(result);
      }
    );
  });
};

// User registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await hashPasswords(password);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?,?,?)",
    [username, email, hashedPassword],
    (err, result) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.redirect("/dashboard.html");
    }
  );
});

// User login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await checkUsername(username);

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Invalid username" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Store session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Ensure session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session error" });
      }
      res.json({ success: true, redirect: "/dashboard.html" });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Logout Failed" });
    }
    res.redirect("/index.html");
  });
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized - Please Log in." });
  }
  next();
};

// Dashboard route
app.get("/dashboard", (req, res) => {
  console.log("📌 Checking session for dashboard:", req.session);

  if (!req.session.userId) {
    console.log("🔴 No session found! Redirecting to index.html...");
    res.redirect("/index.html");
  } else {
    console.log("✅ Session exists! Serving dashboard.html...");
    res.sendFile(__dirname + "/public/dashboard.html");
  }
});

// Check session status
app.get("/check-session", (req, res) => {
  console.log("Session Data:", req.session); // Log session details in terminal

  if (req.session.userId) {
    res.json({ isLoggedIn: true });
  } else {
    res.json({ isLoggedIn: false });
  }
});

// Start server
app.listen(3000, () =>
  console.log("🚀 Server running on port 3000\nhttp://localhost:3000/")
);
