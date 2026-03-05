"use client";
import "../auth.css";

export default function LoginPage() {
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = (form.elements.namedItem("email") as HTMLInputElement).value;
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) { alert("Invalid login"); return; }
    window.location.href = "/account";
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="signup-header">
          {/* ✅ Link către homepage */}
          <a href="/"><img src="/img/logo.png" className="signup-logo" /></a>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to access your SilverBank account.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <input type="email" name="email" className="auth-input" placeholder="Email address" required />
          <input type="password" name="password" className="auth-input" placeholder="Password" required />
          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p className="auth-switch">Don't have an account? <a href="/signup">Create one</a></p>
        {/* ✅ Link homepage */}
        <p className="auth-switch"><a href="/">← Back to homepage</a></p>
      </div>
    </div>
  );
}