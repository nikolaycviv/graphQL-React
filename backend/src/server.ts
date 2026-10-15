import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { connectDb } from './db';
import { assertJwtSecret, verifyToken } from './auth/auth';
import { resolvers, type Context } from './resolvers';
import { typeDefs } from './schema';

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/events-graphql';

async function main(): Promise<void> {
  assertJwtSecret();
  await connectDb(mongoUri);

  const server = new ApolloServer<Context>({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        const header = req.headers.authorization ?? '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        const claims = token ? verifyToken(token) : null;
        return { userId: claims?.sub ?? null };
      },
    }),
  );

  app.listen(port, () => {
    console.log(`GraphQL ready at http://localhost:${port}/graphql`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
