import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/Button';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/wallet');
      setWallet(data);
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
      return toast.error('Enter a valid amount');
    }

    try {
      // 1. Create Razorpay order
      const { data: orderData } = await api.post('/payment/create-order', {
        amount: Number(topUpAmount)
      });

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_THKXCvBapKxDFj',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Pizza App Wallet',
        description: 'Wallet Top-Up',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            // 3. Verify on backend and update wallet
            const verifyRes = await api.post('/wallet/topup', {
              amount: topUpAmount,
              razorpayPaymentId: response.razorpay_payment_id
            });
            setWallet(prev => ({
              balance: verifyRes.data.balance,
              transactions: [verifyRes.data.transaction, ...prev.transactions]
            }));
            setTopUpAmount('');
            toast.success('Wallet topped up successfully!');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#dc2626' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate top-up');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold text-pizza-dark mb-8 flex items-center gap-3">
        <WalletIcon className="w-8 h-8 text-pizza-red" />
        My Wallet
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="p-8 md:col-span-1 bg-pizza-dark text-white text-center flex flex-col justify-center">
          <p className="text-green-500 font-medium mb-2 uppercase tracking-wide">Available Balance</p>
          <p className="text-5xl font-extrabold text-green-500 mb-2">₹{wallet?.balance || 0}</p>
        </Card>

        <Card className="p-8 md:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top-Up Wallet</h2>
          <form onSubmit={handleTopUp} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                min="10"
                step="1"
                required
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount (e.g. 500)"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pizza-red focus:border-pizza-red py-2 px-3 text-lg"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto h-11 px-8 text-lg flex-shrink-0">
              Add Funds
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-4">
            Funds added to your wallet can be used for faster checkouts without needing to enter payment details every time.
          </p>
        </Card>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Transaction History</h2>
        {(!wallet?.transactions || wallet.transactions.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wallet.transactions.map((tx) => (
              <div key={tx._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  {tx.type === 'topup' ? (
                    <ArrowDownCircle className="w-8 h-8 text-green-500" />
                  ) : tx.type === 'refund' ? (
                    <RefreshCcw className="w-8 h-8 text-blue-500" />
                  ) : (
                    <ArrowUpCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-extrabold text-lg ${tx.type === 'topup' || tx.type === 'refund' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {tx.type === 'topup' || tx.type === 'refund' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Wallet;
