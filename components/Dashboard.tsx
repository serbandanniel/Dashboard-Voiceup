import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { IncomeItem, ExpenseItem, SEED_INCOMES, SEED_EXPENSES } from '../types';
import { formatMoney } from '../utils';

const Dashboard: React.FC = () => {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [newIncome, setNewIncome] = useState({ name: '', val: '', taxable: true });
  // Updated state to include deductible, defaulting to true
  const [newExpense, setNewExpense] = useState({ name: '', val: '', user: '', deductible: true });

  // Load Data
  useEffect(() => {
    let unsubscribeIncomes: () => void;
    let unsubscribeExpenses: () => void;

    const fetchData = async () => {
        try {
            const incQuery = query(collection(db, "incomes"), orderBy("timestamp", "asc"));
            const expQuery = query(collection(db, "expenses"), orderBy("timestamp", "asc"));

            unsubscribeIncomes = onSnapshot(incQuery, (snapshot) => {
                const loadedIncomes: IncomeItem[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncomeItem));
                
                // Auto-seed if empty
                if (loadedIncomes.length === 0 && !snapshot.metadata.fromCache) {
                    SEED_INCOMES.forEach(async (item) => {
                        await addDoc(collection(db, "incomes"), { ...item, timestamp: Date.now() });
                    });
                } else {
                    setIncomes(loadedIncomes);
                }
            }, (err) => {
                console.error("Income Error:", err);
                setError("Eroare la încărcarea veniturilor.");
            });

            unsubscribeExpenses = onSnapshot(expQuery, (snapshot) => {
                // Ensure legacy data without 'deductible' field defaults to true
                const loadedExpenses: ExpenseItem[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return { 
                        id: doc.id, 
                        ...data,
                        deductible: data.deductible !== undefined ? data.deductible : true 
                    } as ExpenseItem;
                });
                
                if (loadedExpenses.length === 0 && !snapshot.metadata.fromCache) {
                    SEED_EXPENSES.forEach(async (item) => {
                        await addDoc(collection(db, "expenses"), { ...item, timestamp: Date.now() });
                    });
                } else {
                    setExpenses(loadedExpenses);
                }
                setLoading(false);
            }, (err) => {
                console.error("Expense Error:", err);
                setError("Eroare la încărcarea cheltuielilor.");
            });

        } catch (e) {
            console.error("Setup Error", e);
            setError("Nu s-a putut conecta la baza de date.");
            setLoading(false);
        }
    };

    fetchData();

    return () => {
        if (unsubscribeIncomes) unsubscribeIncomes();
        if (unsubscribeExpenses) unsubscribeExpenses();
    };
  }, []);

  // Calculations
  const totals = useMemo(() => {
    const totalIncome = incomes.reduce((acc, curr) => acc + curr.val, 0);
    const taxableIncome = incomes.filter(i => i.taxable).reduce((acc, curr) => acc + curr.val, 0);
    
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.val, 0);
    // Calculate deductible expenses (defaulting to true if undefined)
    const deductibleExpenses = expenses
        .filter(e => e.deductible !== false) 
        .reduce((acc, curr) => acc + curr.val, 0);
    
    // Tax Logic: Gross Profit = Taxable Income - Deductible Expenses
    // Non-deductible expenses do NOT lower the tax base.
    const grossProfit = taxableIncome - deductibleExpenses;
    
    // Tax is 16% of Gross Profit (if positive)
    const taxValue = grossProfit > 0 ? grossProfit * 0.16 : 0;
    
    // Net Profit = Total Income - Total Expenses (ALL expenses) - Tax
    const netProfit = totalIncome - totalExpenses - taxValue;

    return {
        totalIncome,
        taxableIncome,
        totalExpenses,
        deductibleExpenses,
        grossProfit,
        taxValue,
        netProfit
    };
  }, [incomes, expenses]);

  // Handlers
  const handleAddIncome = async () => {
    const val = parseFloat(newIncome.val);
    if (!newIncome.name || isNaN(val) || val <= 0) return alert("Date invalide!");
    
    try {
        await addDoc(collection(db, "incomes"), {
            name: newIncome.name,
            val: val,
            taxable: newIncome.taxable,
            timestamp: Date.now()
        });
        setNewIncome({ name: '', val: '', taxable: true });
    } catch (e) {
        alert("Eroare la adăugare");
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (window.confirm("Sigur ștergi acest venit?")) {
        await deleteDoc(doc(db, "incomes", id));
    }
  };

  const handleAddExpense = async () => {
    const val = parseFloat(newExpense.val);
    if (!newExpense.name || isNaN(val) || val <= 0 || !newExpense.user) return alert("Completează toate câmpurile!");
    
    try {
        await addDoc(collection(db, "expenses"), {
            name: newExpense.name,
            val: val,
            user: newExpense.user,
            deductible: newExpense.deductible,
            timestamp: Date.now()
        });
        setNewExpense({ name: '', val: '', user: '', deductible: true });
    } catch (e) {
        alert("Eroare la adăugare");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm("Sigur ștergi această cheltuială?")) {
        await deleteDoc(doc(db, "expenses", id));
    }
  };

  // Toggle Deductible Status Handler
  const handleToggleDeductible = async (id: string, currentStatus: boolean) => {
    try {
        const expenseRef = doc(db, "expenses", id);
        await updateDoc(expenseRef, {
            deductible: !currentStatus
        });
    } catch (e) {
        console.error("Error updating expense:", e);
        alert("Nu s-a putut actualiza statusul deductibil.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
      {/* Header */}
      <div className="p-5 flex items-center border-l-8 border-[#27ae60] bg-white border-b border-gray-100">
        <h2 className="text-xl font-extrabold text-[#0e1b38] uppercase flex items-center gap-2">
            <i className="fas fa-chart-line text-[#27ae60]"></i> Dashboard Financiar (Live)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        
        {/* INCOMES */}
        <div className="bg-[#f8f9fa] rounded-xl p-4 border border-gray-200 flex flex-col">
            <h3 className="text-[#27ae60] border-b-2 border-gray-200 pb-2 mb-4 font-bold text-lg flex items-center gap-2">
                <i className="fas fa-arrow-up"></i> Venituri Totale
            </h3>
            
            <div className="flex-grow space-y-2 mb-4">
                {loading && <div className="text-center text-gray-400 italic text-sm">Se încarcă...</div>}
                {error && <div className="text-center text-red-500 text-sm">{error}</div>}
                
                {incomes.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 text-sm">
                        <span className="text-gray-800 font-medium">
                            {item.name} 
                            {!item.taxable && <span className="text-[0.7em] text-[#e67e22] ml-1">(Neimp.)</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{formatMoney(item.val)}</span>
                            <button onClick={() => item.id && handleDeleteIncome(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300 font-extrabold text-[#27ae60] text-lg mt-auto">
                <span>TOTAL:</span>
                <span>{formatMoney(totals.totalIncome)}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-300 grid grid-cols-12 gap-2">
                <input 
                    type="text" 
                    placeholder="Denumire..." 
                    className="col-span-5 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#27ae60] placeholder-gray-500"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    value={newIncome.name}
                    onChange={(e) => setNewIncome({...newIncome, name: e.target.value})}
                />
                <input 
                    type="number" 
                    placeholder="Sumă..." 
                    step="0.01"
                    className="col-span-3 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#27ae60] placeholder-gray-500"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    value={newIncome.val}
                    onChange={(e) => setNewIncome({...newIncome, val: e.target.value})}
                />
                <div className="col-span-2 flex items-center justify-center">
                    <input 
                        type="checkbox" 
                        id="taxCheck"
                        className="mr-1"
                        checked={newIncome.taxable}
                        onChange={(e) => setNewIncome({...newIncome, taxable: e.target.checked})}
                    />
                    <label htmlFor="taxCheck" className="text-xs text-gray-500">Imp?</label>
                </div>
                <button onClick={handleAddIncome} className="col-span-2 bg-[#27ae60] hover:bg-[#219150] text-white rounded text-xs font-bold transition-colors">
                    Adaugă
                </button>
            </div>
        </div>

        {/* EXPENSES */}
        <div className="bg-[#f8f9fa] rounded-xl p-4 border border-gray-200 flex flex-col">
            <h3 className="text-[#c0392b] border-b-2 border-gray-200 pb-2 mb-4 font-bold text-lg flex items-center gap-2">
                <i className="fas fa-arrow-down"></i> Cheltuieli
            </h3>

            <div className="flex-grow space-y-2 mb-4">
                {loading && <div className="text-center text-gray-400 italic text-sm">Se încarcă...</div>}
                
                {expenses.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 text-sm">
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">
                                {item.name}
                            </span>
                            
                            {/* Layout compact: User + Checkbox pe aceeasi linie */}
                            <div className="flex items-center gap-3 mt-1 text-xs">
                                <span className="text-gray-600 italic flex items-center">
                                    <i className="fas fa-user mr-1 text-[0.7rem]"></i>
                                    {item.user}
                                </span>
                                
                                <span className="text-gray-300">|</span>

                                <label className="flex items-center gap-1 cursor-pointer group select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={item.deductible !== false} 
                                        onChange={() => item.id && handleToggleDeductible(item.id, item.deductible ?? true)}
                                        className="w-3.5 h-3.5 text-[#27ae60] rounded focus:ring-0 cursor-pointer accent-[#27ae60]"
                                    />
                                    <span className={`text-[0.7rem] font-medium transition-colors ${item.deductible !== false ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        {item.deductible !== false ? 'Deductibil' : 'Nedeductibil'}
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{formatMoney(item.val)}</span>
                            <button onClick={() => item.id && handleDeleteExpense(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300 font-extrabold text-[#c0392b] text-lg mt-auto">
                <span>TOTAL:</span>
                <span>{formatMoney(totals.totalExpenses)}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-300 grid grid-cols-12 gap-2">
                <input 
                    type="text" 
                    placeholder="Cheltuială..." 
                    className="col-span-4 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#c0392b] placeholder-gray-500"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                />
                <input 
                    type="number" 
                    placeholder="RON" 
                    step="0.01"
                    className="col-span-2 p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#c0392b] placeholder-gray-500"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    value={newExpense.val}
                    onChange={(e) => setNewExpense({...newExpense, val: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="Cine?" 
                    className="col-span-2 p-2 text-sm border-2 border-[#ff2e63] placeholder-gray-500 rounded focus:ring-1 focus:ring-[#c0392b]"
                    style={{ backgroundColor: '#fff0f3', color: 'black' }}
                    value={newExpense.user}
                    onChange={(e) => setNewExpense({...newExpense, user: e.target.value})}
                />
                <div className="col-span-2 flex items-center justify-center">
                    <input 
                        type="checkbox" 
                        id="dedCheck"
                        className="mr-1"
                        checked={newExpense.deductible}
                        onChange={(e) => setNewExpense({...newExpense, deductible: e.target.checked})}
                    />
                    <label htmlFor="dedCheck" className="text-xs text-gray-500">Ded?</label>
                </div>
                <button onClick={handleAddExpense} className="col-span-2 bg-[#c0392b] hover:bg-[#a93226] text-white rounded text-xs font-bold transition-colors">
                    Adaugă
                </button>
            </div>
        </div>

        {/* TAX SECTION */}
        <div className="md:col-span-2 bg-[#fff8e1] border border-[#ffe0b2] rounded-xl p-5 shadow-sm">
            <h3 className="text-[#e67e22] border-b-2 border-[#ffe0b2] pb-2 mb-4 font-bold text-lg flex items-center gap-2">
                <i className="fas fa-university"></i> Calcul Impozit pe Profit (16%)
            </h3>

            <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between pl-3 border-l-2 border-gray-300 text-gray-600">
                    <span>Venit Impozabil (Bază):</span>
                    <span className="font-bold">{formatMoney(totals.taxableIncome)}</span>
                </div>
                <div className="flex justify-between pl-3 border-l-2 border-gray-300 text-gray-600">
                    <span>- Cheltuieli Deductibile:</span>
                    <span className="font-bold">{formatMoney(totals.deductibleExpenses)}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-semibold text-gray-800">
                    <span>= Profit Brut (Bază de Calcul):</span>
                    <span className="font-bold">{formatMoney(totals.grossProfit)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-[#e67e22] font-extrabold text-[#e67e22] text-lg">
                <span>IMPOZIT DE PLATĂ (16%):</span>
                <span>{formatMoney(totals.taxValue)}</span>
            </div>

            <div className="mt-4 p-3 bg-white/60 border-l-4 border-[#e67e22] rounded text-xs text-gray-500 italic">
                <i className="fas fa-info-circle mr-1"></i> Notă: Impozitul se aplică doar veniturilor marcate ca "Impozabil" minus cheltuieli <strong>deductibile</strong>. Restul veniturilor și cheltuielile nedeductibile influențează direct profitul net.
            </div>
        </div>

        {/* GRAND TOTAL */}
        <div className="md:col-span-2 bg-[#0e1b38] rounded-xl p-6 text-center text-white shadow-lg transform transition-transform hover:scale-[1.01]">
            <div className="text-xl opacity-80 mb-2 font-light">BALANȚĂ FINALĂ (PROFIT NET)</div>
            <div className="text-5xl font-[900] text-[#f1c40f] tracking-tight">{formatMoney(totals.netProfit)}</div>
            <div className="text-sm opacity-60 mt-3 font-mono">(Venituri Totale - Toate Cheltuielile - Impozit)</div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;