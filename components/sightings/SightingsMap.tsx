import dynamic from 'next/dynamic';

/* ── Placeholder shown while Leaflet bundle loads ─────────────────── */

const MapSkeleton: React.FC = () => (
  <div className="bg-gray-900 rounded-xl border border-gray-700 h-[480px] flex flex-col items-center justify-center gap-3 text-gray-500">
    <svg
      className="w-6 h-6 animate-spin text-amber-500/60"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <p className="text-sm">Loading map...</p>
  </div>
);

/* ── Dynamic import — Leaflet requires browser globals ────────────── */

const SightingsMap = dynamic(
  () => import('./SightingsMapInner'),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export default SightingsMap;
