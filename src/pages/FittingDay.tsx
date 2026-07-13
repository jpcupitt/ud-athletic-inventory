import { useMemo, useState } from 'react';
import { CheckCircle2, Shirt, X, Users } from 'lucide-react';
import { useAthletes } from '../context/AthletesContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useSportsAccess } from '../hooks/useSportsAccess';
import { useActiveSport } from '../context/SportContext';
import type { Athlete, Sport } from '../data/types';

export default function FittingDay() {
  const { user } = useAuth();
  const { accessibleSports } = useSportsAccess();
  const { athletes, issueToAthlete } = useAthletes();
  const { items: inventoryItems, archivedIds, issueItem } = useInventory();
  const isManager = user?.role === 'manager';

  const { activeSport, setActiveSport } = useActiveSport();
  // Fitting Day works one team at a time — 'All Sports' falls back to the first team
  const sport: Sport | '' = activeSport !== 'All Sports' ? activeSport : ((accessibleSports[0] as Sport) ?? '');
  const [kitIds, setKitIds] = useState<Set<string>>(new Set());
  const [outfittedIds, setOutfittedIds] = useState<Set<string>>(new Set());
  const [confirmAthlete, setConfirmAthlete] = useState<Athlete | null>(null);

  const sportItems = useMemo(
    () =>
      inventoryItems.filter(
        (i) => sport && i.sports.includes(sport as Sport) && !archivedIds.has(i.id)
      ),
    [inventoryItems, sport, archivedIds]
  );

  const roster = useMemo(
    () =>
      athletes
        .filter((a) => sport && a.sports.includes(sport as Sport))
        .sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [athletes, sport]
  );

  const kit = sportItems.filter((i) => kitIds.has(i.id));

  function toggleKitItem(id: string) {
    setKitIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeSport(s: Sport) {
    setActiveSport(s);
    setKitIds(new Set());
    setOutfittedIds(new Set());
    setConfirmAthlete(null);
  }

  function issueKit(athlete: Athlete) {
    const today = new Date().toISOString().slice(0, 10);
    const skipped: string[] = [];
    for (const item of kit) {
      if (item.qtyOnHand < 1) {
        skipped.push(item.description);
        continue;
      }
      issueItem(item.id, 1);
      issueToAthlete(athlete.id, {
        itemId: item.id,
        description: item.description,
        qty: 1,
        pricePerUnit: item.pricePerUnit,
        issuedDate: today,
        isNonExpendable: item.isNonExpendable,
        returnByDate: item.returnByDate,
        returned: false,
      });
    }
    setOutfittedIds((prev) => new Set([...prev, athlete.id]));
    setConfirmAthlete(null);
    if (skipped.length) {
      window.alert(`Out of stock, not issued: ${skipped.join(', ')}`);
    }
  }

  const sizeLine = (a: Athlete) =>
    [a.shirtSize && `Shirt ${a.shirtSize}`, a.shortsSize && `Shorts ${a.shortsSize}`, a.shoeSize && `Shoe ${a.shoeSize}`]
      .filter(Boolean)
      .join(' · ') || 'No sizes on file';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4 block" style={{ color: '#00539F' }}>
          Fitting Day
        </span>
        <p className="text-sm text-gray-500 mt-2">
          Build the handout kit once, then walk down the roster — one tap issues the full kit to each athlete.
        </p>
      </div>

      <select
        value={sport}
        onChange={(e) => changeSport(e.target.value as Sport)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#00539F] w-full md:w-64"
      >
        {accessibleSports.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Step 1: the kit */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <Shirt className="w-4 h-4 text-gray-400" /> 1 · Build the kit
        </h2>
        <p className="text-xs text-gray-400 mb-3">Each athlete gets one of every selected item.</p>
        {sportItems.length === 0 ? (
          <p className="text-sm text-gray-400">No inventory items for this sport.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sportItems.map((item) => {
              const active = kitIds.has(item.id);
              const out = item.qtyOnHand < 1;
              return (
                <button
                  key={item.id}
                  disabled={!isManager || out}
                  onClick={() => toggleKitItem(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
                    active
                      ? 'bg-[#00539F] text-white border-[#00539F]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#00539F] hover:text-[#00539F]'
                  }`}
                >
                  {item.description}
                  <span className={`ml-1.5 ${active ? 'text-white/70' : out ? 'text-red-500' : 'text-gray-400'}`}>
                    {item.qtyOnHand} left
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: the roster */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> 2 · Outfit the roster
          </h2>
          <span className="text-xs text-gray-400">{outfittedIds.size} of {roster.length} outfitted</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-gray-100 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FFD200] transition-all"
            style={{ width: roster.length ? `${(outfittedIds.size / roster.length) * 100}%` : 0 }}
          />
        </div>
        {roster.length === 0 ? (
          <p className="text-sm text-gray-400">No athletes on this roster.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roster.map((a) => {
              const done = outfittedIds.has(a.id);
              return (
                <button
                  key={a.id}
                  disabled={!isManager || done || kit.length === 0}
                  onClick={() => setConfirmAthlete(a)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    done
                      ? 'bg-green-50 border-green-200'
                      : kit.length === 0
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 active:border-[#00539F] hover:border-[#00539F]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.lastName}, {a.firstName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{a.year} · {sizeLine(a)}</p>
                  </div>
                  {done && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
        {kit.length === 0 && roster.length > 0 && (
          <p className="text-xs text-amber-600 mt-3">Select at least one kit item above to start outfitting.</p>
        )}
      </div>

      {/* Confirm sheet */}
      {confirmAthlete && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={() => setConfirmAthlete(null)}>
          <div
            className="bg-white w-full rounded-t-2xl md:w-[420px] md:rounded-xl shadow-2xl overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: '#002855' }}>
              <span className="text-white font-semibold text-sm">
                Issue kit to {confirmAthlete.firstName} {confirmAthlete.lastName}
              </span>
              <button onClick={() => setConfirmAthlete(null)} className="text-white hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-2">{sizeLine(confirmAthlete)}</p>
              <ul className="divide-y divide-gray-50 mb-4">
                {kit.map((item) => (
                  <li key={item.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="text-gray-800">{item.description}</span>
                    <span className={`text-xs ${item.qtyOnHand < 1 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {item.qtyOnHand < 1 ? 'out of stock' : '× 1'}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => issueKit(confirmAthlete)}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold bg-[#228B22] hover:bg-[#1a6b1a]"
              >
                Issue {kit.filter((i) => i.qtyOnHand > 0).length} item{kit.filter((i) => i.qtyOnHand > 0).length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
