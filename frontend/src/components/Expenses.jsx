import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaEdit, FaTrash } from "react-icons/fa"; // Using icons for buttons

const categoryOptions = [
  "food", "utilities", "travel", "fees", "subscriptions",
  "investments", "entertainment", "gifts", "health", "items", "miscellaneous",
];

const paymentMethods = [
  "cash", "card", "upi", "cash+upi", "cash+card", "card+upi"
];

// NEW: Edit Modal Component
const EditExpenseModal = ({ expense, onClose, onSave, onChange }) => {
  if (!expense) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-stone-50 p-8 rounded-lg shadow-xl w-full max-w-md relative">
          <h3 className="text-2xl text-stone-800 font-light mb-6">edit expense</h3>
          <form onSubmit={onSave}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-stone-700 font-light mb-2">amount</label>
                <input
                    type="number"
                    name="amount"
                    value={expense.amount}
                    onChange={onChange}
                    className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-light mb-2">description</label>
                <input
                    type="text"
                    name="description"
                    value={expense.description}
                    onChange={onChange}
                    className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-light mb-2">date</label>
                <input
                    type="date"
                    name="expenseDate"
                    value={expense.expenseDate}
                    onChange={onChange}
                    className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-light mb-2">category</label>
                <select
                    name="category"
                    value={expense.category}
                    onChange={onChange}
                    className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                >
                  {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-light mb-2">payment</label>
                <select
                    name="payMethod"
                    value={expense.payMethod}
                    onChange={onChange}
                    className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                >
                  {paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                  ))}
                </select>
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


const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // NEW: State for editing logic
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const userId = localStorage.getItem("userId");

  const fetchExpenses = async () => {
    if (!userId) return;

    try {
      const res = await axios.get(`/api/expenses/user/${userId}`);
      setExpenses(res.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const createExpense = async () => {
    if (!amount || !desc || !expenseDate || !category || !payMethod) {
      setError("Please fill in all fields.");
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    if (expenseDate > today) {
      setError("Date cannot be in the future.");
      return;
    }
    try {
      const res = await axios.post(`/api/expenses/user/${userId}`, { amount, description: desc, expenseDate, category, payMethod });
      setExpenses([res.data, ...expenses]); // Add new expense to the top
      setAmount("");
      setDesc("");
      setExpenseDate("");
      setCategory("");
      setPayMethod("");
      setError("");
    } catch (error) {
      console.error("Failed to create expense:", error);
    }
  };

  // NEW: Function to handle deleting an expense
  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await axios.delete(`/api/expenses/${expenseId}`);
        setExpenses(expenses.filter(e => e.id !== expenseId));
      } catch (error) {
        console.error("Failed to delete expense:", error);
        setError("Failed to delete expense. Please try again.");
      }
    }
  };

  // NEW: Functions to manage the edit modal state
  const handleOpenEditModal = (expense) => {
    // Ensure the date is in 'YYYY-MM-DD' format for the input
    const formattedExpense = { ...expense, expenseDate: expense.expenseDate.split('T')[0] };
    setEditingExpense(formattedExpense);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingExpense(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingExpense({ ...editingExpense, [name]: value });
  };

  // NEW: Function to save the updated expense
  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;

    // 1. Create a clean payload with only the updatable fields.
    const payload = {
      amount: editingExpense.amount,
      description: editingExpense.description,
      expenseDate: editingExpense.expenseDate,
      category: editingExpense.category,
      payMethod: editingExpense.payMethod
    };

    try {
      // 2. Send the clean payload, not the entire editingExpense object.
      const res = await axios.put(`/api/expenses/${editingExpense.id}`, payload);

      setExpenses(expenses.map(exp => (exp.id === editingExpense.id ? res.data : exp)));
      handleCloseEditModal();
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  const sortedExpenses = [...expenses].sort(
      (a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)
  );

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const paginatedExpenses = sortedExpenses.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchExpenses();
  }, [userId]);

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
      <>
        {/* NEW: Render the edit modal */}
        <EditExpenseModal
            expense={editingExpense}
            onClose={handleCloseEditModal}
            onSave={handleUpdateExpense}
            onChange={handleEditFormChange}
        />

        <div className="min-h-screen bg-stone-50 relative">
          <Navbar />
          <div className="max-w-7xl mx-auto relative">
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-center mb-5">
                <h2 className="text-4xl text-stone-800 font-light tracking-wider mb-4">
                  expenses
                </h2>
                <div className="w-32 h-px bg-stone-400 mx-auto opacity-50"></div>
                <p className="text-stone-600 font-light italic mt-4">
                  page {currentPage} of {totalPages || 1}
                </p>
              </div>
            </div>

            {/* THIS IS THE RESTORED NEW ENTRY FORM */}
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
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-light mb-2">category</label>
                  <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                  >
                    <option value="">...</option>
                    {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-light mb-2">payment</label>
                  <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                  >
                    <option value="">...</option>
                    {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                  onClick={createExpense}
                  className="bg-stone-800 text-stone-50 px-6 py-2 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200"
              >
                record
              </button>
            </div>
            {/* END OF RESTORED FORM */}


            {/* THIS IS THE RESTORED DROPDOWN */}
            <div className="flex justify-end mb-4">
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
            {/* END OF RESTORED DROPDOWN */}

            {paginatedExpenses.length === 0 ? (
                <div className="p-12 text-center text-stone-500 font-light italic">
                  no entries yet
                </div>
            ) : (
                <div className="divide-y divide-stone-200">
                  {paginatedExpenses.map((expense) => (
                      <div key={expense.id} className="p-4 hover:bg-stone-50/50 transition-colors duration-150">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-stone-500 font-mono text-sm">
                                {new Date(expense.expenseDate).toLocaleDateString("en-GB", {
                                  day: "2-digit", month: "2-digit", year: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="text-stone-800 mb-1">{expense.description}</div>
                            <div className="flex space-x-3">
                              <span className="text-purple-500 text-sm font-mono">
                                {expense.category || "uncategorized"}
                              </span>
                              <span className="text-green-500 text-sm font-mono">
                                {expense.payMethod}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-red-700 font-mono text-lg mr-6">₹{expense.amount}</div>
                            {/* NEW: Edit and Delete Buttons */}
                            <div className="flex items-center space-x-4">
                              <button onClick={() => handleOpenEditModal(expense)} className="text-stone-500 hover:text-blue-600 transition-colors">
                                <FaEdit />
                              </button>
                              <button onClick={() => handleDeleteExpense(expense.id)} className="text-stone-500 hover:text-red-600 transition-colors">
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </>
  );
};

export default Expenses;