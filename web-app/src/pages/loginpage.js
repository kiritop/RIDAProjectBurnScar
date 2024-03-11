import React from "react";
import "../loginpage.css";

function LoginPage() {
  return (
    <div className="App">
      <div className="login-container">
        <h2>Login with Google</h2>

        <img src="google-icon.png" alt="Google Icon" />
        <span>Login with Google</span>
      </div>
    </div>
  );
}

export default LoginPage;
