import { useState } from 'react';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { REGIONS, type RegionCode } from './types';

interface HeaderProps {
  region: RegionCode;
  onRegionChange: (region: RegionCode) => void;
}

const Header = ({ region, onRegionChange }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentRegion = REGIONS[region];

  return (
    <header className="inbound-header sticky top-0 z-50 border-b border-forest/10 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <a className="font-serif text-[1.35rem] font-semibold tracking-tight text-forest-dark" href="/" aria-label="Travel4Life home">
          Travel4Life<span className="ml-1 text-champagne" aria-hidden="true">.</span>
        </a>

        <nav className={`${menuOpen ? 'inbound-nav-open' : 'inbound-nav-closed'} absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-forest/10 bg-paper px-5 py-4 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none`} aria-label="Main navigation">
          <a href="#journeys" onClick={() => setMenuOpen(false)}>Journeys</a>
          <a href="#route" onClick={() => setMenuOpen(false)}>The route</a>
          <a href="#plan" onClick={() => setMenuOpen(false)}>How it works</a>
          <a className="md:hidden" href="#plan" onClick={() => setMenuOpen(false)}>Start planning</a>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <label className="relative flex items-center gap-1.5 text-xs font-semibold text-forest-dark">
            <span className="sr-only">Choose your region and preferred currency</span>
            <select
              className="inbound-region-select appearance-none rounded border border-forest/15 bg-transparent py-2 pl-2 pr-7 text-xs font-semibold text-forest-dark"
              value={region}
              onChange={(event) => onRegionChange(event.target.value as RegionCode)}
              aria-label="Choose your region and preferred currency"
            >
              {Object.entries(REGIONS).map(([code, details]) => (
                <option key={code} value={code}>{code} · {details.currency}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5" aria-hidden="true" />
          </label>
          <a className="hidden items-center gap-2 text-xs font-semibold text-forest-dark lg:flex" href="tel:+919511446642" aria-label={`Call our India travel desk serving ${currentRegion.label} at plus 91 95114 46642`}>
            <Phone size={15} aria-hidden="true" />
            <span>Call · {region}<span className="ml-1.5 font-normal text-muted">+91 95114 46642</span></span>
          </a>
          <a className="inline-flex h-10 w-10 items-center justify-center rounded border border-forest/15 text-forest-dark lg:hidden" href="tel:+919511446642" aria-label={`Call our India travel desk serving ${currentRegion.label} at plus 91 95114 46642`}>
            <Phone size={16} aria-hidden="true" />
          </a>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-forest/15 text-forest-dark md:hidden"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
          <a className="hidden rounded-sm bg-forest px-4 py-3 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-forest-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:inline-flex" href="#plan">
            Start planning
          </a>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">Preferred market: {currentRegion.label}. Preferred currency: {currentRegion.currency}.</p>
    </header>
  );
};

export default Header;
