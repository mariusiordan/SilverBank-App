"use client";

import "../auth.css";

export default function SignupPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="signup-header">
        <img src="/img/logo.png" className="signup-logo" />
          </div>


        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join SilverBank and start banking smarter.</p>

        <form action="/api/auth/register" method="POST" className="auth-form">

          <input
            type="text"
            name="name"
            className="auth-input"
            placeholder="Full name"
            required
          />

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
            Sign Up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
