import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import toast from 'react-hot-toast';

const MenuManager = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newPizza, setNewPizza] = useState({
    name: '',
    description: '',
    base: '',
    sauce: '',
    cheese: '',
    vegetables: '',
    price: 0,
    imageUrl: ''
  });

  const fetchPizzas = async () => {
    try {
      const { data } = await api.get('/pizzas');
      setPizzas(data);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPizza(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleAddPizza = async (e) => {
    e.preventDefault();
    try {
      // Convert vegetables string to array
      const vegArray = newPizza.vegetables.split(',').map(v => v.trim()).filter(v => v);
      
      const payload = { ...newPizza, vegetables: vegArray };
      await api.post('/pizzas', payload);
      
      toast.success('Pizza added successfully!');
      setShowAddForm(false);
      setNewPizza({ name: '', description: '', base: '', sauce: '', cheese: '', vegetables: '', price: 0, imageUrl: '' });
      fetchPizzas();
    } catch (error) {
      toast.error('Failed to add pizza');
    }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      await api.put(`/pizzas/${id}`, { [field]: value });
      toast.success('Pizza updated');
      fetchPizzas();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pizza?')) {
      try {
        await api.delete(`/pizzas/${id}`);
        toast.success('Pizza deleted');
        fetchPizzas();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Pizza'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 mb-8 bg-gray-50 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Add New Specialty Pizza</h2>
          <form onSubmit={handleAddPizza} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" name="name" value={newPizza.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input required type="text" name="description" value={newPizza.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base</label>
                <input required type="text" name="base" value={newPizza.base} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sauce</label>
                <input required type="text" name="sauce" value={newPizza.sauce} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cheese</label>
                <input required type="text" name="cheese" value={newPizza.cheese} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vegetables (comma separated)</label>
                <input type="text" name="vegetables" value={newPizza.vegetables} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input required type="number" name="price" value={newPizza.price} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input type="text" name="imageUrl" value={newPizza.imageUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-2 border" />
              </div>
            </div>
            <Button type="submit">Create Pizza</Button>
          </form>
        </Card>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pizzas.map((pizza) => (
              <tr key={pizza._id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{pizza.name}</div>
                  <div className="text-sm text-gray-500">{pizza.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <p>B: {pizza.base} | S: {pizza.sauce} | C: {pizza.cheese}</p>
                  <p>V: {pizza.vegetables?.join(', ')}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="number" 
                    defaultValue={pizza.price}
                    onBlur={(e) => {
                      if (e.target.value !== String(pizza.price)) {
                        handleUpdate(pizza._id, 'price', Number(e.target.value));
                      }
                    }}
                    className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-pizza-red p-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={pizza.isActive}
                    onChange={(e) => handleUpdate(pizza._id, 'isActive', e.target.value === 'true')}
                    className="border-gray-300 rounded-md shadow-sm p-1 border"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleDelete(pizza._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManager;
