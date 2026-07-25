import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Package, ListOrdered, Pizza, Award, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { Loader } from '../../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, inventoryRes] = await Promise.all([
          api.get('/orders/all'),
          api.get('/inventory')
        ]);
        
        const orders = ordersRes.data;
        const inventory = inventoryRes.data;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let ordersToday = 0;
        let revenueToday = 0;
        let pendingOrders = 0;

        orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= today) {
            ordersToday++;
            revenueToday += order.totalAmount;
          }
          if (order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled') {
            pendingOrders++;
          }
        });

        const lowStockItems = inventory.filter(item => item.stock <= (item.threshold || 10)).length;

        setStats({ ordersToday, revenueToday, pendingOrders, lowStockItems });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 bg-blue-50 border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">Orders Today</p>
            <p className="text-3xl font-extrabold text-blue-900 mt-1">{stats.ordersToday}</p>
          </div>
          <ListOrdered className="w-10 h-10 text-blue-400 opacity-50" />
        </Card>
        
        <Card className="p-6 bg-green-50 border-green-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Revenue Today</p>
            <p className="text-3xl font-extrabold text-green-900 mt-1">₹{stats.revenueToday}</p>
          </div>
          <TrendingUp className="w-10 h-10 text-green-400 opacity-50" />
        </Card>
        
        <Card className="p-6 bg-orange-50 border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600 uppercase tracking-wide">Pending Orders</p>
            <p className="text-3xl font-extrabold text-orange-900 mt-1">{stats.pendingOrders}</p>
          </div>
          <Clock className="w-10 h-10 text-orange-400 opacity-50" />
        </Card>
        
        <Card className="p-6 bg-red-50 border-red-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-red-600 uppercase tracking-wide">Low Stock Items</p>
            <p className="text-3xl font-extrabold text-red-900 mt-1">{stats.lowStockItems}</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-400 opacity-50" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/admin/menu">
          <Card className="p-8 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer h-64 transition-all hover:-translate-y-2">
            <Pizza className="w-16 h-16 text-pizza-red mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
            <p className="text-gray-500 mt-2 text-center">Add, edit, or remove specialty pizzas and set prices.</p>
          </Card>
        </Link>

        <Link to="/admin/inventory">
          <Card className="p-8 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer h-64 transition-all hover:-translate-y-2">
            <Package className="w-16 h-16 text-pizza-red mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <p className="text-gray-500 mt-2 text-center">Monitor stock levels, set thresholds, and manually adjust inventory.</p>
          </Card>
        </Link>
        
        <Link to="/admin/orders">
          <Card className="p-8 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer h-64 transition-all hover:-translate-y-2">
            <ListOrdered className="w-16 h-16 text-pizza-red mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <p className="text-gray-500 mt-2 text-center">View customer orders and update their delivery status.</p>
          </Card>
        </Link>
        
        <Link to="/admin/loyalty">
          <Card className="p-8 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer h-64 transition-all hover:-translate-y-2">
            <Award className="w-16 h-16 text-pizza-red mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Loyalty Settings</h2>
            <p className="text-gray-500 mt-2 text-center">Manage punch-card rewards and view top customers.</p>
          </Card>
        </Link>
        
        <Link to="/admin/coupons">
          <Card className="p-8 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer h-64 transition-all hover:-translate-y-2">
            <div className="w-16 h-16 flex items-center justify-center bg-pizza-red text-white rounded-full mb-4">
              <span className="font-bold text-2xl">%</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Coupon Manager</h2>
            <p className="text-gray-500 mt-2 text-center">Create and manage discount codes.</p>
          </Card>
        </Link>
        
        <Link to="/admin/reviews">
          <Card className="p-8 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer h-64 transition-all hover:-translate-y-2">
            <div className="w-16 h-16 flex items-center justify-center bg-pizza-red text-white rounded-full mb-4">
              <span className="font-bold text-2xl">★</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            <p className="text-gray-500 mt-2 text-center">Monitor and moderate customer feedback.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
