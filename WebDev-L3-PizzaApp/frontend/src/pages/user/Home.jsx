import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-orange-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl text-center space-y-8 animate-fade-in">
        <h1 className="text-5xl sm:text-6xl text-pizza-dark font-extrabold tracking-tight">
          Craft Your <span className="text-pizza-red">Perfect Slice</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Experience the ultimate pizza builder. Choose your crust, layer your favorite sauces, and pile on the freshest ingredients.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/build">
            <Button className="w-full sm:w-auto text-lg px-8 py-4">Start Building</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-4">View Menu</Button>
          </Link>
        </div>
        
        <div className="pt-12 mt-12 border-t border-orange-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200" 
            alt="Delicious Pizza" 
            className="rounded-2xl shadow-2xl w-full object-cover h-[400px] hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
