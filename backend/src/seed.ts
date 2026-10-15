import 'dotenv/config';
import { connectDb, disconnectDb } from './db';
import { EventModel } from './models/Event';
import { UserModel } from './models/User';
import { hashPassword } from './auth/auth';

// Seeds one demo user + event into an *empty* local DB only.
async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/events-graphql';
  await connectDb(uri);

  const users = await UserModel.estimatedDocumentCount();
  if (users > 0) {
    console.log('DB already has users, skipping seed');
    await disconnectDb();
    return;
  }

  const user = await new UserModel({
    email: 'demo@example.com',
    passwordHash: await hashPassword('password123'),
  }).save();

  await new EventModel({
    title: 'GraphQL launch party',
    description: 'Demo event seeded into local MongoDB',
    price: 0,
    date: new Date(),
    owner: user._id,
  }).save();

  console.log('Seeded demo@example.com / password123 with one event');
  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDb();
  process.exitCode = 1;
});
