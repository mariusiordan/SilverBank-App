"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<any>(null);
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null);
  const [animBalance, setAnimBalance] = useState(false);

  // Inputs
  const [toIban, setToIban] = useState("");
  const [amount, setAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [closeUser, setCloseUser] = useState("");
  const [closePin, setClosePin] = useState("");

  // Load account data
  async function loadData() {
    const res = await fetch("/api/account");
    const data = await res.json();
    setAccountData(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  /** Small toast helper **/
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /** ===== TRANSFER MONEY ===== */
  const handleTransfer = async (e: any) => {
    e.preventDefault();

    if (!toIban || !amount) {
      showToast("Please fill all fields", "error");
      return;
    }

    const res = await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        userId: 1,
        toIban,
        amount: Number(amount),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Transfer failed", "error");
      return;
    }

    showToast("Transfer completed!");
    setToIban("");
    setAmount("");

    // Animate balance
    setAnimBalance(true);
    setTimeout(() => setAnimBalance(false), 600);

    loadData();
  };

  /** ===== LOAN REQUEST ===== */
  const handleLoan = async (e: any) => {
    e.preventDefault();

    if (!loanAmount || Number(loanAmount) <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }

    const res = await fetch("/api/transactions/loan", {
      method: "POST",
      body: JSON.stringify({
        userId: 1,
        amount: Number(loanAmount),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Loan failed", "error");
      return;
    }

    showToast("Loan approved!");
    setLoanAmount("");

    setAnimBalance(true);
    setTimeout(() => setAnimBalance(false), 600);

    loadData();
  };

  /** ===== CLOSE ACCOUNT ===== */
  const handleClose = async (e: any) => {
    e.preventDefault();

    if (closeUser !== accountData.user.email || closePin !== "1111") {
      showToast("Invalid user credentials", "error");
      return;
    }

    const res = await fetch("/api/auth/delete", {
      method: "DELETE",
      body: JSON.stringify({ userId: 1 }),
    });

    if (!res.ok) {
      showToast("Error closing account", "error");
      return;
    }

    showToast("Account closed. Goodbye!", "success");

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  if (loading) return <p className="p-8 text-lg">Loading account...</p>;

  const user = accountData?.user;
  const account = accountData?.account;
    if (!user || !account)
      return <p className="p-8 text-red-600">Error loading account data</p>;

  return (
    <main className="app p-8 relative">

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } animate-fade-in`}
        >
          {toast.msg}
        </div>
      )}

      {/* TOP NAV */}
      <nav className="flex items-center justify-between mb-6">
        <p className="text-xl font-semibold"> Welcome back, {user?.name ?? "Guest"}!</p>

        <img src="/img/logo.png" alt="Logo" className="w-16" />

        <button
          className="btn bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => (window.location.href = "/")}
        >
          Logout
        </button>
      </nav>

      {/* BALANCE */}
      <section
        className={`balance bg-white p-6 rounded-lg shadow mb-6 transition-all duration-500 ${
          animBalance ? "scale-[1.03] shadow-xl" : ""
        }`}
      >
        <div>
          <p className="text-gray-500">Current balance</p>
          <p className="text-sm">
            As of <span className="font-semibold">{new Date().toLocaleDateString()}</span>
          </p>
        </div>

        <p className="text-4xl font-bold">
          {account.balance.toLocaleString()}€
        </p>
      </section>

      {/* MOVEMENTS */}
      <section className="movements bg-white p-6 rounded-lg shadow mb-6">
        {account.transactions.length === 0 && <p>No transactions yet.</p>}

        {account.transactions.map((t: any, i: number) => (
          <div
            key={i}
            className={`flex justify-between border-b py-3 items-center ${
              i === 0 ? "animate-glow" : ""
            }`}
          >
            <div>
              <p
                className={
                  t.type === "DEPOSIT"
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {t.type.toLowerCase()}
              </p>
              <p className="text-gray-400 text-sm">
                {new Date(t.createdAt).toLocaleDateString()}
              </p>
            </div>

            <p className="text-lg">
              {t.type === "WITHDRAW" ? "-" : ""}{t.amount}€
            </p>
          </div>
        ))}
      </section>

      {/* SUMMARY */}
      <section className="summary bg-white p-6 rounded-lg shadow mb-6 grid grid-cols-3 gap-6">
        <div>
          <p className="text-gray-500">In</p>
          <p className="text-green-600 text-xl font-bold">
            {account.transactions
              .filter((t: any) => t.type === "DEPOSIT")
              .reduce((a: number, t: any) => a + t.amount, 0)}€
          </p>
        </div>

        <div>
          <p className="text-gray-500">Out</p>
          <p className="text-red-600 text-xl font-bold">
            {account.transactions
              .filter((t: any) => t.type === "WITHDRAW")
              .reduce((a: number, t: any) => a + t.amount, 0)}€
          </p>
        </div>

        <div>
          <p className="text-gray-500">Interest</p>
          <p className="text-blue-600 text-xl font-bold">0€</p>
        </div>
      </section>

      {/* ==== TRANSFER MONEY ==== */}
      <section className="operation bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl mb-4">Transfer money</h2>

        <form className="grid grid-cols-2 gap-4" onSubmit={handleTransfer}>
          <div className="flex flex-col">
            <label className="text-sm mb-1">Transfer to (IBAN)</label>
            <input
              className="form-input p-2 border rounded"
              value={toIban}
              onChange={(e) => setToIban(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Amount</label>
            <input
              className="form-input p-2 border rounded"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded col-span-2 mt-2"
            type="submit"
          >
            Send →
          </button>
        </form>
      </section>

      {/* ==== LOAN ==== */}
      <section className="operation bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl mb-4">Request loan</h2>

        <form className="flex gap-4 items-end" onSubmit={handleLoan}>
          <div className="flex flex-col w-full">
            <label className="text-sm mb-1">Amount</label>
            <input
              className="form-input p-2 border rounded"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
            Request →
          </button>
        </form>
      </section>

      {/* ==== CLOSE ACCOUNT ==== */}
      <section className="operation bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl mb-4">Close account</h2>

        <form className="grid grid-cols-2 gap-4" onSubmit={handleClose}>
          <div className="flex flex-col">
            <label className="text-sm mb-1">Confirm user (email)</label>
            <input
              className="form-input p-2 border rounded"
              value={closeUser}
              onChange={(e) => setCloseUser(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Confirm PIN</label>
            <input
              className="form-input p-2 border rounded"
              type="password"
              maxLength={4}
              value={closePin}
              onChange={(e) => setClosePin(e.target.value)}
            />
          </div>

          <button
            className="bg-red-700 text-white px-4 py-2 rounded col-span-2 mt-2"
            type="submit"
          >
            Close account →
          </button>
        </form>
      </section>
    </main>
  );
}
