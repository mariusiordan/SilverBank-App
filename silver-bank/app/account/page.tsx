"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/account");
      const data = await res.json();
      setAccountData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <p className="p-8 text-lg">Loading account...</p>;

  const { user, account } = accountData;

  return (
    <main className="app p-8">
      {/* TOP NAV */}
      <nav className="flex items-center justify-between mb-6">
        <p className="text-xl font-semibold">Welcome back, {user.name}!</p>
        <img src="/img/logo.png" alt="Logo" className="w-16" />

        <button className="btn bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </nav>

      {/* BALANCE */}
      <section className="balance bg-white p-6 rounded-lg shadow mb-6">
        <div>
          <p className="text-gray-500">Current balance</p>
          <p className="text-sm">
            As of{" "}
            <span className="font-semibold">
              {new Date().toLocaleDateString()}
            </span>
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
            className="flex justify-between border-b py-3 items-center"
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

      {/* TODO: TRANSFER / LOAN / CLOSE */}
      <section className="text-center text-gray-500">
        <p>Interactive banking operations coming next 🚀</p>
      </section>
    </main>
  );
}
