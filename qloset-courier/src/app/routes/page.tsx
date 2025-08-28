export default function RoutesPage() {
  const routes = [
    { id: 'R1', stops: 5 },
    { id: 'R2', stops: 3 }
  ];
  return (
    <main style={{ padding: 16 }}>
      <h2>My Routes (stub)</h2>
      <ul>
        {routes.map(r => <li key={r.id}>{r.id} — {r.stops} stops</li>)}
      </ul>
    </main>
  );
}
