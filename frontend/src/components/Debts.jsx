import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";

const Debts = () => {
    const [debts, setDebts] = useState([]);
    const [amount, setAmount] = useState("");
    const [desc, setDesc] = useState("");
    const [debtDate, setDebtDate] = useState("");
    const [lender, setLender] = useState("");
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const userId = localStorage.getItem("userId");

    const fetchDebts = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`/api/debts/user/${userId}`);
            setDebts(res.data);
        } catch (error) {
            console.error("Failed to fetch debts:", error);
        }
    };

    const createDebt = async () => {
        if (!amount || !desc || !debtDate || !lender) {
            setError("Please fill in all fields.");
            return;
        }

        if (parseFloat(amount) <= 0) {
            setError("Amount must be a positive number.");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (debtDate > today) {
            setError("Date cannot be in the future.");
            return;
        }

        try {
            await axios.post(`/api/debts/user/${userId}`, {
                amount,
                description: desc,
                debtDate,
                lender,
            });

            setAmount("");
            setDesc("");
            setDebtDate("");
            setLender("");
            setError("");
            fetchDebts();
        } catch (error) {
            console.error("Failed to create debt:", error);
        }
    };

    const sortedDebts = [...debts].sort(
        (a, b) => new Date(b.debtDate) - new Date(a.debtDate)
    );

    const filteredDebts = sortedDebts.filter((debt) =>
        (debt.lender || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDebts.length / itemsPerPage);
    const paginatedDebts = filteredDebts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalDebt = filteredDebts.reduce(
        (sum, debt) => sum + parseFloat(debt.amount),
        0
    );

    useEffect(() => {
        fetchDebts();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight" && currentPage < totalPages) {
                setCurrentPage((prev) => prev + 1);
            } else if (e.key === "ArrowLeft" && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPage, totalPages]);

    return (
        <div className="min-h-screen bg-stone-50 relative">
            <Navbar />
            <div className="max-w-7xl mx-auto relative">
                <div className="max-w-4xl mx-auto p-8">
                    <div className="text-center mb-5">
                        <h2 className="text-4xl text-stone-800 font-light tracking-wider mb-4">
                            debts
                        </h2>
                        <div className="w-32 h-px bg-stone-400 mx-auto opacity-50"></div>
                        <p className="text-stone-600 font-light italic mt-4">
                            page {currentPage} of {totalPages}
                        </p>
                    </div>
                </div>
                <div className="bg-white/80 border border-stone-300 rounded-none mb-8 p-6 relative shadow-sm">
                    <div className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm">
                        new entry
                    </div>

                    {error && (
                        <p className="text-red-600 font-light italic mb-4">{error}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-stone-700 font-light mb-2">amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                                placeholder="₹"
                            />
                        </div>
                        <div>
                            <label className="block text-stone-700 font-light mb-2">description</label>
                            <input
                                type="text"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                                placeholder="..."
                            />
                        </div>
                        <div>
                            <label className="block text-stone-700 font-light mb-2">date</label>
                            <input
                                type="date"
                                value={debtDate}
                                onChange={(e) => setDebtDate(e.target.value)}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                            />
                        </div>
                        <div>
                            <label className="block text-stone-700 font-light mb-2">lender</label>
                            <input
                                type="text"
                                value={lender}
                                onChange={(e) => setLender(e.target.value)}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                                placeholder="..."
                            />
                        </div>
                    </div>
                    <button
                        onClick={createDebt}
                        className="bg-stone-800 text-stone-50 px-6 py-2 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200"
                    >
                        record
                    </button>
                </div>

                <div>
                    <div className="flex justify-around items-center max-w-4xl mx-auto px-6 mb-6">
                        <input
                            type="text"
                            placeholder="Search by lender..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border-b border-stone-300 bg-transparent text-stone-800 p-2 font-mono text-sm w-full max-w-sm focus:outline-none focus:border-stone-600"
                        />
                    </div>
                    <div className="flex justify-around mb-4">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border-b border-stone-300 bg-transparent text-stone-700 font-mono text-sm focus:outline-none focus:border-stone-600"
                        >
                            {[5, 10, 15, 20].map((n) => (
                                <option key={n} value={n}>
                                    {n} entries
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {paginatedDebts.length === 0 ? (
                    <div className="p-12 text-center text-stone-500 font-light italic">
                        no entries yet
                    </div>
                ) : (
                    <div className="divide-y divide-stone-200">
                        {paginatedDebts.map((debt) => (
                            <div key={debt.id} className="p-4 hover:bg-stone-50/50 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4 mb-2">
                                            <span className="text-stone-500 font-mono text-sm">
                                                {new Date(debt.debtDate).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-stone-800 mb-1">{debt.description}</div>
                                        <div className="text-green-500 text-sm font-mono">{debt.lender}</div>
                                    </div>
                                    <div className="text-red-700 font-mono text-lg">₹{parseFloat(debt.amount).toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="max-w-4xl mx-auto mt-6 p-4 border-t border-stone-300 text-right text-stone-700 font-mono text-md">
                    total debt: <span className="text-red-700 font-mono text-md">₹{totalDebt.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default Debts;
