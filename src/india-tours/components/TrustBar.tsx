import { Check, Compass, Headset, MapPinned } from 'lucide-react';

const trustSignals = [
  { icon: Compass, title: 'Established 2014', detail: 'A decade of travel experience' },
  { icon: MapPinned, title: 'India-led planning', detail: 'Local knowledge, personal care' },
  { icon: Check, title: 'Clear before you book', detail: 'Details and terms confirmed first' },
  { icon: Headset, title: 'A real team to talk to', detail: 'Personal support from enquiry onwards' },
];

const TrustBar = () => (
  <section className="border-y border-forest/10 bg-white" aria-label="About Travel4Life">
    <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y divide-forest/10 px-5 sm:px-8 md:grid-cols-4 md:divide-y-0 lg:px-12">
      {trustSignals.map(({ icon: Icon, title, detail }) => (
        <div className="flex min-h-[94px] items-center gap-3 px-3 py-5 sm:px-6" key={title}>
          <Icon className="h-5 w-5 shrink-0 text-champagne-dark" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold tracking-wide text-forest-dark">{title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TrustBar;
