import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { Package, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      // Fetch user's reviews to see which orders are already reviewed
      const reviewsRes = await api.get('/reviews').catch(() => ({ data: [] }));
      const userReviews = reviewsRes.data;
      
      const ordersWithReviewState = data.map(order => ({
        ...order,
        hasReviewed: userReviews.some(r => r.orderId === order._id)
      }));
      setOrders(ordersWithReviewState);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const submitReview = async () => {
    try {
      await api.post('/reviews', { orderId: reviewModal, rating, comment });
      toast.success('Review submitted successfully!');
      setReviewModal(null);
      setRating(5);
      setComment('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold text-pizza-dark mb-8 flex items-center gap-3">
        <Package className="w-8 h-8 text-pizza-red" />
        Order History
      </h1>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
          <p className="text-gray-500 mt-2 mb-6">Looks like you haven't ordered any pizzas yet.</p>
          <Link to="/dashboard" className="bg-pizza-red text-white px-6 py-2 rounded-md font-bold hover:bg-red-700">
            Order Now
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order._id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: #{order._id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                    order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}>
                    {order.orderStatus}
                  </span>
                  <Link to={`/order/${order._id}`} className="text-pizza-red hover:underline text-sm font-bold">
                    View Details & Track &rarr;
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Items Ordered</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-gray-700">
                        <span>{item.quantity}x {item.name || 'Custom Pizza'}</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t mt-4 pt-3 flex justify-between font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-pizza-red">₹{order.totalAmount}</span>
                  </div>
                  {order.orderStatus === 'Delivered' && !order.hasReviewed && (
                    <button 
                      onClick={() => setReviewModal(order._id)}
                      className="mt-4 text-sm font-bold text-blue-600 border border-blue-600 px-4 py-1.5 rounded hover:bg-blue-50"
                    >
                      ★ Rate Order
                    </button>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" /> Delivery To
                  </h4>
                  <p className="text-gray-700">{order.phone}</p>
                  <p className="text-gray-600 mt-1 whitespace-pre-line">{order.deliveryAddress}</p>
                  {order.isPriority && (
                    <div className="mt-3 inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200">
                      ⚡ Priority Order
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Rate Your Order</h2>
            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment (optional)"
              className="w-full border rounded p-2 mb-4 h-24"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setReviewModal(null); setRating(5); setComment(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={submitReview}
                className="px-4 py-2 bg-pizza-red text-white rounded font-bold hover:bg-red-700"
              >
                Submit Review
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
