import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { User } from '../models/User';

dotenv.config();

async function seed() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    const uri = process.env.MONGODB_URI || 'mongodb+srv://realEstate:fuad@cluster0.az94fyn.mongodb.net/job-tracker';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully!');

    const email = 'fuadtalukder25@gmail.com';
    const password = '56867585';
    const name = 'Fuad Talukder';
    const role = 'admin';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.password = password;
      existingUser.name = name;
      existingUser.role = role;
      await existingUser.save();
      console.log(`User ${email} updated successfully in MongoDB database!`);
    } else {
      const newUser = await User.create({
        name,
        email,
        password,
        role,
      });
      console.log(`User ${newUser.email} created successfully in MongoDB database! ID: ${newUser._id}`);
    }

    const allUsers = await User.find({}).select('-password');
    console.log('All Users in Database:', allUsers);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  }
}

seed();
