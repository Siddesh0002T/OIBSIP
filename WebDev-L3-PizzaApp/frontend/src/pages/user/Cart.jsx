import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      toast.success('Item removed');
      fetchCart();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <Loader />;

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  const calculateSubtotal = () => {
    if (isEmpty) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-display font-bold text-pizza-dark mb-8 flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-pizza-red" />
        Your Cart
      </h1>

      {isEmpty ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <ShoppingCart className="w-24 h-24 text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any delicious pizzas to your cart yet.</p>
          <Link to="/dashboard">
            <Button>Browse Menu</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map(item => (
              <Card key={item._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingCart />
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    <span className="font-bold text-pizza-red">₹{item.price * item.quantity}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {item.base}, {item.sauce}, {item.cheese}
                    {item.vegetables && item.vegetables.length > 0 && ` + ${item.vegetables.join(', ')}`}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 font-medium border-x border-gray-300">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 border-b pb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.items.reduce((acc, curr) => acc + curr.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900">₹{calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">Calculated at Checkout</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold">Estimated Total</span>
                  <span className="text-2xl font-bold text-pizza-red">₹{calculateSubtotal()}</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full py-3 text-lg">Proceed to Checkout</Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
