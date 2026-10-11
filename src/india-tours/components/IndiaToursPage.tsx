import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { INDIA_JOURNEY_CONCEPTS } from '../catalog.mjs';
import { trackContactEvent } from '../../utils/analytics';
import { getTravel4LifeContactContext } from '../../utils/travel4lifeContact.js';
import Header from './Header';
import Hero from './Hero';
import RouteMap from './RouteMap';
import TourGrid from './TourGrid';
import TripDesignerWizard from './TripDesignerWizard';
import TrustBar from './TrustBar';
import { REGIONS, type Journey, type RegionCode } from './types';

const defaultJourney = INDIA_JOURNEY_CONCEPTS.find(({ id }) => id === 'golden-triangle');
if (!defaultJourney) throw new Error('The India tour catalogue must include the Golden Triangle route concept.');

const IndiaToursPage = () => {
  const [journey, setJourney] = useState<Journey>(defaultJourney);
  const [region, setRegion] = useState<RegionCode>('US');

  useEffect(() => {
    void trackContactEvent('india_tours_page_view', getTravel4LifeContactContext({
      pageType: 'india-tours',
      destination: 'India',
      country: REGIONS.US.country,
      package: defaultJourney.name,
      entity: defaultJourney.id,
    }));
  }, []);

  const updateRegion = (nextRegion: RegionCode) => {
    setRegion(nextRegion);
    void trackContactEvent('country_market_select', getTravel4LifeContactContext({
      pageType: 'india-tours',
      destination: 'India',
      country: REGIONS[nextRegion].country,
      package: journey.name,
      entity: journey.id,
    }));
  };

  const selectJourney = (nextJourney: Journey) => {
    setJourney(nextJourney);
    void trackContactEvent('itinerary_select', getTravel4LifeContactContext({
      pageType: 'india-tours',
      destination: 'India',
      country: REGIONS[region].country,
      package: nextJourney.name,
      entity: nextJourney.id,
    }));
  };

  return (
    <div className="min-h-screen bg-paper text-[#182722]">
      <Header region={region} onRegionChange={updateRegion} />
      <main>
        <Hero />
        <TrustBar />
        <TourGrid selectedJourneyId={journey.id} onSelectJourney={selectJourney} />
        <RouteMap journey={journey} onPlanJourney={() => document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' })} />
        <TripDesignerWizard journey={journey} region={region} />
        <section className="bg-[#f3f0e8] px-5 py-14 text-center sm:px-8">
          <p className="font-serif text-2xl text-forest-dark sm:text-3xl">The most memorable journeys begin with a conversation.</p>
          <a className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest underline decoration-champagne underline-offset-4" href="#plan">Start planning <ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>
      </main>
      <footer className="bg-forest-dark px-5 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a className="font-serif text-lg font-semibold" href="/">Travel4Life<span className="ml-1 text-champagne" aria-hidden="true">.</span></a>
          <p className="text-xs text-white/70">Thoughtful travel planning starts with a clear conversation.</p>
          <div className="flex gap-5 text-xs">
            <a className="text-white/80 underline underline-offset-4 hover:text-white" href="/india-tours/" aria-current="page">India journeys</a>
            <a className="text-white/80 underline underline-offset-4 hover:text-white" href="/#privacy">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndiaToursPage;
