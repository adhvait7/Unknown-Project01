const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const app = express();

app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "userdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅Connected to MySQL");
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const hashPasswords = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const checkUsername = async function (username) {
  const sql = "SELECT * FROM users WHERE username = ?";
  return new Promise((resolve, reject) => {
    db.query(sql, [username], (err, result) => {
      if (err) {
        console.error("Database query error", err);
        return reject({ message: "Database error" });
      }
      if (result.length === 0) {
        return reject({ message: "User not found" });
      } else {
        return resolve(result);
      }
    });
  });
};
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await hashPasswords(password);

  const sql = "INSERT INTO users (username, email, password) VALUES (?,?,?)";
  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.redirect("/dashboard.html");
    //res.status(201).json({ message: "User registered successfully.!" });
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await checkUsername(username);
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Send JSON with redirect URL
    res
      .status(200)
      .json({ message: "Login successful", redirect: "/dashboard.html" });
  } catch (error) {
    res.status(400).json({ message: "An error occurred during login" });
  }
});

app.listen(3000, () =>
  console.log("🚀 Server running on port 3000\nhttp://localhost:3000/")
);
