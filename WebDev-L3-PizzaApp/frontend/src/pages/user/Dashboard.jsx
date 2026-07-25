import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../hooks/useAuth';
import { Pizza, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [pizzas, setPizzas] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pizzasRes, ordersRes, loyaltyRes, reviewsRes] = await Promise.all([
          api.get('/pizzas'),
          api.get('/orders/myorders').catch(() => ({ data: [] })),
          api.get('/loyalty/me').catch(() => ({ data: null })),
          api.get('/reviews').catch(() => ({ data: [] }))
        ]);
        setPizzas(pizzasRes.data);
        setMyOrders(ordersRes.data);
        setLoyalty(loyaltyRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  const handleAddToCart = async (pizza) => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    if (user.role === 'admin') {
      toast.error('Admins cannot add to cart. Please login as a regular user.');
      return;
    }
    try {
      await api.post('/cart', {
        pizzaId: pizza._id,
        name: pizza.name,
        base: pizza.base,
        sauce: pizza.sauce,
        cheese: pizza.cheese,
        vegetables: pizza.vegetables,
        price: pizza.price,
        imageUrl: pizza.imageUrl,
        quantity: 1
      });
      toast.success(`${pizza.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-pizza-dark mb-2">
          {user ? `Welcome back, ${user.name}!` : 'Welcome to Slice!'}
        </h1>
        <p className="text-gray-600">What are you craving today?</p>
      </div>

      {loyalty && (
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center text-gray-900 gap-2">
                <Gift className="text-pizza-red w-6 h-6" /> 
                Your Rewards
              </h2>
              <p className="text-gray-600 mt-1">Earn a stamp for every order. Fill the card for a special reward!</p>
              {loyalty.rewardsAvailable > 0 && (
                <div className="mt-3 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🎉 You have {loyalty.rewardsAvailable} reward{loyalty.rewardsAvailable > 1 ? 's' : ''} available!
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: loyalty.stampsRequiredForReward }).map((_, i) => {
                const isEarned = i < loyalty.loyaltyStamps;
                const isJustEarned = i === loyalty.loyaltyStamps - 1; // Assuming the last one was just earned
                return (
                  <div key={i} className={`relative flex items-center justify-center w-12 h-12 rounded-full ${isEarned ? 'bg-pizza-red text-white' : 'bg-white border-2 border-dashed border-gray-300 text-gray-300'} ${isJustEarned ? 'animate-bounce' : 'transition-transform hover:scale-110'}`}>
                    <Pizza size={24} className={isEarned ? 'fill-current' : ''} />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <div className="bg-pizza-red text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl font-bold mb-2">Feeling Creative?</h2>
          <p className="opacity-90">Design your perfect pizza from scratch with our interactive builder.</p>
        </div>
        <Link to="/build">
          <Button variant="secondary" className="whitespace-nowrap">Build Your Own Pizza</Button>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-pizza-dark mb-6">Our Specialties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pizzas.map((pizza) => (
            <Card key={pizza._id} className="flex flex-col">
              <img src={pizza.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400'} alt={pizza.name} className="h-48 w-full object-cover" />
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pizza.name}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{pizza.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-pizza-red">₹{pizza.price}</span>
                  <Button onClick={() => handleAddToCart(pizza)}>Add to Cart</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {myOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-display font-bold text-pizza-dark mb-6">Recent Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myOrders.slice(0, 4).map((order) => (
              <Card key={order._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order._id.substring(order._id.length - 6)}</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold">₹{order.totalAmount}</span>
                  <Link to={`/order/${order._id}`} className="text-pizza-red hover:underline text-sm font-medium">
                    Track Order &rarr;
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-display font-bold text-pizza-dark mb-6">What our customers are saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review) => (
              <Card key={review._id} className="p-6 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-3 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{review.comment || 'Great pizza!'}"</p>
                <div className="text-sm font-bold text-gray-900">- {review.user?.name || 'Anonymous'}</div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
