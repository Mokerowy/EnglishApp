"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronLeft, DollarSign, Send, FileText, CheckCircle, Tag, Plus, Edit3, Trash2 } from "lucide-react";

export default function AdminFinancesPage() {
  const [activeTab, setActiveTab] = useState<"faktury" | "cennik">("faktury");

  const [invoices, setInvoices] = useState([
    { id: 1, title: "Rata za kurs - Tomasz Kowalski", amount: 350, paid: true },
    { id: 2, title: "Rata za kurs - Anna Nowak", amount: 400, paid: false },
  ]);
  const [newInvoiceTitle, setNewInvoiceTitle] = useState("");
  const [newInvoiceAmount, setNewInvoiceAmount] = useState("");

  const [prices, setPrices] = useState([
    { id: 1, name: "Kurs grupowy - Angielski A1/A2", price: 350, type: "Miesięcznie" },
    { id: 2, name: "Kurs grupowy - Angielski B1/B2", price: 400, type: "Miesięcznie" },
    { id: 3, name: "Zajęcia indywidualne (1h)", price: 120, type: "Za godzinę" },
  ]);
  const [newPriceName, setNewPriceName] = useState("");
  const [newPriceAmount, setNewPriceAmount] = useState("");
  const [newPriceType, setNewPriceType] = useState("Miesięcznie");

  const addInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceTitle || !newInvoiceAmount) return;
    setInvoices([{ id: Date.now(), title: newInvoiceTitle, amount: Number(newInvoiceAmount), paid: false }, ...invoices]);
    setNewInvoiceTitle("");
    setNewInvoiceAmount("");
  };

  const markPaid = (id: number) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, paid: true } : inv));
  };

  const sendReminder = () => {
    alert("Wysłano przypomnienia SMS do dłużników! (Mock)");
  };

  const addPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriceName || !newPriceAmount) return;
    setPrices([...prices, { id: Date.now(), name: newPriceName, price: Number(newPriceAmount), type: newPriceType }]);
    setNewPriceName("");
    setNewPriceAmount("");
  };

  const removePrice = (id: number) => {
    setPrices(prices.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">Finanse</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Rozliczenia i Cennik Kursów</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12 space-y-8">

        {/* Tab nawigacja */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setActiveTab("faktury")}
            className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all border-2 ${activeTab === "faktury"
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800"
              }`}>
            <DollarSign className="w-6 h-6" /> Rozliczenia Uczniów
          </button>

          <button
            onClick={() => setActiveTab("cennik")}
            className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all border-2 ${activeTab === "cennik"
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800"
              }`}>
            <Tag className="w-6 h-6" /> Cennik Ofertowy
          </button>
        </div>

        {activeTab === "faktury" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Generowanie Faktury */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-500" /> Wygeneruj nową należność
                </h2>
                <button onClick={sendReminder} className="px-5 py-2 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors flex items-center gap-2 text-sm">
                  <Send className="w-4 h-4" /> Wyślij przypomnienia SMS o braku wpłaty
                </button>
              </div>

              <form onSubmit={addInvoice} className="flex flex-col sm:flex-row gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Opis (np. Czesne - Grudzień - Jan Kowalski)"
                    value={newInvoiceTitle}
                    onChange={e => setNewInvoiceTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:w-48 relative">
                  <input
                    type="number"
                    placeholder="Kwota"
                    value={newInvoiceAmount}
                    onChange={e => setNewInvoiceAmount(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-3 text-slate-400 font-bold">zł</span>
                </div>
                <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20">
                  Wystaw
                </button>
              </form>
            </div>

            {/* Lista Faktur */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-500" /> Lista Należności
              </h2>

              <div className="space-y-4">
                {invoices.map(inv => (
                  <div key={inv.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border-2 transition-colors ${inv.paid
                      ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30"
                      : "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10"
                    }`}>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{inv.title}</h3>
                      <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">{inv.amount} zł</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-4">
                      {inv.paid ? (
                        <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 rounded-xl">
                          <CheckCircle className="w-5 h-5" /> Opłacono
                        </span>
                      ) : (
                        <button
                          onClick={() => markPaid(inv.id)}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20"
                        >
                          Oznacz jako opłacone
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "cennik" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Formularz Dodawania Ceny */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Tag className="w-6 h-6 text-blue-500" /> Dodaj nową pozycję w cenniku
              </h2>

              <form onSubmit={addPrice} className="flex flex-col lg:flex-row gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Nazwa usługi / kursu</label>
                  <input
                    type="text"
                    placeholder="Np. Kurs przygotowujący do FCE"
                    value={newPriceName}
                    onChange={e => setNewPriceName(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="lg:w-48">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Typ rozliczenia</label>
                  <select
                    value={newPriceType}
                    onChange={e => setNewPriceType(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Miesięcznie">Miesięcznie</option>
                    <option value="Za godzinę">Za godzinę</option>
                    <option value="Za semestr">Za semestr</option>
                    <option value="Jednorazowo">Jednorazowo</option>
                  </select>
                </div>

                <div className="lg:w-40 relative">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Kwota</label>
                  <input
                    type="number"
                    placeholder="Cena"
                    value={newPriceAmount}
                    onChange={e => setNewPriceAmount(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-[2.4rem] text-slate-400 font-bold">zł</span>
                </div>

                <div className="flex items-end">
                  <button type="submit" className="w-full lg:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Dodaj do cennika
                  </button>
                </div>
              </form>
            </div>

            {/* Lista Cennika */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-500" /> Aktualny Cennik Usług
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {prices.map(item => (
                  <div key={item.id} className="relative p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-800 transition-colors group">
                    <button
                      onClick={() => removePrice(item.id)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Usuń pozycję"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white pr-8">{item.name}</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{item.price}</span>
                      <span className="text-lg font-bold text-slate-500 dark:text-slate-400">zł</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.type}</p>
                  </div>
                ))}
              </div>

              {prices.length === 0 && (
                <div className="text-center p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400 text-lg">Cennik jest pusty. Dodaj pierwsze usługi powyżej.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
