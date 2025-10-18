import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServices } from '@buenobrows/shared/firestoreActions';
import type { Service } from '@buenobrows/shared/types';
import { Link } from 'react-router-dom';


export default function ServicesPage() {
  const { db } = useFirebase();
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
    <section className="grid gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl mb-2">Services</h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">Explore our offerings. Prices reflect current rates; your booked price is saved at confirmation.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="border rounded-lg px-4 py-3 text-base flex-1 min-w-0"
            placeholder="Search services…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search services"
          />
          <select className="border rounded-lg px-4 py-3 text-base min-w-[140px]" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((s) => (
          <article key={s.id} className="bg-white rounded-xl shadow-soft p-5 md:p-6 flex flex-col">
            <header className="mb-3">
              <div className="text-sm text-slate-500 mb-1">{s.category || 'Service'}</div>
              <h3 className="font-medium text-lg md:text-xl">{s.name}</h3>
            </header>
            <p className="text-base text-slate-600 min-h-[3rem] leading-relaxed">{s.description || 'Beautiful brows, tailored to you.'}</p>
            <div className="mt-4 text-base text-slate-700">Duration: {s.duration} min</div>
            <div className="mt-1 text-terracotta font-semibold text-lg">${s.price.toFixed(2)}</div>
            <div className="mt-auto pt-4">
              <Link to="/book" className="inline-block bg-terracotta text-white rounded-lg px-4 py-3 text-base font-medium hover:bg-terracotta/90 transition-colors">Book this</Link>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="text-slate-500 text-base col-span-full text-center py-8">No services match your search. Try clearing filters.</div>
        )}
      </div>
    </section>
  );
}
