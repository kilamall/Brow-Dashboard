import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl text-terracotta mb-4">Privacy Policy</h1>
      <p className="text-slate-600 mb-6">Effective date: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6 text-slate-700">
        <section>
          <h2 className="font-semibold text-slate-900 mb-2">Overview</h2>
          <p>
            Bueno Brows ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, and
            protect your information across our website, booking platform, and communications, including SMS messaging.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 mb-2">Information We Collect</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Contact details (name, email, mobile phone number)</li>
            <li>Booking details (services, dates, times, preferences)</li>
            <li>Messages you send to us (including via SMS and chat)</li>
            <li>Technical information (device, browser, and general usage data)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 mb-2">How We Use Your Information</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>To manage appointments and provide requested services</li>
            <li>To send appointment confirmations and reminders</li>
            <li>To provide booking assistance and customer support</li>
            <li>To send optional promotions if you opt in</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 mb-2">SMS Messaging and Consent</h2>
          <p>
            By providing your mobile phone number and opting in, you consent to receive SMS messages from us for
            appointment updates, reminders, support, and optional promotions. Message frequency varies. Message and data
            rates may apply. Reply STOP to opt out at any time, and HELP for help. Consent is not a condition of purchase.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 mb-2">Sharing Policy</h2>
          <p className="font-medium">
            We do not share, sell, or disclose your mobile phone number or SMS opt-in data with third parties or affiliates
            for marketing or promotional purposes.
          </p>
          <p className="mt-2">
            We may share information with service providers who help us operate our business (e.g., messaging platforms,
            booking systems) solely to perform services on our behalf, under confidentiality and data protection
            obligations.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 mb-2">Data Security</h2>
          <p>
            We implement reasonable administrative, technical, and physical safeguards to protect your information.
            Despite our efforts, no method of transmission or storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 mb-2">Your Choices</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>SMS: Reply STOP to unsubscribe; HELP for help</li>
            <li>Email: Use unsubscribe links included in emails</li>
            <li>Bookings: You can contact us to update or delete your information</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900 mb-2">Contact Us</h2>
          <p>
            Questions about this Policy? Contact us at <span className="whitespace-nowrap">(650) 613-8455</span> or visit our{' '}
            <Link to="/" className="text-terracotta underline">home page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}


