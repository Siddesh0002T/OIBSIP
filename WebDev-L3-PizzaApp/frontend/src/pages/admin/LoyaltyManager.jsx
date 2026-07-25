import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { Award } from 'lucide-react';

const LoyaltyManager = () => {
  const [config, setConfig] = useState({
    stampsRequiredForReward: 5,
    rewardType: 'percent_discount',
    rewardValue: 20
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, leaderboardRes] = await Promise.all([
          api.get('/loyalty/config'),
          api.get('/loyalty/leaderboard')
        ]);
        if (configRes.data) {
          setConfig(configRes.data);
        }
        setLeaderboard(leaderboardRes.data);
      } catch (error) {
        toast.error('Failed to load loyalty settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'rewardType' ? value : Number(value)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/loyalty/config', config);
      toast.success('Loyalty settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Award className="text-pizza-red w-8 h-8" />
        <h1 className="text-3xl font-bold text-gray-900">Loyalty & Rewards</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Reward Configuration</h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stamps Required for Reward
              </label>
              <input 
                type="number" 
                name="stampsRequiredForReward" 
                value={config.stampsRequiredForReward} 
                onChange={handleChange} 
                min="1"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-3 border" 
              />
              <p className="mt-1 text-sm text-gray-500">How many orders a user must place to unlock a reward.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Type
              </label>
              <select 
                name="rewardType" 
                value={config.rewardType} 
                onChange={handleChange} 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-3 border"
              >
                <option value="percent_discount">Percentage Discount</option>
                <option value="free_pizza">Fixed Amount / Free Pizza (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Value {config.rewardType === 'percent_discount' ? '(%)' : '(₹)'}
              </label>
              <input 
                type="number" 
                name="rewardValue" 
                value={config.rewardValue} 
                onChange={handleChange} 
                min="1"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pizza-red focus:ring-pizza-red p-3 border" 
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </Card>

        <Card className="p-8 border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Top Loyal Customers</h2>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500">No loyalty data available yet.</p>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stamps Earned</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user, index) => (
                    <tr key={user._id} className={index === 0 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {index === 0 && <Award className="w-5 h-5 text-yellow-500 mr-2" />}
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-700">
                        {user.totalEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LoyaltyManager;
