import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";

const DashboardPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [uniqueCategories, setUniqueCategories] = useState(0);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchExpenses = async () => {
    if (!userId) return;

    try {
      const res = await axios.get(`/api/expenses/user/${userId}`);
      const data = res.data;

      setExpenses(data);
      setTotalEntries(data.length);
      setTotalAmount(
          data.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
      );

      const uniqueCats = new Set(data.map((exp) => exp.category));
      setUniqueCategories(uniqueCats.size);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
      <div className="min-h-screen bg-stone-50 relative" data-test="dashboard-page">
        <Navbar />

        <div className="max-w-8xl mx-auto p-8">
          <div className="text-center mb-16">
            <h2
                data-test="dashboard-welcome-heading"
                className="text-4xl text-stone-800 font-light tracking-wider mb-4"
            >
              welcome
            </h2>
            <div className="w-32 h-px bg-stone-400 mx-auto opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 border border-stone-300 p-8 relative shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm">
                debt
              </div>
              <div className="mb-6">
                <p className="text-stone-600 font-light leading-relaxed">
                  record and track who you owe money to
                </p>
              </div>
              <button
                  data-test="debt-button"
                  onClick={() => navigate("/debts")}
                  className="w-full bg-stone-800 text-stone-50 py-3 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200"
              >
                open debt
              </button>
            </div>

            <div className="bg-white/80 border border-stone-300 p-8 relative shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm">
                expenses
              </div>
              <div className="mb-6">
                <p className="text-stone-600 font-light leading-relaxed">
                  record and track your daily expenses
                </p>
              </div>
              <button
                  data-test="expenses-button"
                  onClick={() => navigate("/expenses")}
                  className="w-full bg-stone-800 text-stone-50 py-3 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200"
              >
                open expenses
              </button>
            </div>

            <div className="bg-white/80 border border-stone-300 p-8 relative shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm">
                loans
              </div>
              <div className="mb-6">
                <p className="text-stone-600 font-light leading-relaxed">
                  record and track the people who owe you money
                </p>
              </div>
              <button
                  data-test="loans-button"
                  onClick={() => navigate("/loans")}
                  className="w-full bg-stone-800 text-stone-50 py-3 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200"
              >
                open loans
              </button>
            </div>
          </div>

          <div
              className="bg-white/100 border border-stone-300 p-8 relative shadow-sm"
              data-test="dashboard-overview"
          >
            <div className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm">
              overview
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div data-test="total-entries" className="text-3xl font-mono text-stone-800 mb-2">
                  {totalEntries}
                </div>
                <div className="text-stone-600 font-light">total expense entries</div>
              </div>

              <div>
                <div data-test="total-amount" className="text-3xl font-mono text-stone-800 mb-2">
                  ₹{totalAmount.toFixed(2)}
                </div>
                <div className="text-stone-600 font-light">total amount spent</div>
              </div>

              <div className="flex items-center justify-center">
                <button
                    data-test="analytics-link"
                    onClick={() => navigate("/analytics")}
                    className="text-stone-500 hover:text-stone-800 text-sm font-light tracking-wide underline underline-offset-4 decoration-dotted transition-all duration-150"
                >
                  view expense analytics →
                </button>
              </div>
            </div>

            {totalEntries === 0 && (
                <div className="mt-8 text-center">
                  <p
                      data-test="empty-state-message"
                      className="text-stone-500 font-light text-sm italic"
                  >
                    statistics will appear once you start recording expenses
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;
