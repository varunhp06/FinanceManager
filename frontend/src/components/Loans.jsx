import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaEdit, FaTrash } from "react-icons/fa"; // Using icons for buttons

// NEW: Edit Modal Component
const EditLoanModal = ({ loan, onClose, onSave, onChange }) => {
    if (!loan) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-stone-50 p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <h3 className="text-2xl text-stone-800 font-light mb-6">edit loan</h3>
                <form onSubmit={onSave}>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-stone-700 font-light mb-2">amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={loan.amount}
                                onChange={onChange}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                            />
                        </div>
                        <div>
                            <label className="block text-stone-700 font-light mb-2">description</label>
                            <input
                                type="text"
                                name="description"
                                value={loan.description}
                                onChange={onChange}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                            />
                        </div>
                        <div>
                            <label className="block text-stone-700 font-light mb-2">date</label>
                            <input
                                type="date"
                                name="loanDate"
                                value={loan.loanDate}
                                onChange={onChange}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                            />
                        </div>
                        <div>
                            <label className="block text-stone-700 font-light mb-2">borrower</label>
                            <input
                                type="text"
                                name="borrower"
                                value={loan.borrower}
                                onChange={onChange}
                                className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-light tracking-wide text-stone-700 hover:text-stone-900"
                        >
                            cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-stone-800 text-stone-50 px-6 py-2 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200"
                        >
                            save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [amount, setAmount] = useState("");
    const [desc, setDesc] = useState("");
    const [loanDate, setLoanDate] = useState("");
    const [borrower, setBorrower] = useState("");
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    // NEW: State for editing logic
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);

    const userId = localStorage.getItem("userId");

    const fetchLoans = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`/api/loans/user/${userId}`);
            setLoans(res.data);
        } catch (error) {
            console.error("Failed to fetch loans:", error);
        }
    };

    const createLoan = async () => {
        if (!amount || !desc || !loanDate || !borrower) {
            setError("Please fill in all fields.");
            return;
        }
        if (parseFloat(amount) <= 0) {
            setError("Amount must be a positive number.");
            return;
        }
        const today = new Date().toISOString().split("T")[0];
        if (loanDate > today) {
            setError("Date cannot be in the future.");
            return;
        }
        try {
            await axios.post(`/api/loans/user/${userId}`, {
                amount, description: desc, loanDate, borrower,
            });
            setAmount("");
            setDesc("");
            setLoanDate("");
            setBorrower("");
            setError("");
            fetchLoans(); // Refresh list after creation
        } catch (error) {
            console.error("Failed to create loan:", error);
        }
    };

    // NEW: Function to handle deleting a loan
    const handleDeleteLoan = async (loanId) => {
        if (window.confirm("Are you sure you want to delete this loan?")) {
            try {
                await axios.delete(`/api/loans/${loanId}`);
                setLoans(loans.filter(l => l.id !== loanId));
            } catch (error) {
                console.error("Failed to delete loan:", error);
                setError("Failed to delete loan. Please try again.");
            }
        }
    };

    // NEW: Functions to manage the edit modal state
    const handleOpenEditModal = (loan) => {
        const formattedLoan = { ...loan, loanDate: loan.loanDate.split('T')[0] };
        setEditingLoan(formattedLoan);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingLoan(null);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditingLoan({ ...editingLoan, [name]: value });
    };

    // NEW: Function to save the updated loan
    const handleUpdateLoan = async (e) => {
        e.preventDefault();
        if (!editingLoan) return;

        const payload = {
            amount: editingLoan.amount,
            description: editingLoan.description,
            loanDate: editingLoan.loanDate,
            borrower: editingLoan.borrower,
        };

        try {
            const res = await axios.put(`/api/loans/${editingLoan.id}`, payload);
            setLoans(loans.map(loan => (loan.id === editingLoan.id ? res.data : loan)));
            handleCloseEditModal();
        } catch (error) {
            console.error("Failed to update loan:", error);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [userId]);

    const sortedLoans = [...loans].sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate));
    const filteredLoans = sortedLoans.filter((loan) => loan.borrower.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
    const paginatedLoans = filteredLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalDebt = filteredLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);

    return (
        <>
            {/* NEW: Render the edit modal */}
            <EditLoanModal
                loan={editingLoan}
                onClose={handleCloseEditModal}
                onSave={handleUpdateLoan}
                onChange={handleEditFormChange}
            />

            <div className="min-h-screen bg-stone-50 relative">
                <Navbar />
                <div className="max-w-7xl mx-auto relative">
                    {/* ... (existing header and new entry form) ... */}
                    <div className="max-w-4xl mx-auto p-8">
                        <div className="text-center mb-5">
                            <h2 className="text-4xl text-stone-800 font-light tracking-wider mb-4">
                                loans
                            </h2>
                            <div className="w-32 h-px bg-stone-400 mx-auto opacity-50"></div>
                            <p className="text-stone-600 font-light italic mt-4">
                                page {currentPage} of {totalPages || 1}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/80 border border-stone-300 rounded-none mb-8 p-6 relative shadow-sm">
                        <div className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm">
                            new entry
                        </div>
                        {error && <p className="text-red-600 font-light italic mb-4">{error}</p>}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-stone-700 font-light mb-2">amount</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800" placeholder="₹"/>
                            </div>
                            <div>
                                <label className="block text-stone-700 font-light mb-2">description</label>
                                <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800" placeholder="..."/>
                            </div>
                            <div>
                                <label className="block text-stone-700 font-light mb-2">date</label>
                                <input type="date" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"/>
                            </div>
                            <div>
                                <label className="block text-stone-700 font-light mb-2">borrower</label>
                                <input type="text" value={borrower} onChange={(e) => setBorrower(e.target.value)} className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800" placeholder="..."/>
                            </div>
                        </div>
                        <button onClick={createLoan} className="bg-stone-800 text-stone-50 px-6 py-2 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200">
                            record
                        </button>
                    </div>

                    {/* ... (existing search and filter controls) ... */}
                    <div>
                        <div className="flex justify-around items-center max-w-4xl mx-auto px-6 mb-6">
                            <input type="text" placeholder="Search by borrower..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="border-b border-stone-300 bg-transparent text-stone-800 p-2 font-mono text-sm w-full max-w-sm focus:outline-none focus:border-stone-600"/>
                        </div>
                        <div className="flex justify-around mb-4">
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="border-b border-stone-300 bg-transparent text-stone-700 font-mono text-sm focus:outline-none focus:border-stone-600">
                                {[5, 10, 15, 20].map((n) => (<option key={n} value={n}>{n} entries</option>))}
                            </select>
                        </div>
                    </div>

                    {paginatedLoans.length === 0 ? (
                        <div className="p-12 text-center text-stone-500 font-light italic">
                            no entries yet
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-200">
                            {paginatedLoans.map((loan) => (
                                <div key={loan.id} className="p-4 hover:bg-stone-50/50 transition-colors duration-150">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-2">
                                                <span className="text-stone-500 font-mono text-sm">
                                                    {new Date(loan.loanDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                                                </span>
                                            </div>
                                            <div className="text-stone-800 mb-1">{loan.description}</div>
                                            <div className="text-purple-500 text-sm font-mono">{loan.borrower}</div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-red-700 font-mono text-lg mr-6">₹{parseFloat(loan.amount).toFixed(2)}</div>
                                            {/* NEW: Edit and Delete Buttons */}
                                            <div className="flex items-center space-x-4">
                                                <button onClick={() => handleOpenEditModal(loan)} className="text-stone-500 hover:text-blue-600 transition-colors">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDeleteLoan(loan.id)} className="text-stone-500 hover:text-red-600 transition-colors">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="max-w-4xl mx-auto mt-6 p-4 border-t border-stone-300 text-right text-stone-700 font-mono text-md">
                        total loan: <span className="text-red-700 font-mono text-md">₹{totalDebt.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Loans;