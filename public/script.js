console.log("script.js has loaded");
function toggleForm() {
  let loginForm = document.getElementById("loginnow");
  let registerForm = document.getElementById("registernow");
  let toggleText = document.getElementById("toggleText");
  let titleText = document.getElementById("titleText");
  const errorMsg = document.getElementById("errorMsg");

  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    titleText.innerHTML = "Login:";
    toggleText.innerHTML =
      "Don't have an account? <a href='#' onclick='toggleForm()'>Sign up now</a>";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    titleText.innerHTML = "Register:";
    toggleText.innerHTML =
      "Already have an account? <a href='#' onclick='toggleForm()'>Login now!</a>";
  }
}

function logout() {
  window.location.href = "/";
}

const usernameInput = document.querySelector(
  '#registernow input[name="username"]'
);
const validationMsg = document.querySelector(".validateUsername");

usernameInput.addEventListener("input", function () {
  const username = usernameInput.value.trim();

  // Show the message when user starts typing
  validationMsg.style.display = "block";

  if (username === "") {
    validationMsg.textContent = "Enter your username";
    validationMsg.style.color = "#e0e0e0";
    return;
  }

  if (username.length < 3) {
    validationMsg.textContent = "Username must be at least 3 characters long.";
    validationMsg.style.color = "#d35400";
    return;
  }

  const specialCharPattern = /[^a-zA-Z0-9]/;
  if (specialCharPattern.test(username)) {
    validationMsg.textContent = "Username mustn't contain special characters.";
    validationMsg.style.color = "#d35400";
    return;
  }

  // If valid
  validationMsg.textContent = "Username looks good! ✅";
  validationMsg.style.color = "#66ff66";
});
const registerForm = document.getElementById("registernow");
const passwordInput = registerForm.querySelector('input[name="password"]');
const passwordMsg = registerForm.querySelector(".validatePassword");

passwordInput.addEventListener("input", function () {
  const password = passwordInput.value.trim();

  // Show message when user starts typing
  passwordMsg.style.display = "block";

  if (password === "") {
    passwordMsg.textContent = "Enter your password";
    passwordMsg.style.color = "#e0e0e0";
    return;
  }

  if (password.length < 8) {
    passwordMsg.textContent = "Password must be at least 8 characters long.";
    passwordMsg.style.color = "#d35400";
    return;
  }

  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharPattern.test(password)) {
    passwordMsg.textContent =
      "Password must contain at least one special character.";
    passwordMsg.style.color = "#d35400";
    return;
  }

  // If valid
  passwordMsg.textContent = "Password looks good! ✅";
  passwordMsg.style.color = "#66ff66";
});

const loginForm = document.getElementById("loginnow");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission

  const formData = new FormData(loginForm);
  const data = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        // If response is not ok, display error
        return response.json().then((err) => {
          throw new Error(err.message || "Invalid username/password");
        });
      }
      return response.json();
    })
    .then((data) => {
      // Login successful
      console.log("Login successful:", data);
      window.location.href = data.redirect; // Redirect or show success message
    })
    .catch((error) => {
      // Display error message on the page
      errorMsg.style.display = "block";
      errorMsg.textContent = error.message;
    });
});
