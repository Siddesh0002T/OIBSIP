import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';
import { Gift, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/Loader';

const Checkout = () => {
  const { user, login } = useAuth(); // We might use login to refresh user state
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loyalty, setLoyalty] = useState(null);
  const [rewardApplied, setRewardApplied] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [processingCoupon, setProcessingCoupon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const [cartRes, loyaltyRes, profileRes, walletRes] = await Promise.all([
          api.get('/cart'),
          api.get('/loyalty/me').catch(() => ({ data: null })),
          api.get('/auth/profile'),
          api.get('/wallet').catch(() => ({ data: { balance: 0 } }))
        ]);
        
        const cartData = cartRes.data;
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          navigate('/cart');
          return;
        }

        setCart(cartData);
        
        const subtotal = cartData.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        setOriginalTotal(subtotal);
        setTotal(subtotal); // ignoring delivery fee for now as per requirements
        
        setLoyalty(loyaltyRes.data);
        
        if (profileRes.data) {
          setAddress(profileRes.data.address || '');
          setPhone(profileRes.data.phone || '');
          if (!profileRes.data.address || !profileRes.data.phone) {
            setIsEditingAddress(true);
          }
        }
        
        if (walletRes.data) {
          setWalletBalance(walletRes.data.balance || 0);
        }
      } catch (err) {
        toast.error('Error loading checkout');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckoutData();
  }, [navigate]);

  const handleApplyReward = async () => {
    try {
      const res = await api.post('/loyalty/redeem', { orderSubtotal: originalTotal });
      setDiscountAmount(res.data.discountAmount);
      setTotal(res.data.newTotal);
      setRewardApplied(true);
      toast.success('Reward applied successfully!');
    } catch (err) {
      toast.error('Failed to apply reward');
    }
  };

  const handleApplyCoupon = async () => {
    setProcessingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderTotal: originalTotal });
      setCouponApplied(res.data);
      setDiscountAmount(res.data.discountAmount);
      setTotal(res.data.newTotal);
      toast.success(`Coupon applied! You saved ₹${res.data.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      setCouponCode('');
    } finally {
      setProcessingCoupon(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      return toast.error('Address and Phone are required');
    }
    try {
      await api.put('/auth/profile', { address, phone });
      setIsEditingAddress(false);
      toast.success('Delivery details saved');
    } catch (err) {
      toast.error('Failed to save details');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (isEditingAddress) {
      return toast.error('Please save your delivery details first');
    }

    setProcessing(true);

    if (paymentMethod === 'wallet') {
      try {
        const res = await api.post('/wallet/pay', {
          amount: total,
          orderItems: cart.items,
          deliveryAddress: address,
          phone: phone,
          couponId: couponApplied?.couponId
        });
        
        // Clear cart
        await api.delete('/cart');
        
        setPaymentSuccess(true);
        toast.success("Wallet payment successful!");
        setTimeout(() => navigate(`/order/${res.data.order._id}`), 1500);
      } catch (err) {
        toast.error(err.response?.data?.message || "Wallet payment failed");
        setProcessing(false);
      }
      return;
    }

    // Razorpay flow
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error("Razorpay SDK failed to load.");
      setProcessing(false);
      return;
    }

    try {
      // 1. Create order on backend
      const { data: order } = await api.post('/payment/create-order', { amount: total });

      // 2. Open Razorpay modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_replace',
        amount: order.amount,
        currency: order.currency,
        name: "Pizza Slice",
        description: "Pizza Order",
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems: cart.items,
              totalAmount: total,
              deliveryAddress: address,
              phone: phone,
              couponId: couponApplied?.couponId
            });
            
            // Clear cart
            await api.delete('/cart');
            
            setPaymentSuccess(true);
            toast.success("Payment successful!");
            setTimeout(() => navigate(`/order/${verifyRes.data.order._id}`), 1500);
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: phone
        },
        theme: {
          color: "#E63946"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error("Failed to create order");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold text-pizza-dark mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 border-b pb-4">
              <MapPin className="w-5 h-5 text-pizza-red" /> Delivery Details
            </h2>
            
            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Delivery Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 h-24"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Address</Button>
                  {(user?.address || user?.phone) && (
                    <Button type="button" variant="ghost" onClick={() => setIsEditingAddress(false)}>Cancel</Button>
                  )}
                </div>
              </form>
            ) : (
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-600">{phone}</p>
                <p className="text-gray-600 mt-2">{address}</p>
                <button 
                  onClick={() => setIsEditingAddress(true)}
                  className="mt-4 text-pizza-red font-medium hover:underline text-sm"
                >
                  Edit Delivery Details
                </button>
              </div>
            )}
          </Card>

          {loyalty && loyalty.rewardsAvailable > 0 && !rewardApplied && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <Gift className="text-green-600 w-8 h-8" />
                <div>
                  <p className="font-bold text-green-900">You have a free reward!</p>
                  <p className="text-sm text-green-700">Apply it to this order?</p>
                </div>
              </div>
              <Button onClick={handleApplyReward} disabled={couponApplied} className="bg-green-600 hover:bg-green-700 text-white">Apply Reward</Button>
            </div>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-4">
              Apply Coupon
            </h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter discount code" 
                className="flex-1 border-gray-300 rounded-md shadow-sm uppercase"
                disabled={couponApplied || rewardApplied}
              />
              <Button 
                onClick={handleApplyCoupon} 
                disabled={!couponCode || couponApplied || rewardApplied || processingCoupon}
                variant={couponApplied ? 'outline' : 'primary'}
              >
                {processingCoupon ? 'Verifying...' : couponApplied ? 'Applied' : 'Apply'}
              </Button>
            </div>
            {(rewardApplied || couponApplied) && (
              <p className="text-sm text-orange-500 mt-2">Only one discount can be applied per order.</p>
            )}
            {couponApplied && (
              <button 
                onClick={() => {
                  setCouponApplied(null);
                  setCouponCode('');
                  setTotal(originalTotal);
                }} 
                className="text-red-500 text-sm hover:underline mt-2 inline-block"
              >
                Remove Coupon
              </button>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 border-b pb-4">Order Summary</h2>
            
            <div className="max-h-64 overflow-y-auto pr-2 mb-4 space-y-4">
              {cart?.items.map(item => (
                <div key={item._id} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{item.name} x{item.quantity}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.base}, {item.sauce}</p>
                  </div>
                  <div className="font-medium text-gray-900">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{originalTotal}</span>
              </div>
              {rewardApplied && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Loyalty Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 mb-8 pt-4 border-t">
              <span className="text-xl font-bold">Total Amount</span>
              <span className="text-3xl font-bold text-pizza-red">₹{total}</span>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="font-bold text-gray-900 mb-2">Payment Method</p>
              
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="razorpay" 
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-pizza-red"
                  />
                  <span className="font-medium text-gray-900">Pay Online (Razorpay)</span>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${walletBalance < total ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={walletBalance < total}
                    className="w-4 h-4 text-pizza-red"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">Pizza Wallet</span>
                    <span className="text-sm text-gray-500">Available: ₹{walletBalance}</span>
                  </div>
                </div>
                {walletBalance < total && (
                  <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Insufficient</span>
                )}
              </label>
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={processing || paymentSuccess || total === 0 || isEditingAddress}
              isLoading={processing}
              isSuccess={paymentSuccess}
              className="w-full text-lg py-4"
            >
              {paymentSuccess ? 'Payment Done' : `Pay ₹${total}`}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
