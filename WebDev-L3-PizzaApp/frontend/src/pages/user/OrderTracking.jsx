import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/Button';
import { OrderStatusTracker } from '../../components/StatusBadge';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Polling every 5 seconds for order status updates
    const intervalId = setInterval(fetchOrder, 5000);
    
    return () => clearInterval(intervalId);
  }, [id]);

  if (loading && !order) return <Loader />;

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700">Order not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-pizza-dark mb-2">Track Your Order</h1>
        <p className="text-gray-500">Order ID: #{order._id}</p>
      </div>

      <Card className="p-8 mb-8 pb-20">
        <OrderStatusTracker currentStatus={order.orderStatus} />
      </Card>

      <Card className="p-8 bg-orange-50 border-orange-100">
        <h2 className="text-xl font-bold mb-6">Order Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-orange-200">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Delivery Information</h3>
            <p className="font-medium text-gray-900">{order.phone}</p>
            <p className="text-gray-600 whitespace-pre-line">{order.deliveryAddress}</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Order Status</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
              order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
              order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {order.orderStatus}
            </span>
            {order.orderStatus === 'Cancelled' && order.cancelReason && (
              <p className="text-red-600 text-sm mt-2 font-medium">Reason: {order.cancelReason}</p>
            )}
            {order.isPriority && (
              <p className="text-purple-600 text-sm mt-2 font-bold flex items-center gap-1">
                ⚡ Priority Processing
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-orange-200 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-bold text-lg text-pizza-dark">{item.name || 'Custom Pizza'} (x{item.quantity})</p>
                <div className="text-gray-600 text-sm mt-1 space-y-1">
                  <p><span className="font-medium text-gray-800">Base:</span> {item.base}</p>
                  <p><span className="font-medium text-gray-800">Sauce:</span> {item.sauce}</p>
                  <p><span className="font-medium text-gray-800">Cheese:</span> {item.cheese}</p>
                  {item.vegetables && item.vegetables.length > 0 && (
                    <p><span className="font-medium text-gray-800">Veggies:</span> {item.vegetables.join(', ')}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-pizza-dark">₹{item.price * item.quantity}</p>
                <p className="text-gray-500 text-sm">₹{item.price} each</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-orange-200 mt-6 pt-6 flex justify-between items-center">
          <span className="text-xl font-bold text-gray-800">Total Paid</span>
          <span className="text-3xl font-extrabold text-pizza-red">₹{order.totalAmount}</span>
        </div>
      </Card>
      
      <div className="mt-8 text-center">
        <Link to="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderTracking;
