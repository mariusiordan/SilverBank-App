"use client";

import "../auth.css";

export default function LoginPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="signup-header">
          <img src="/img/logo.png" className="signup-logo" />
            </div>



        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to access your SilverBank account.</p>

        <form action="/api/auth/login" method="POST" className="auth-form">

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
