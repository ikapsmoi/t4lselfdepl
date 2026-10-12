import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { INDIA_JOURNEY_CONCEPTS } from '../catalog.mjs';
import { trackContactEvent } from '../../utils/analytics';
import { getTravel4LifeContactContext } from '../../utils/travel4lifeContact.js';
import { MobileBottomBar } from '../../components/common/MobileBottomBar';
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

  const goToTripDesigner = () => {
    document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-paper pb-20 text-[#182722] md:pb-0">
      <Header region={region} onRegionChange={updateRegion} />
      <main>
        <Hero onDesignTrip={goToTripDesigner} />
        <section className="border-b border-forest/10 bg-white px-5 py-5 sm:px-8 lg:px-12" aria-label="India trip planning in your language">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-xs text-muted sm:justify-between sm:text-sm">
            <p className="font-semibold text-forest-dark">Plan an India trip in your language</p>
            <nav className="flex flex-wrap justify-center gap-4" aria-label="Choose a language">
              <a className="font-semibold text-forest underline underline-offset-4" href="/india-tours/de/" lang="de">Deutsch · Deutschland</a>
              <a className="font-semibold text-forest underline underline-offset-4" href="/india-tours/fr/" lang="fr">Français · France</a>
              <a className="font-semibold text-forest underline underline-offset-4" href="/india-tours/nl/" lang="nl">Nederlands · Nederland</a>
            </nav>
          </div>
        </section>
        <TrustBar />
        <TourGrid selectedJourneyId={journey.id} onSelectJourney={selectJourney} />
        <RouteMap journey={journey} onPlanJourney={goToTripDesigner} />
        <TripDesignerWizard journey={journey} region={region} />
        <section className="bg-[#f3f0e8] px-5 py-10 text-center sm:px-8 md:py-24">
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
      <MobileBottomBar onClick={goToTripDesigner} />
    </div>
  );
};

export default IndiaToursPage;
