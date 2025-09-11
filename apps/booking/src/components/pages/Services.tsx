import { useEffect, useMemo, useState } from 'react';
import { initFirebase } from '../../../../packages/shared/src/firebase';
import { watchServices } from '../../../../packages/shared/src/firestoreActions';
import type { Service } from '../../../../packages/shared/src/types';
import { Link } from 'react-router-dom';

const { db } = initFirebase();

export default function ServicesPage() {
  const [rows, setRows] = useState<Service[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All');

  useEffect(() => {
    // Public read is allowed by rules; live updates for simplicity.
    return watchServices(db, { activeOnly: true }, setRows);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((s) => s.category && set.add(s.category));
    return ['All', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((s) => {
      const matchesCat = cat === 'All' || s.category === cat;
      const matchesTerm = !term || s.name.toLowerCase().includes(term) || (s.description || '').toLowerCase().includes(term);
      return matchesCat && matchesTerm;
    });
  }, [rows, q, cat]);

  return (
    <section className="grid gap-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Services</h2>
          <p className="text-slate-600 text-sm">Explore our offerings. Prices reflect current rates; your booked price is saved at confirmation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="border rounded-md p-2 min-w-[200px]"
            placeholder="Search services…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search services"
          />
          <select className="border rounded-md p-2" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <article key={s.id} className="bg-white rounded-xl shadow-soft p-4 flex flex-col">
            <header className="mb-2">
              <div className="text-sm text-slate-500">{s.category || 'Service'}</div>
              <h3 className="font-medium text-lg">{s.name}</h3>
            </header>
            <p className="text-sm text-slate-600 min-h-[2.5rem]">{s.description || 'Beautiful brows, tailored to you.'}</p>
            <div className="mt-3 text-sm text-slate-700">Duration: {s.duration} min</div>
            <div className="mt-1 text-terracotta font-semibold">${s.price.toFixed(2)}</div>
            <div className="mt-auto pt-3">
              <Link to="/book" className="inline-block bg-terracotta text-white rounded-md px-3 py-2">Book this</Link>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="text-slate-500 text-sm">No services match your search. Try clearing filters.</div>
        )}
      </div>
    </section>
  );
}
