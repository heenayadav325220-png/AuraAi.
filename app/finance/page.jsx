'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Finance() {
  const [expenses, setExpenses] = useState([
    { name: 'Food', amount: 500, type: 'expense' },
    { name: 'Salary', amount: 25000, type: 'income' },
    { name: 'Netflix', amount: 199, type: 'expense' },
    { name: 'Freelance', amount: 5000, type: 'income' },
  ])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0)
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0)
  const balance = totalIncome - totalExpense

  const addEntry = () => {
    if (!name || !amount) return
    setExpenses(prev => [...prev, { name, amount: Number(amount), type }])
    setName('')
    setAmount('')
  }

  return (
    <div className="min-h-screen bg-dark text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10">
        <Link href="/">
          <h1 className="text-2xl font-black gradient-text cursor-pointer">AURA AI</h1>
        </Link>
        <Link href="/dashboard">
          <button className="glass-card px-4 py-2 text-sm rounded-full hover:glow transition">
            ← Dashboard
          </button>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-8 fade-in">
          <h2 className="text-4xl font-black mb-2">💰 Smart <span className="gradient-text">Finance</span></h2>
          <p className="text-gray-400">Track your money, save smarter.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Income', value: `₹${totalIncome.toLocaleString()}`, color: 'text-green-400' },
            { label: 'Total Expense', value: `₹${totalExpense.toLocaleString()}`, color: 'text-red-400' },
            { label: 'Balance', value: `₹${balance.toLocaleString()}`, color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 text-center fade-in">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add Entry */}
        <div className="glass-card p-6 mb-8 fade-in">
          <h3 className="text-lg font-bold mb-4">➕ Add Entry</h3>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Name (e.g. Food)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="glass-card px-4 py-2 rounded-full text-sm outline-none text-white placeholder-gray-500 flex-1"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="glass-card px-4 py-2 rounded-full text-sm outline-none text-white placeholder-gray-500 w-32"
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="glass-card px-4 py-2 rounded-full text-sm outline-none text-white bg-transparent"
            >
              <option value="expense" className="bg-dark">Expense</option>
              <option value="income" className="bg-dark">Income</option>
            </select>
            <button
              onClick={addEntry}
              className="bg-primary px-6 py-2 rounded-full text-sm font-bold glow hover:opacity-90 transition"
            >
              Add ✅
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="glass-card p-6 fade-in">
          <h3 className="text-lg font-bold mb-4">📋 Transactions</h3>
          {expenses.map((e, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
              <div className="flex items-center gap-3">
                <span>{e.type === 'income' ? '🟢' : '🔴'}</span>
                <span className="text-sm text-gray-300">{e.name}</span>
              </div>
              <span className={`font-bold ${e.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {e.type === 'income' ? '+' : '-'}₹{e.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
    }
