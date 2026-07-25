import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Base',
    stock: 0,
    threshold: 20,
    price: 0
  });

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setInventory(data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: (name === 'stock' || name === 'threshold' || name === 'price') ? Number(value) : value
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', newItem);
      toast.success('Item added successfully!');
      setShowAddForm(false);
      setNewItem({ name: '', category: 'Base', stock: 0, threshold: 20, price: 0 });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      await api.put(`/inventory/${id}`, { [field]: value });
      toast.success('Inventory updated');
      fetchInventory();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        toast.success('Item deleted');
        fetchInventory();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <Loader />;

  // Prepare data for chart
  const chartData = inventory.map(item => ({
    name: item.name,
    stock: item.stock,
    threshold: item.threshold,
    isLow: item.stock <= item.threshold
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Item'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 mb-8 bg-gray-50 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Add New Inventory Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" name="name" value={newItem.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" value={newItem.category} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border">
                  <option value="Base">Base</option>
                  <option value="Sauce">Sauce</option>
                  <option value="Cheese">Cheese</option>
                  <option value="Veggie">Veggie</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
                <input required type="number" name="stock" value={newItem.stock} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Threshold</label>
                <input required type="number" name="threshold" value={newItem.threshold} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input required type="number" name="price" value={newItem.price} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
            </div>
            <Button type="submit">Create Item</Button>
          </form>
        </Card>
      )}

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Stock Overview</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isLow ? '#E63946' : '#2A9D8F'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item._id} className={item.stock <= item.threshold ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="number" 
                    defaultValue={item.stock}
                    onBlur={(e) => {
                      if (e.target.value !== String(item.stock)) {
                        handleUpdate(item._id, 'stock', Number(e.target.value));
                      }
                    }}
                    className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-pizza-red focus:border-pizza-red sm:text-sm p-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="number" 
                    defaultValue={item.threshold}
                    onBlur={(e) => {
                      if (e.target.value !== String(item.threshold)) {
                        handleUpdate(item._id, 'threshold', Number(e.target.value));
                      }
                    }}
                    className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-pizza-red focus:border-pizza-red sm:text-sm p-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="number" 
                    defaultValue={item.price}
                    onBlur={(e) => {
                      if (e.target.value !== String(item.price)) {
                        handleUpdate(item._id, 'price', Number(e.target.value));
                      }
                    }}
                    className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-pizza-red focus:border-pizza-red sm:text-sm p-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {item.stock <= item.threshold && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  )}
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager;
