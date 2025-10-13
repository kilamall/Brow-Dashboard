import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="grid md:grid-cols-2 gap-6 items-center">
      <div>
        <h1 className="font-serif text-4xl text-terracotta mb-3">Refined. Natural. You.</h1>
        <p className="text-slate-600 mb-4">
          Filipino-inspired beauty studio specializing in brows & lashes. Thoughtfully scheduled, never rushed.
        </p>
        <div className="flex gap-3">
          <Link to="/book" className="bg-terracotta text-white rounded-md px-4 py-2">Book now</Link>
          <Link to="/services" className="border rounded-md px-4 py-2">See services</Link>
        </div>
      </div>

      {/* Floral framed hero placeholder */}
      <div className="relative bg-white rounded-2xl shadow-soft h-64 grid place-items-center overflow-hidden">
        <span className="text-slate-400">Hero image / floral frame (TBD)</span>
        <div className="pointer-events-none absolute inset-0">
          {/* subtle corner accents */}
          <div className="absolute -top-3 -left-3 w-24 h-24 rounded-full bg-terracotta/5" />
          <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-gold/10" />
        </div>
      </div>

      {/* Reviews anchor (skeleton) */}
      <div id="reviews" className="md:col-span-2 mt-8">
        <h2 className="font-serif text-2xl mb-2">What clients say</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-soft p-4 text-sm text-slate-700">
              <p>“Beautiful, natural results. Booking was easy and I felt cared for.”</p>
              <div className="mt-2 text-xs text-slate-500">— Happy client</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
