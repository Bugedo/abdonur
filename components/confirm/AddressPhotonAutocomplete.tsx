'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type PhotonFeature = {
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    postcode?: string;
    state?: string;
  };
};

type PhotonResponse = { features?: PhotonFeature[] };

/** Photon: lang=es no soportado (API devuelve error sin features). */

const CORDOBA_BBOX = '-64.47,-31.62,-63.88,-31.26';

function isPointCoords(c: unknown): c is [number, number] {
  return Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number';
}

function labelFromFeature(f: PhotonFeature): string {
  const p = f.properties;
  const streetLine = [p.street, p.housenumber].filter(Boolean).join(' ');
  const locality = [p.city || p.district, p.postcode, p.state].filter(Boolean).join(', ');
  if (p.name && !streetLine) return [p.name, locality].filter(Boolean).join(', ');
  if (streetLine) return [streetLine, locality].filter(Boolean).join(', ');
  return [p.name, locality].filter(Boolean).join(', ') || 'Ubicación';
}

interface AddressPhotonAutocompleteProps {
  id: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onPlaceResolved: (lat: number, lng: number, label: string) => void;
  onPlaceCleared: () => void;
  onChangeAddress: (v: string) => void;
}

export default function AddressPhotonAutocomplete({
  id,
  value,
  disabled,
  placeholder,
  onPlaceResolved,
  onPlaceCleared,
  onChangeAddress,
}: AddressPhotonAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const url =
        `https://photon.komoot.io/api?q=${encodeURIComponent(q)}` +
        `&limit=8&bbox=${encodeURIComponent(CORDOBA_BBOX)}`;
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) throw new Error('Photon error');
      const data = (await res.json()) as PhotonResponse;
      setResults(
        (Array.isArray(data.features) ? data.features : []).filter(
          (f): f is PhotonFeature =>
            f.geometry?.type === 'Point' && isPointCoords(f.geometry.coordinates)
        )
      );
    } catch {
      if (!ac.signal.aborted) setResults([]);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open && value.trim().length < 3) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void fetchSuggestions(value), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions, open]);

  useEffect(() => {
    function onDoc(ev: MouseEvent) {
      if (!containerRef.current?.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        autoComplete="street-address"
        onChange={(e) => {
          onPlaceCleared();
          onChangeAddress(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-metallic-500/20 bg-surface-700/90 px-4 py-3 text-[#e0e0e0] placeholder:text-stone-600 focus:border-metallic-400/50 focus:outline-none focus:ring-2 focus:ring-metallic-400/25"
        required={!disabled}
      />
      {loading && (
        <p className="mt-1 text-xs text-stone-500">Buscando direcciones...</p>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-metallic-500/30 bg-surface-900 py-1 text-sm shadow-lg">
          {results.map((f, idx) => {
            const [lng, lat] = f.geometry.coordinates;
            const label = labelFromFeature(f);
            return (
              <li key={`${lng}-${lat}-${idx}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-stone-200 hover:bg-brand-900/40"
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => {
                    onPlaceResolved(lat, lng, label);
                    onChangeAddress(label);
                    setResults([]);
                    setOpen(false);
                  }}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-[11px] leading-snug text-stone-600">
        Búsqueda de dirección:{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="text-metallic-500 underline hover:text-metallic-400"
        >
          © OpenStreetMap contributors
        </a>
        , servicio Photon (Komoot).
      </p>
    </div>
  );
}
