"use client";

import { useEffect, useState } from "react";
import "./account.css";
import CashTracker from "./CashTracker"; 

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // ⭐ ADD THESE HERE ⭐
  const [transferIban, setTransferIban] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const [loanAmount, setLoanAmount] = useState("");

  const [closeEmail, setCloseEmail] = useState("");
  const [closePin, setClosePin] = useState("");

  // ---------------------
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

  if (loading) return <p>Loading account...</p>;
  if (!data) return <p>Not logged in</p>;

  const { user, account } = data;


 
const handleTransfer = async (e: any) => {
  e.preventDefault();

  const res = await fetch("/api/transactions", {
    method: "POST",
    credentials: "include",  // ← REQUIRED
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      toIban: transferIban,
      amount: Number(transferAmount),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Transfer failed");
    return;
  }

  alert("Transfer successful!");
  setTransferAmount("");
  setTransferIban("");
  loadAccount();
};


async function handleLoan(e: any) {
  e.preventDefault();

  const res = await fetch("/api/transactions/loan", {
    method: "POST",
    body: JSON.stringify({
      accountId: account.id,
      amount: Number(loanAmount)
    })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Loan denied");
    return;
  }

  alert("Loan approved!");
  setLoanAmount("");
  loadAccount();
}

const handleClose = async (e: any) => {
  e.preventDefault();

  const res = await fetch("/api/auth/delete", {
    method: "DELETE",
    credentials: "include", // ← REQUIRED
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: closeEmail,
      pin: closePin,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Failed to close account");
    return;
  }

  alert("Account deleted");
  document.cookie = "token=; Max-Age=0;";
  window.location.href = "/";
};



  return (
    <div className="sb-page">
      {/* NAV */}
      <nav className="sb-nav">
        <p className="welcome">Welcome back, {user.name}!</p>
        <img src="/img/logo.png" className="logo" />
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

      {/* IBAN + BALANCE */}
      <header className="sb-header">
        <div>
          <p className="iban-label">Your IBAN</p>
          <p className="iban-value">{account.iban}</p>
        </div>

        <div className="balance-box">
          <p className="balance-label">Current Balance</p>
          <p className="balance-value">{account.balance.toLocaleString()}£</p>
        </div>
      </header>

      {/* MAIN 2-COLUMN LAYOUT */}
      <main className="sb-main">
        
        {/* LEFT COLUMN = MOVEMENTS */}
        <section className="movements">
          <h3 className="section-title">Transactions</h3>

          {account.transactions.map((t: any, i: number) => (
            <div key={i} className="movements__row">
              <div
                className={`movements__type movements__type--${
                  t.type === "DEPOSIT" ? "deposit" : "withdrawal"
                }`}
              >
                {t.type}
              </div>

              <div className="movements__details">
                <p className="movements__desc">{t.description}</p>
                <p className="movements__date">
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>

              <p className="movements__value">
               {(t.type === "WITHDRAW" || t.type === "TRANSFER" ? "-" : "+") +
                   t.amount + "£"} 
              </p>
            </div>
          ))}
        </section>

        {/* RIGHT COLUMN = OPERATIONS */}
        <aside className="operations">

          {/* TRANSFER */}
          <div className="operation card-transfer">
            <h3>Transfer Money</h3>
           <form onSubmit={handleTransfer}>
  <input
    className="form__input"
    placeholder="Recipient IBAN"
    value={transferIban}
    onChange={(e) => setTransferIban(e.target.value)}
  />
  <input
    className="form__input"
    placeholder="Amount (£)"
    type="number"
    value={transferAmount}
    onChange={(e) => setTransferAmount(e.target.value)}
  />
  <button className="form__btn">Send</button>
</form>

          </div>

          {/* LOAN */}
          <div className="operation card-loan">
            <h3>Request Loan</h3>
          <form onSubmit={handleLoan}>
  <input
    className="form__input"
    placeholder="Amount (£)"
    type="number"
    value={loanAmount}
    onChange={(e) => setLoanAmount(e.target.value)}
  />
  <button className="form__btn">Apply</button>
</form>

          </div>

          {/* CLOSE */}
          <div className="operation card-close">
            <h3>Close Account</h3>
         <form onSubmit={handleClose}>
  <input
    className="form__input"
    placeholder="Confirm Email"
    value={closeEmail}
    onChange={(e) => setCloseEmail(e.target.value)}
  />
  <input
    className="form__input"
    placeholder="PIN"
    type="password"
    value={closePin}
    onChange={(e) => setClosePin(e.target.value)}
  />
  <button className="form__btn">Close</button>
</form>

          </div>

        </aside>
      </main>
      <CashTracker userId={user.id} />
    </div>
  );
}
