"use client";

import { useEffect, useState } from "react";
import "./account.css";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  async function loadAccount() {
    const res = await fetch("/api/account");
    if (!res.ok) return;
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => {
    loadAccount();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!data) return <p>Not logged in.</p>;

  const { user, account } = data;

  return (
    <div className="sb-page">
      {/* NAVBAR */}
      <nav className="sb-nav">
        <p className="sb-welcome">Welcome back, {user.name}!</p>
        <img src="/img/logo.png" className="sb-logo" />
        <button
          className="sb-btn-logout"
          onClick={() => {
            document.cookie = "token=; Max-Age=0;";
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </nav>

      {/* MAIN GRID */}
      <main className="sb-grid">
        {/* LEFT SIDE – MOVEMENTS */}
        <section className="sb-movements">
          <h3 className="sb-section-title">Recent Activity</h3>

          {account.transactions.map((t: any, i: number) => (
            <div key={i} className="sb-movement-row">
              <span
                className={`sb-movement-type ${
                  t.type === "DEPOSIT"
                    ? "sb-deposit"
                    : "sb-withdraw"
                }`}
              >
                {t.type}
              </span>

              <span className="sb-movement-date">
                {new Date(t.createdAt).toLocaleDateString()}
              </span>

              <span className="sb-movement-amount">
                {t.type === "WITHDRAW" ? "-" : "+"}
                {t.amount}£
              </span>
            </div>
          ))}
        </section>

        {/* RIGHT SIDE – SUMMARY + ACTIONS */}
        <section className="sb-right">
          {/* BALANCE */}
          <div className="sb-balance-box">
            <div>
              <p className="sb-balance-label">Current balance</p>
              <p className="sb-balance-date">
                As of {new Date().toLocaleDateString()}
              </p>
            </div>
            <p className="sb-balance-value">
              {account.balance.toLocaleString()}£
            </p>
          </div>

          {/* SUMMARY */}
          <div className="sb-summary">
            <div>
              <p className="sb-sum-label">IN</p>
              <p className="sb-sum-value sb-sum-in">
                {account.transactions
                  .filter((t: any) => t.type === "DEPOSIT")
                  .reduce((a: number, t: any) => a + t.amount, 0)}£
              </p>
            </div>

            <div>
              <p className="sb-sum-label">OUT</p>
              <p className="sb-sum-value sb-sum-out">
                {account.transactions
                  .filter((t: any) => t.type === "WITHDRAW")
                  .reduce((a: number, t: any) => a + t.amount, 0)}£
              </p>
            </div>

            <div>
              <p className="sb-sum-label">INTEREST</p>
              <p className="sb-sum-value sb-sum-interest">0£</p>
            </div>
          </div>

          {/* TRANSFER */}
          <div className="sb-operation sb-op-transfer">
            <h3>Transfer Money</h3>
            <form className="sb-form">
              <input placeholder="IBAN" className="sb-input" />
              <input placeholder="Amount" type="number" className="sb-input" />
              <button className="sb-btn-op">→</button>
            </form>
          </div>

          {/* LOAN */}
          <div className="sb-operation sb-op-loan">
            <h3>Request Loan</h3>
            <form className="sb-form">
              <input placeholder="Amount" type="number" className="sb-input" />
              <button className="sb-btn-op">→</button>
            </form>
          </div>

          {/* CLOSE ACCOUNT */}
          <div className="sb-operation sb-op-close">
            <h3>Close Account</h3>
            <form className="sb-form">
              <input placeholder="Email" className="sb-input" />
              <input placeholder="PIN" type="password" className="sb-input" />
              <button className="sb-btn-op">→</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
