"use client";

import "../auth.css";

export default function LoginPage() {
  async function handleLogin(e) {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert("Invalid login");
    return;
  }

  window.location.href = "/account"; // redirect after login
}

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="signup-header">
          <img src="/img/logo.png" className="signup-logo" />
            </div>



        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to access your SilverBank account.</p>

        <form onSubmit={handleLogin} className="auth-form">


          <input
            type="email"
            name="email"
            className="auth-input"
            placeholder="Email address"
            required
          />

          <input
            type="password"
            name="password"
            className="auth-input"
            placeholder="Password"
            required
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <a href="/signup">Create one</a>
        </p>
      </div>
    </div>
  );
}
