import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import toast from 'react-hot-toast';

const statuses = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus, extraData = {}) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus, ...extraData });
      toast.success('Order updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleCancel = async (order) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason !== null) {
      if (order.paymentMethod === 'wallet') {
        const confirmRefund = window.confirm(`This order was paid using Wallet. Do you want to refund ₹${order.totalAmount} back to the user's wallet?`);
        if (confirmRefund) {
          try {
            await api.post('/wallet/refund', {
              userId: order.user._id,
              amount: order.totalAmount,
              orderId: order._id,
              reason: reason
            });
            toast.success('Refund processed successfully');
          } catch (err) {
            toast.error('Failed to process refund');
          }
        }
      }
      updateStatus(order._id, 'Cancelled', { cancelReason: reason });
    }
  };

  const togglePriority = (order) => {
    updateStatus(order._id, order.orderStatus, { isPriority: !order.isPriority });
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.orderStatus === filter);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:ring-pizza-red focus:border-pizza-red py-2 pl-3 pr-10 text-base"
        >
          <option value="All">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found.</div>
        ) : (
          filteredOrders.map(order => (
            <Card key={order._id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    Order #{order._id}
                    {order.isPriority && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded border border-purple-200">Priority</span>}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()} • {order.user?.name || 'Unknown'} ({order.user?.email || 'N/A'})
                  </p>
                  <p className="text-xs text-gray-400 capitalize mt-1 border inline-block px-1 rounded">Paid via: {order.paymentMethod || 'Razorpay'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-bold text-xl text-pizza-dark mr-2">₹{order.totalAmount}</div>
                  <button 
                    onClick={() => togglePriority(order)}
                    className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 font-medium"
                  >
                    {order.isPriority ? 'Remove Priority' : 'Make Priority'}
                  </button>
                  {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                    <button 
                      onClick={() => handleCancel(order)}
                      className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 font-medium"
                    >
                      Cancel Order
                    </button>
                  )}
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-pizza-red focus:border-pizza-red text-sm"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                        <p className="font-bold mb-1">{item.name || 'Custom Pizza'} (x{item.quantity})</p>
                        <p><span className="font-medium">Base:</span> {item.base}</p>
                        <p><span className="font-medium">Sauce:</span> {item.sauce}</p>
                        <p><span className="font-medium">Cheese:</span> {item.cheese}</p>
                        {item.vegetables && item.vegetables.length > 0 && (
                          <p><span className="font-medium">Veggies:</span> {item.vegetables.join(', ')}</p>
                        )}
                        <p className="mt-2 font-bold text-gray-700">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Delivery Information:</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                    <p className="font-bold text-gray-800">{order.phone}</p>
                    <p className="text-gray-600 mt-1 whitespace-pre-line">{order.deliveryAddress}</p>
                  </div>
                  {order.orderStatus === 'Cancelled' && (
                    <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-100 text-sm">
                      <p className="font-bold text-red-800">Cancellation Reason:</p>
                      <p className="text-red-600 mt-1">{order.cancelReason || 'No reason provided'}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManager;
