import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Minus, 
  Edit3, 
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [stockAmount, setStockAmount] = useState(10);
  const [newThreshold, setNewThreshold] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/admin/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setStockAmount(10);
    setNewThreshold(item.threshold);
    setNewPrice(item.price);
  };

  const handleUpdateStock = async (mode) => {
    if (!editingItem) return;
    setModalLoading(true);

    try {
      const change = mode === 'add' ? Math.abs(parseInt(stockAmount)) : -Math.abs(parseInt(stockAmount));
      const res = await api.patch('/admin/inventory/update', {
        category: editingItem.category,
        item_id: editingItem.id,
        stock_change: change,
        is_absolute: false,
      });

      setInventory((prev) =>
        prev.map((it) => (it.id === editingItem.id && it.category === editingItem.category ? res.data : it))
      );
      showToast(`Updated stock for ${editingItem.name}!`);
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update stock');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveThresholdAndPrice = async () => {
    if (!editingItem) return;
    setModalLoading(true);

    try {
      const payload = {
        category: editingItem.category,
        item_id: editingItem.id,
        stock_change: 0,
        is_absolute: false,
      };
      if (newThreshold !== '') payload.threshold = parseInt(newThreshold);
      if (newPrice !== '') payload.price = parseFloat(newPrice);

      const res = await api.patch('/admin/inventory/update', payload);

      setInventory((prev) =>
        prev.map((it) => (it.id === editingItem.id && it.category === editingItem.category ? res.data : it))
      );
      showToast(`Updated properties for ${editingItem.name}!`);
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update item settings');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-pizza-burgundy text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-pizza-amber animate-in fade-in">
          <Check size={18} className="text-green-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pizza-borderLight dark:border-pizza-borderDark pb-4">
        <div>
          <h1 className="text-3xl font-black text-pizza-textLight dark:text-white tracking-tight flex items-center gap-2">
            <Layers size={28} className="text-pizza-red" />
            Raw Ingredients & Stock Control
          </h1>
          <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark mt-1">
            Real-time tracking of pizza bases, simmered sauces, artisan cheeses, and farm toppings.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pizza-textLight dark:text-white bg-white dark:bg-pizza-cardDark border border-pizza-borderLight dark:border-pizza-borderDark hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-pizza-cardDark p-4 rounded-2xl border border-pizza-borderLight dark:border-pizza-borderDark shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search ingredient by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-pizza-borderLight dark:border-pizza-borderDark bg-white dark:bg-pizza-dark text-pizza-textLight dark:text-white text-xs focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['all', 'base', 'sauce', 'cheese', 'vegetable'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-pizza-burgundy dark:bg-pizza-red text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-pizza-dark text-pizza-mutedLight dark:text-pizza-mutedDark hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {cat === 'all' ? 'All Ingredients' : cat === 'base' ? 'Crust Bases' : cat === 'sauce' ? 'Sauces' : cat === 'cheese' ? 'Cheeses' : 'Veggies'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-pizza-cardDark rounded-3xl border border-pizza-borderLight dark:border-pizza-borderDark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-pizza-dark text-gray-400 uppercase font-extrabold border-b border-pizza-borderLight dark:border-pizza-borderDark">
              <tr>
                <th className="py-3.5 px-6">Ingredient</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Current Stock</th>
                <th className="py-3.5 px-6">Threshold</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pizza-borderLight/60 dark:divide-pizza-borderDark/60">
              {filteredInventory.map((item) => {
                const isLow = item.stock < item.threshold;
                const isOut = item.stock <= 0;

                return (
                  <tr key={`${item.category}-${item.id}`} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-pizza-textLight dark:text-white">
                      {item.name}
                    </td>
                    <td className="py-4 px-6 uppercase font-bold text-gray-400 text-[10px]">
                      {item.category}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-pizza-textLight dark:text-white">
                      ₹{item.price}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-mono text-sm font-black ${isOut ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-pizza-amber' : 'text-green-600 dark:text-green-400'}`}>
                        {item.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-500 dark:text-gray-400">
                      {item.threshold} units
                    </td>
                    <td className="py-4 px-6">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 animate-pulse">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300">
                          Optimal Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-3.5 py-1.5 rounded-xl font-bold text-[11px] text-white bg-pizza-burgundy dark:bg-pizza-red hover:bg-pizza-deepWine dark:hover:bg-pizza-darkRed transition-colors shadow-sm"
                      >
                        Adjust / Restock &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit & Restock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-pizza-cardDark rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-pizza-borderLight dark:border-pizza-borderDark">
            
            <div className="flex justify-between items-center border-b border-pizza-borderLight dark:border-pizza-borderDark pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">{editingItem.category}</span>
                <h3 className="text-xl font-black text-pizza-textLight dark:text-white">{editingItem.name}</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Stock Banner */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-pizza-dark border border-pizza-borderLight dark:border-pizza-borderDark flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400">Current In-Stock:</span>
                <p className="text-2xl font-black text-pizza-textLight dark:text-white">{editingItem.stock} units</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Safety Threshold:</span>
                <p className="text-sm font-bold text-pizza-amber">{editingItem.threshold} units</p>
              </div>
            </div>

            {/* Quick Restock Action */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Add / Deduct Units
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-pizza-borderLight dark:border-pizza-borderDark bg-white dark:bg-pizza-dark text-pizza-textLight dark:text-white text-sm"
                />
                <button
                  disabled={modalLoading}
                  onClick={() => handleUpdateStock('add')}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
                <button
                  disabled={modalLoading}
                  onClick={() => handleUpdateStock('deduct')}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
                >
                  <Minus size={14} /> Deduct
                </button>
              </div>
            </div>

            {/* Adjust Threshold & Price */}
            <div className="pt-3 border-t border-pizza-borderLight dark:border-pizza-borderDark space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Threshold (units)
                  </label>
                  <input
                    type="number"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pizza-borderLight dark:border-pizza-borderDark bg-white dark:bg-pizza-dark text-pizza-textLight dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pizza-borderLight dark:border-pizza-borderDark bg-white dark:bg-pizza-dark text-pizza-textLight dark:text-white text-xs"
                  />
                </div>
              </div>

              <button
                disabled={modalLoading}
                onClick={handleSaveThresholdAndPrice}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-pizza-burgundy dark:bg-pizza-red hover:bg-pizza-deepWine transition-colors shadow-sm"
              >
                Save Item Properties
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
