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

  if (loading) return <p>Loading your account…</p>;
  if (!data) return <p>Not logged in.</p>;

  const { user, account } = data;

  return (
    /** ⭐ THIS WRAPS THE PAGE AND ACTIVATES ALL CSS */
    <div className="sb-account-page">

      {/* TOP NAV */}
      <nav className="bank-nav">
        <p className="welcome">Welcome back, {user.name}!</p>
        <img src="/img/logo.png" alt="Logo" className="logo" />

        <button
          className="btn-logout"
          onClick={() => {
            document.cookie = "token=; Max-Age=0;";
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </nav>

      {/* MAIN APP */}
      <main className="app">

        {/* BALANCE */}
        <div className="balance">
          <div>
            <p className="balance__label">Current balance</p>
            <p className="balance__date">
              As of {new Date().toLocaleDateString()}
            </p>
          </div>
          <p className="balance__value">{account.balance.toLocaleString()}£</p>
        </div>

        {/* MOVEMENTS */}
        <div className="movements">
          {account.transactions.map((t: any, i: number) => (
            <div key={i} className="movements__row">
              <div
                className={`movements__type movements__type--${
                  t.type === "DEPOSIT" ? "deposit" : "withdrawal"
                }`}
              >
                {t.type.toLowerCase()}
              </div>
              <div className="movements__date">
                {new Date(t.createdAt).toLocaleDateString()}
              </div>
              <div className="movements__value">
                {t.type === "WITHDRAW" ? "-" : "+"}
                {t.amount}£
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="summary">
          <p className="summary__label">In</p>
          <p className="summary__value summary__value--in">
            {account.transactions
              .filter((t: any) => t.type === "DEPOSIT")
              .reduce((a: number, t: any) => a + t.amount, 0)}
            £
          </p>

          <p className="summary__label">Out</p>
          <p className="summary__value summary__value--out">
            {account.transactions
              .filter((t: any) => t.type === "WITHDRAW")
              .reduce((a: number, t: any) => a + t.amount, 0)}
            £
          </p>

          <p className="summary__label">Interest</p>
          <p className="summary__value summary__value--interest">0£</p>

          <button className="btn--sort">↓ SORT</button>
        </div>

        {/* TRANSFER */}
        <div className="operation operation--transfer">
          <h2>Transfer money</h2>
          <form className="form form--transfer">
            <input type="text" className="form__input form__input--to" />
            <input type="number" className="form__input form__input--amount" />
            <button className="form__btn form__btn--transfer">→</button>
            <label className="form__label">Transfer to</label>
            <label className="form__label">Amount</label>
          </form>
        </div>

        {/* LOAN */}
        <div className="operation operation--loan">
          <h2>Request loan</h2>
          <form className="form form--loan">
            <input type="number" className="form__input" />
            <button className="form__btn form__btn--loan">→</button>
            <label className="form__label form__label--loan">Amount</label>
          </form>
        </div>

        {/* CLOSE ACCOUNT */}
        <div className="operation operation--close">
          <h2>Close account</h2>
          <form className="form form--close">
            <input type="text" className="form__input form__input--user" />
            <input type="password" className="form__input form__input--pin" />
            <button className="form__btn form__btn--close">→</button>
            <label className="form__label">Confirm user</label>
            <label className="form__label">Confirm PIN</label>
          </form>
        </div>

        <p className="logout-timer">
          You will be logged out in <span className="timer">05:00</span>
        </p>

      </main>
    </div>
  );
}
