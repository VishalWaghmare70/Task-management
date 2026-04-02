const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management')
  .then(async () => {
    const user = await User.findOne({ email: 'rajesh.waghchaware@gmail.com' });
    if (user) {
      user.role = 'CEO';
      await user.save();
      console.log('User upgraded to CEO successfully!');
    } else {
      console.log('User not found.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
