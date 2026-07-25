import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { Stepper } from '../../components/Stepper';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies'];

const PizzaBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [selection, setSelection] = useState({
    base: null,
    sauce: null,
    cheese: null,
    vegetables: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/inventory');
        setInventory(data);
      } catch (error) {
        console.error('Error fetching inventory', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const getItemsByCategory = (category) => {
    return inventory.filter(item => item.category === category && item.stock > 0);
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      // Complete builder, add to cart
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
          name: 'Custom Built Pizza',
          base: selection.base.name,
          sauce: selection.sauce.name,
          cheese: selection.cheese.name,
          vegetables: selection.vegetables.map(v => v.name),
          price: calculateTotal(),
          quantity: 1
        });
        toast.success('Custom pizza added to cart!');
        navigate('/cart');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add custom pizza to cart');
        console.error('Failed to add custom pizza to cart', err);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (selection.base) total += selection.base.price;
    if (selection.sauce) total += selection.sauce.price;
    if (selection.cheese) total += selection.cheese.price;
    selection.vegetables.forEach(v => total += v.price);
    return total;
  };

  const isStepValid = () => {
    if (currentStep === 0) return !!selection.base;
    if (currentStep === 1) return !!selection.sauce;
    if (currentStep === 2) return !!selection.cheese;
    return true; // Veggies are optional
  };

  const renderOptions = () => {
    let items = [];
    let selectedItem = null;
    let onSelect = null;
    let isMulti = false;

    if (currentStep === 0) {
      items = getItemsByCategory('Base');
      selectedItem = selection.base;
      onSelect = (item) => setSelection({ ...selection, base: item });
    } else if (currentStep === 1) {
      items = getItemsByCategory('Sauce');
      selectedItem = selection.sauce;
      onSelect = (item) => setSelection({ ...selection, sauce: item });
    } else if (currentStep === 2) {
      items = getItemsByCategory('Cheese');
      selectedItem = selection.cheese;
      onSelect = (item) => setSelection({ ...selection, cheese: item });
    } else if (currentStep === 3) {
      items = getItemsByCategory('Veggie');
      isMulti = true;
      onSelect = (item) => {
        const isSelected = selection.vegetables.find(v => v._id === item._id);
        if (isSelected) {
          setSelection({ ...selection, vegetables: selection.vegetables.filter(v => v._id !== item._id) });
        } else {
          setSelection({ ...selection, vegetables: [...selection.vegetables, item] });
        }
      };
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => {
          const isSelected = isMulti 
            ? !!selection.vegetables.find(v => v._id === item._id)
            : selectedItem?._id === item._id;

          return (
            <div 
              key={item._id}
              onClick={() => onSelect(item)}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                isSelected ? 'border-pizza-red bg-red-50 shadow-md transform scale-105' : 'border-gray-200 hover:border-orange-300 bg-white'
              }`}
            >
              <h4 className="font-bold text-gray-900 text-center mb-1">{item.name}</h4>
              <p className="text-center text-pizza-red font-medium">+₹{item.price}</p>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-extrabold text-pizza-dark">Build Your Masterpiece</h1>
        <p className="text-gray-600 mt-2">Follow the steps to customize your perfect pizza.</p>
      </div>

      <Card className="p-8">
        <Stepper steps={STEPS} currentStep={currentStep} />
        
        <div className="min-h-[300px] py-6">
          <h2 className="text-2xl font-bold mb-6">Select {STEPS[currentStep]}</h2>
          {renderOptions()}
        </div>

        <div className="border-t pt-6 flex justify-between items-center mt-6">
          <div className="flex items-center space-x-4">
            <span className="text-lg text-gray-600">Running Total:</span>
            <span className="text-2xl font-bold text-pizza-red">₹{calculateTotal()}</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!isStepValid()}>
              {currentStep === STEPS.length - 1 ? 'Add to Cart' : 'Next Step'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PizzaBuilder;
