const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('../utils/sendEmail');

const scheduleLowStockCheck = () => {
  const cronExpression = process.env.STOCK_CHECK_CRON || '0 * * * *';
  
  cron.schedule(cronExpression, async () => {
    console.log('Running low stock check cron job...');
    try {
      const inventory = await Inventory.find({});
      const lowStockItems = inventory.filter(item => item.stock < item.threshold);

      if (lowStockItems.length > 0) {
        let message = 'The following items are running low on stock:\n\n';
        lowStockItems.forEach(item => {
          message += `- ${item.name} (${item.category}): Current Stock = ${item.stock}, Threshold = ${item.threshold}\n`;
        });
        
        await sendEmail({
          email: process.env.ADMIN_ALERT_EMAIL,
          subject: 'ALERT: Low Stock Warning',
          message
        });
        console.log('Low stock alert email sent to admin.');
      } else {
        console.log('No low stock items found.');
      }
    } catch (error) {
      console.error('Error in low stock cron job:', error);
    }
  });
};

module.exports = scheduleLowStockCheck;
