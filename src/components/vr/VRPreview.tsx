import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import type { Trip } from '../../types';
import { getTripRouteMapPoints, getTripRouteStops } from '../../utils/tripRoute.mjs';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface VRPreviewProps {
  trip: Trip;
  onClose: () => void;
}

export const VRPreview: React.FC<VRPreviewProps> = ({ trip, onClose }) => {
  const stops = useMemo(() => getTripRouteStops(trip), [trip]);
  const points = useMemo(() => getTripRouteMapPoints(stops), [stops]);
  const [activeStop, setActiveStop] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const selectedStop = stops[activeStop];
  const hasMap = points.length === stops.length && stops.length >= 2;
  const routePath = points.map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const visibleRoutePath = points
    .slice(0, activeStop + 1)
    .map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`)
    .join(' ');

  useEffect(() => {
    setActiveStop(0);
    setIsPlaying(false);
  }, [trip.id]);

  useEffect(() => {
    if (!isPlaying || stops.length < 2) return undefined;

    if (activeStop >= stops.length - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setActiveStop(activeStop + 1), 2200);
    return () => window.clearTimeout(timer);
  }, [activeStop, isPlaying, stops.length]);

  const selectStop = (index: number) => {
    setActiveStop(index);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (stops.length < 2) return;
    if (activeStop >= stops.length - 1) setActiveStop(0);
    setIsPlaying((playing) => !playing);
  };

  return (
    <Modal isOpen onClose={onClose} title="Trip route preview" maxWidth="max-w-5xl">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{trip.title}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {stops.length > 1
              ? `${stops.length} itinerary stops · Follow the journey in order`
              : 'Explore the destination for this trip'}
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-[#f5f7f4]" aria-label="Trip route map">
          <div className="flex items-start justify-between gap-4 bg-[#17372c] px-4 py-4 text-white sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-100/70">
                {hasMap ? 'Illustrative route · Not to scale' : 'Trip itinerary'}
              </p>
              <p className="mt-1 text-sm font-medium sm:text-base">
                {stops.length > 1 ? stops.map(({ name }) => name).join('  →  ') : selectedStop?.name || trip.destination}
              </p>
            </div>
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
          </div>

          {hasMap ? (
            <div className="relative mx-3 mt-3 overflow-hidden rounded-xl border border-emerald-950/10 bg-[#e7eee7] sm:mx-5 sm:mt-5">
              <svg
                className="block h-56 w-full sm:h-72"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={`Illustrative route map with stops: ${stops.map(({ name }) => name).join(', ')}`}
              >
                <defs>
                  <pattern id="route-map-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#a5b8a9" strokeWidth=".25" opacity=".6" />
                  </pattern>
                  <linearGradient id="trip-route-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#b7791f" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#route-map-grid)" />
                <path d={routePath} fill="none" stroke="#8da394" strokeWidth="1.2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                {visibleRoutePath && (
                  <path d={visibleRoutePath} fill="none" stroke="url(#trip-route-gradient)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                )}
                {points.map(({ x, y, index }) => (
                  <g key={stops[index].id}>
                    {activeStop === index && (
                      <circle cx={x} cy={y} r="5.4" fill="none" stroke="#0f766e" strokeWidth="1" opacity=".65" />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r="3"
                      fill={index <= activeStop ? '#0f766e' : '#f8faf8'}
                      stroke="#17372c"
                      strokeWidth="1.2"
                    />
                    <text x={x} y={y + 1} textAnchor="middle" fontSize="2.7" fontWeight="700" fill={index <= activeStop ? '#fff' : '#17372c'}>
                      {index + 1}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div className="mx-3 mt-3 rounded-xl border border-dashed border-emerald-900/20 bg-white/70 px-4 py-6 text-sm leading-6 text-gray-600 sm:mx-5 sm:mt-5 sm:px-6">
              {stops.length === 0
                ? 'Route stops have not been added for this trip yet.'
                : stops.some(({ coordinates }) => !coordinates)
                  ? 'The trip stops are listed below, but some locations do not have verified map coordinates. Add confirmed city coordinates to show a reliable route map.'
                  : 'A map route cannot be drawn reliably for these locations. The stops are listed below in itinerary order.'}
            </div>
          )}

          <div className="px-3 pb-4 pt-3 sm:px-5 sm:pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-700" aria-live="polite" aria-atomic="true">
                {selectedStop
                  ? `Stop ${activeStop + 1} of ${stops.length}: ${selectedStop.name}`
                  : 'No itinerary stops available'}
              </p>
              {stops.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    aria-label="Previous stop"
                    onClick={() => selectStop(Math.max(activeStop - 1, 0))}
                  >
                    <SkipBack className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    icon={isPlaying ? Pause : Play}
                    aria-label={isPlaying ? 'Pause route playback' : 'Play route'}
                    onClick={togglePlayback}
                  >
                    {isPlaying ? 'Pause' : activeStop === stops.length - 1 ? 'Replay route' : 'Play route'}
                  </Button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    aria-label="Next stop"
                    onClick={() => selectStop(Math.min(activeStop + 1, stops.length - 1))}
                  >
                    <SkipForward className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    aria-label="Restart route"
                    onClick={() => {
                      setActiveStop(0);
                      setIsPlaying(false);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            {stops.length > 1 && (
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-label="Route playback progress"
                aria-valuemin={1}
                aria-valuemax={stops.length}
                aria-valuenow={activeStop + 1}
              >
                <div
                  className="h-full rounded-full bg-emerald-700 transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${((activeStop + 1) / stops.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </section>

        {stops.length > 0 && (
          <ol className="grid gap-2 sm:grid-cols-2" aria-label="Trip stops in itinerary order">
            {stops.map((stop, index) => (
              <li key={stop.id}>
                <button
                  type="button"
                  aria-current={activeStop === index ? 'step' : undefined}
                  onClick={() => selectStop(index)}
                  className={`flex min-h-14 w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                    activeStop === index ? 'border-emerald-700 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">{stop.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-600">
                      {[stop.state, stop.country].filter(Boolean).join(', ')}
                      {stop.nights ? `${stop.state || stop.country ? ' · ' : ''}${stop.nights} ${stop.nights === 1 ? 'night' : 'nights'}` : ''}
                      {!stop.coordinates ? `${stop.state || stop.country || stop.nights ? ' · ' : ''}Map location not confirmed` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}

        <p className="text-xs leading-5 text-gray-500">
          Route is illustrative and connects the listed stops in itinerary order; it is not a navigation route. Travel times, transport, and stop sequence should be confirmed with the trip host.
        </p>
      </div>
    </Modal>
  );
};
