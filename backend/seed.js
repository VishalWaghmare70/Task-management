require('dotenv').config();
const { setDefaultResultOrder } = require('dns');
setDefaultResultOrder('ipv4first');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Connected to MongoDB for seeding...');

  // Clear existing data
  await User.deleteMany({});
  await Task.deleteMany({});
  console.log('🧹 Cleared existing data');

  // Hash passwords
  const defaultPwd = await bcrypt.hash('password123', 10);

  // ── Managers ─────────────────────────────────────────
  await User.create({
    name: 'Prerna Sonavane',
    email: 'sonavaneprerna06@gmail.com',
    password: defaultPwd,
    role: 'Manager',
  });

  await User.create({
    name: 'Rajesh Waghchaware',
    email: 'rajesh.waghchaware@gmail.com',
    password: defaultPwd,
    role: 'FOUNDER',
  });

  // ── Team Members ─────────────────────────────────────
  await User.create({
    name: 'Musif Tamboli',
    email: 'musiftamboli6818@gmail.com',
    password: defaultPwd,
    role: 'Team Member',
  });

  await User.create({
    name: 'Vishal Waghmare',
    email: 'vishalwaghmare7083@gmail.com',
    password: defaultPwd,
    role: 'Team Member',
  });

  await User.create({
    name: 'Vivek Supnekar',
    email: 'viveksupnekar18@gmail.com',
    password: defaultPwd,
    role: 'Team Member',
  });

  await User.create({
    name: 'Anjali Vainsla',
    email: 'vainslaanjali@gmail.com',
    password: defaultPwd,
    role: 'Team Member',
  });

  await User.create({
    name: 'Veena Vadini',
    email: 'veenavadini084@gmail.com',
    password: defaultPwd,
    role: 'Team Member',
  });

  console.log('👥 Created 2 Managers + 5 Team Members');
  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Default password for ALL users: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  👔 Managers:');
  console.log('     sonavaneprerna06@gmail.com');
  console.log('     FOUNDER: ');
  console.log('     rajesh.waghchaware@gmail.com');
  console.log('  👤 Team Members:');
  console.log('     musiftamboli6818@gmail.com');
  console.log('     vishalwaghmare7083@gmail.com');
  console.log('     viveksupnekar18@gmail.com');
  console.log('     vainslaanjali@gmail.com');
  console.log('     veenavadini084@gmail.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
