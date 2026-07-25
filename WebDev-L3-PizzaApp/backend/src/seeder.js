const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Inventory = require('./models/Inventory');
const Pizza = require('./models/Pizza');
const LoyaltyConfig = require('./models/LoyaltyConfig');
const connectDB = require('./config/db');

dotenv.config(); // since we run from backend root

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Admin.deleteMany();
    await Inventory.deleteMany();
    await Pizza.deleteMany();
    await LoyaltyConfig.deleteMany();

    await LoyaltyConfig.create({
      stampsRequiredForReward: 5,
      rewardType: 'percent_discount',
      rewardValue: 20
    });

    const createdAdmin = await Admin.create({
      name: 'Admin',
      email: 'admin@pizza.com',
      password: 'password123'
    });

    const inventoryItems = [
      { name: 'Thin Crust', category: 'Base', stock: 50, price: 100 },
      { name: 'Thick Crust', category: 'Base', stock: 50, price: 150 },
      { name: 'Cheese Burst', category: 'Base', stock: 20, price: 200 },
      
      { name: 'Tomato', category: 'Sauce', stock: 100, price: 20 },
      { name: 'Pesto', category: 'Sauce', stock: 50, price: 40 },
      { name: 'BBQ', category: 'Sauce', stock: 50, price: 30 },

      { name: 'Mozzarella', category: 'Cheese', stock: 100, price: 50 },
      { name: 'Cheddar', category: 'Cheese', stock: 50, price: 60 },

      { name: 'Onion', category: 'Veggie', stock: 200, price: 10 },
      { name: 'Capsicum', category: 'Veggie', stock: 150, price: 15 },
      { name: 'Mushroom', category: 'Veggie', stock: 100, price: 30 },
      { name: 'Olive', category: 'Veggie', stock: 100, price: 40 },
    ];

    await Inventory.insertMany(inventoryItems);

    const pizzas = [
      {
        name: 'Margherita',
        description: 'Classic cheese and tomato pizza.',
        base: 'Thin Crust',
        sauce: 'Tomato',
        cheese: 'Mozzarella',
        vegetables: [],
        price: 170,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400',
      },
      {
        name: 'Veggie Supreme',
        description: 'Loaded with veggies.',
        base: 'Thick Crust',
        sauce: 'Tomato',
        cheese: 'Mozzarella',
        vegetables: ['Onion', 'Capsicum', 'Mushroom'],
        price: 275,
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=400',
      },
    ];

    await Pizza.insertMany(pizzas);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();
