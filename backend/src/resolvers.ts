import { GraphQLError } from 'graphql';
import { z } from 'zod';
import { EventModel } from './models/Event';
import { UserModel } from './models/User';
import { hashPassword, signToken, verifyPassword } from './auth/auth';

export interface Context {
  userId: string | null;
}

const eventInputSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(2000),
  price: z.number().min(0),
  date: z.string().datetime({ offset: true }),
});

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8)
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
});

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i);

function requireObjectId(id: string): string {
  if (!objectIdSchema.safeParse(id).success) {
    throw new GraphQLError('Invalid event id', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  return id;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

function emailConflict(): GraphQLError {
  return new GraphQLError('Email already registered', {
    extensions: { code: 'CONFLICT' },
  });
}

function requireAuth(ctx: Context): string {
  if (!ctx.userId) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return ctx.userId;
}

function toEventShape(doc: {
  _id: unknown;
  title: string;
  description: string;
  price: number;
  date: Date;
  owner: unknown;
}) {
  return {
    _id: String(doc._id),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    date: new Date(doc.date).toISOString(),
    owner: String(doc.owner),
  };
}

export const resolvers = {
  Query: {
    events: async (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      const docs = await EventModel.find({ owner: ctx.userId }).sort({ date: 1 });
      return docs.map(toEventShape);
    },
    event: async (_: unknown, args: { id: string }, ctx: Context) => {
      const userId = requireAuth(ctx);
      const doc = await EventModel.findOne({ _id: requireObjectId(args.id), owner: userId });
      if (!doc) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return toEventShape(doc);
    },
    me: (_: unknown, __: unknown, ctx: Context) => ctx.userId,
  },
  Mutation: {
    register: async (_: unknown, args: { email: string; password: string }) => {
      const parsed = credentialsSchema.safeParse(args);
      if (!parsed.success) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const existing = await UserModel.findOne({ email: parsed.data.email });
      if (existing) throw emailConflict();
      try {
        const user = await new UserModel({
          email: parsed.data.email,
          passwordHash: await hashPassword(parsed.data.password),
        }).save();
        return { token: signToken(String(user._id)) };
      } catch (error) {
        if (isDuplicateKeyError(error)) throw emailConflict();
        throw error;
      }
    },
    login: async (_: unknown, args: { email: string; password: string }) => {
      const parsed = credentialsSchema.safeParse(args);
      if (!parsed.success) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const user = await UserModel.findOne({ email: parsed.data.email });
      if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return { token: signToken(String(user._id)) };
    },
    createEvent: async (_: unknown, args: { eventInput: unknown }, ctx: Context) => {
      const userId = requireAuth(ctx);
      const parsed = eventInputSchema.safeParse(args.eventInput);
      if (!parsed.success) {
        throw new GraphQLError('Invalid event input', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const doc = await new EventModel({
        ...parsed.data,
        date: new Date(parsed.data.date),
        owner: userId,
      }).save();
      return toEventShape(doc);
    },
    updateEvent: async (_: unknown, args: { id: string; eventInput: unknown }, ctx: Context) => {
      const userId = requireAuth(ctx);
      const parsed = eventInputSchema.safeParse(args.eventInput);
      if (!parsed.success) {
        throw new GraphQLError('Invalid event input', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const doc = await EventModel.findOneAndUpdate(
        { _id: requireObjectId(args.id), owner: userId },
        {
          $set: {
            ...parsed.data,
            date: new Date(parsed.data.date),
          },
        },
        { new: true, runValidators: true },
      );
      if (!doc) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return toEventShape(doc);
    },
    deleteEvent: async (_: unknown, args: { id: string }, ctx: Context) => {
      const userId = requireAuth(ctx);
      const doc = await EventModel.findOneAndDelete({
        _id: requireObjectId(args.id),
        owner: userId,
      });
      if (!doc) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return true;
    },
  },
};
