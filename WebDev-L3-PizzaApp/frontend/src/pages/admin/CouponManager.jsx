import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/Button';
import { Tag, Trash2, PlusCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxDiscount: '',
    expiryDate: '',
    usageLimit: ''
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.discountType === 'flat') delete payload.maxDiscount;
      if (!payload.usageLimit) delete payload.usageLimit;
      if (!payload.maxDiscount) delete payload.maxDiscount;
      
      await api.post('/coupons', payload);
      toast.success('Coupon created successfully');
      setIsModalOpen(false);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: 0,
        maxDiscount: '',
        expiryDate: '',
        usageLimit: ''
      });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/coupons/${id}`);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (err) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Tag className="w-8 h-8 text-pizza-red" />
          Coupon Management
        </h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Add Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <Card key={coupon._id} className={`p-6 ${!coupon.isActive ? 'opacity-70 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-100 text-green-800 font-mono font-bold text-lg px-3 py-1 rounded border border-green-200 uppercase tracking-widest">
                {coupon.code}
              </div>
              <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
              {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p>Min Order: ₹{coupon.minOrderValue}</p>
              {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                <p>Max Discount: ₹{coupon.maxDiscount}</p>
              )}
              <p>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
              <p>Used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'}</p>
            </div>

            <Button 
              onClick={() => toggleStatus(coupon)} 
              variant={coupon.isActive ? 'outline' : 'primary'}
              className="w-full text-sm"
            >
              {coupon.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Create New Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Coupon Code</label>
                  <input required type="text" name="code" value={formData.code} onChange={handleChange} className="w-full border rounded p-2 uppercase" placeholder="e.g. SUMMER50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full border rounded p-2">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value</label>
                  <input required type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className="w-full border rounded p-2" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Value (₹)</label>
                  <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} className="w-full border rounded p-2" min="0" />
                </div>
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                    <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} className="w-full border rounded p-2" min="0" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit (Optional)</label>
                  <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="w-full border rounded p-2" min="1" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Coupon</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
