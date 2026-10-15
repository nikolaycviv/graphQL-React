import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  CREATE_EVENT_MUTATION,
  DELETE_EVENT_MUTATION,
  EVENTS_QUERY,
  type EventItem,
} from './graphql';

export function Events() {
  const { data, loading, error, refetch } = useQuery<{ events: EventItem[] }>(EVENTS_QUERY);
  const [createEvent, { loading: creating, error: createError }] =
    useMutation(CREATE_EVENT_MUTATION);
  const [deleteEvent, { loading: deleting, error: deleteError }] =
    useMutation(DELETE_EVENT_MUTATION);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [date, setDate] = useState(() => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours(),
    )}:${pad(now.getMinutes())}`;
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createEvent({
        variables: {
          input: {
            title,
            description,
            price: Number(price),
            date: new Date(date).toISOString(),
          },
        },
      });
      setTitle('');
      setDescription('');
      setPrice('0');
      await refetch();
    } catch {
      // Apollo exposes mutation and query failures below.
    }
  }

  async function remove(id: string) {
    try {
      await deleteEvent({ variables: { id } });
      await refetch();
    } catch {
      // Apollo exposes mutation and query failures below.
    }
  }

  if (loading) return <p>Loading events…</p>;
  if (error) return <p style={{ color: 'red' }}>Failed to load events: {error.message}</p>;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <h2>New event</h2>
        {createError && <p style={{ color: 'red' }}>Failed to create event: {createError.message}</p>}
        {deleteError && <p style={{ color: 'red' }}>Failed to delete event: {deleteError.message}</p>}
        <input
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          required
        />
        <input
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          required
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit" disabled={creating}>
          {creating ? 'Creating…' : 'Create event'}
        </button>
      </form>

      <div>
        <h2>Events ({data?.events.length ?? 0})</h2>
        {(data?.events.length ?? 0) === 0 && <p>No events yet.</p>}
        <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
          {data?.events.map((ev) => (
            <li key={ev._id} style={{ border: '1px solid #ccc', padding: 8 }}>
              <strong>{ev.title}</strong> — ${ev.price} — {new Date(ev.date).toLocaleString()}
              <br />
              {ev.description}
              <br />
              <button onClick={() => void remove(ev._id)} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
