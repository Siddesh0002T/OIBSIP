require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const scheduleLowStockCheck = require('./src/jobs/lowStockChecker');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  scheduleLowStockCheck();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Database connection failed", err);
  process.exit(1);
});
