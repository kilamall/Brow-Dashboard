import { Link, useLocation } from 'react-router-dom';

export default function ConfirmationPage() {
  // Optional: read details passed via navigate state
  const { state } = useLocation() as { state?: { when?: string; serviceName?: string } };

  return (
    <section className="grid gap-2">
      <h2 className="text-2xl font-serif text-green-700">Confirmed!</h2>
      <p>Your appointment is booked{state?.serviceName ? ` for ${state.serviceName}` : ''}
        {state?.when ? ` at ${state.when}` : ''}.
      </p>
      <p>We will confirm and email you your booking details.</p>
      <Link to="/" className="text-terracotta underline">Back to home</Link>
    </section>
  );
}
