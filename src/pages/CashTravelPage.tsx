import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Landmark,
  Plane,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const overviewCards = [
  {
    icon: Banknote,
    title: 'Cash and documentation',
    text: 'Cash may be used for some travel-service payments, but proper receipts, identity proof and tax compliance matter more than the payment method alone.',
  },
  {
    icon: Plane,
    title: 'Airline counters',
    text: 'Airport and airline office payment options vary by airline, route, and ticket type, so check official channels before relying on cash at the counter.',
  },
  {
    icon: ShieldCheck,
    title: 'PAN, GST and TCS',
    text: 'Tax obligations generally depend on the underlying transaction, the nature of the service, and the institution making the booking rather than the cash format alone.',
  },
];

const faqItems = [
  {
    question: 'Can I pay a travel agent in cash for an international trip?',
    answer: 'Cash can sometimes be used for local, documented travel services, but travellers should insist on a clear invoice, payment acknowledgement, identity proof, and a legitimate booking trail. The safer standard is to use official booking channels or bank-backed payments wherever the provider requires them.',
  },
  {
    question: 'Is PAN required for cash flight booking?',
    answer: 'PAN and KYC expectations depend on the transaction, ticketing workflow, and applicable tax rules. For airline or travel-company bookings, it is common for providers to request KYC, payer identity, and documentation for large-value or regulated transactions. If a booking is being made in cash, ask the provider which identity and tax records they require before paying.',
  },
  {
    question: 'What are the standard limits or reporting rules for cash travel payments?',
    answer: 'General Indian tax and reporting rules are based on the transaction type, the value involved, and the documentation trail. The safest guidance is to keep receipts, avoid undeclared or split cash arrangements, and confirm the exact rules with the airline, agency, or tax advisor for the specific service you are buying.',
  },
  {
    question: 'What if I want to buy an international ticket with cash at the airport or airline office?',
    answer: 'Some airlines and airport counters may accept cash for certain transactions, but counter availability, payment limits, refund rules, and accepted documents can differ by airline and city. Always verify with the airline’s official office or website before arriving with cash so you do not lose time or face a rejected booking.',
  },
  {
    question: 'Can I pay for a business-class or honeymoon package in cash?',
    answer: 'It may be possible for some service or package components, but providers often ask for a proper invoice, traveller details, and compliance paperwork. For large-value bookings, especially international or premium travel, a documented payment trail is usually the better and safer option.',
  },
  {
    question: 'What should I ask for to protect myself when paying a travel agent in cash?',
    answer: 'Request a written quotation, booking confirmation, receipt, traveller names, invoice or cash acknowledgment, and the contact details of the agency. Do not rely on a verbal promise alone. Keep copies of the payment proof and any passport or visa documents tied to the booking.',
  },
  {
    question: 'Should I split payments or use multiple cash transactions to avoid a reporting threshold?',
    answer: 'No. Splitting or structuring payments to avoid documentation or tax rules is not a compliant approach. A proper paper trail, a clear invoice, and transparent bookings are the right way to handle legitimate travel spending.',
  },
  {
    question: 'What happens if there is no bill or invoice?',
    answer: 'A missing invoice makes it harder to prove the booking, the payment, and the service received. For travel bookings, a proper invoice or receipt is important for refunds, visa documentation, and any tax or reconciliation questions that may arise later.',
  },
  {
    question: 'Can I use cash for hotel or overseas travel deposits?',
    answer: 'Hotel deposit arrangements vary by property, destination and booking channel. Some hotels accept deposits only through bank transfer, card payment, or approved methods. Always confirm the official deposit policy and request written confirmation before sending cash.',
  },
  {
    question: 'How do I handle airport excess baggage, upgrades, or last-minute changes?',
    answer: 'Airport upgrades and ancillary fees are often handled at the airline counter, and payment methods can vary. Check the airline’s published counter payment policy before coming to the airport, especially for cash, card, or debit-only transactions.',
  },
];

const checklist = [
  'Confirm the airline or agency’s official payment policy before arriving with cash.',
  'Ask for a receipt, invoice or written booking acknowledgment.',
  'Carry passport, PAN and any KYC information the provider may require.',
  'Avoid split or undocumented cash arrangements; keep the record transparent.',
  'Keep a copy of the confirmation and payment proof for flights, visas or refunds.',
];

const airportPoints = [
  'Airport counter cash acceptance is not universal and may be restricted to selected routes or payment types.',
  'Airline office timings, location and payment rules differ for domestic and international bookings.',
  'Refunds, fare differences and baggage charges may follow the airline’s published policy rather than a travel agency’s informal arrangement.',
  'If you are buying a ticket at a counter, always ask for the exact amount, payment receipt and the final booking reference.',
];

export const CashTravelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.18),_transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
              Travel payment guide
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Cash payments, PAN, TCS and airport counter bookings explained clearly
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-200">
              This guide helps travellers understand the legitimate, documented way to handle cash, airport counter bookings, invoice requirements, and tax-sensitive international travel payments without relying on opaque or non-compliant shortcuts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  window.location.hash = 'help';
                }}
              >
                Back to help center
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white hover:text-slate-900"
                onClick={() => {
                  window.location.hash = 'home';
                }}
              >
                Explore Travel4life
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {overviewCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-xl bg-sky-100 p-3 text-sky-700">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Compliance reminder
            </div>
            <h2 className="text-3xl font-bold text-slate-900">General guidance for cash-heavy travel questions</h2>
            <p className="mt-4 leading-7 text-slate-700">
              Travel bookings and payments can involve airline policies, agency contracts, KYC requirements, and tax-related documentation. The safer approach is always to use official booking channels, confirm the exact payment method with the airline or agency, and keep written proof of each transaction. Cash is not a substitute for a proper booking trail.
            </p>
            <div className="mt-8 space-y-4">
              {checklist.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">✓</span>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
              <Landmark className="h-4 w-4" />
              Quick rules
            </div>
            <ul className="space-y-4 text-sm leading-6 text-slate-200">
              <li>• Acceptable payment methods usually depend on the provider, ticket type, booking channel and the nature of the service.</li>
              <li>• PAN, KYC and invoice requests are often tied to compliance, refunds, and tax/accounting needs.</li>
              <li>• Cash is not a reason to avoid a proper booking record, receipt or traveller documentation.</li>
              <li>• Airport counters may accept certain payments, but airline policy and timing must be checked in advance.</li>
            </ul>
          </aside>
        </section>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-sky-700" />
            <h2 className="text-3xl font-bold text-slate-900">Airport and airline counter cash rules</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {airportPoints.map((point) => (
              <div key={point} className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                {point}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-600">
            For last-minute international travel, changes, upgrades, excess baggage or airport-only transactions, the airline’s own rules are the governing source. If the airline office or counter does not publish cash acceptance, do not assume the service is available. Always request the exact payment method and booking reference before making a cash payment.
          </p>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-slate-900">Frequently asked questions</h2>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
              Search intent coverage
            </span>
          </div>

          <div className="space-y-4">
            {faqItems.map(({ question, answer }) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-600 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Need a documented, safer booking path?</h2>
              <p className="mt-2 max-w-2xl text-sm text-sky-50">
                Travel4life can help you compare official booking options, receipts and service expectations before you commit to a travel payment method.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-sky-700 hover:bg-sky-50"
              onClick={() => {
                window.location.hash = 'home';
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
            >
              Start your enquiry <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};
