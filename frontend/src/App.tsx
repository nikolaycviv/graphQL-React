import { useState } from 'react';
import { Auth } from './Auth';
import { Events } from './Events';

export function App() {
  const [authed, setAuthed] = useState(() => Boolean(localStorage.getItem('token')));

  function logout() {
    localStorage.removeItem('token');
    setAuthed(false);
  }

  return (
    <main style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 720 }}>
      <h1>Events GraphQL</h1>
      {!authed ? (
        <Auth onAuth={() => setAuthed(true)} />
      ) : (
        <>
          <button onClick={logout}>Logout</button>
          <Events />
        </>
      )}
    </main>
  );
}
