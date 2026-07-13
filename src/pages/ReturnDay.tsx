import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, HelpCircle, ClipboardCheck, DollarSign } from 'lucide-react';
import { useAthletes } from '../context/AthletesContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useSportsAccess } from '../hooks/useSportsAccess';
import { useActiveSport } from '../context/SportContext';
import { relativeDueDate } from '../utils/dates';
import type { Sport } from '../data/types';

const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ReturnDay() {
  const { user } = useAuth();
  const { accessibleSports } = useSportsAccess();
  const { athletes, resolveIssuedItem, unresolveIssuedItem } = useAthletes();
  const { items: inventoryItems, returnItem, issueItem } = useInventory();
  const isManager = user?.role === 'manager';

  const { activeSport, setActiveSport } = useActiveSport();
  // Return Day works one team at a time — 'All Sports' falls back to the first team
  const sport: Sport | '' = activeSport !== 'All Sports' ? activeSport : ((accessibleSports[0] as Sport) ?? '');

  const roster = useMemo(
    () =>
      athletes
        .filter((a) => sport && a.sports.includes(sport as Sport))
        .sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [athletes, sport]
  );

  // Outstanding = issued, not yet closed out
  const outstandingByAthlete = roster
    .map((a) => ({ athlete: a, items: a.issuedItems.filter((i) => !i.returned) }))
    .filter((e) => e.items.length > 0);

  // Owes list = anything closed out as missing or damaged (whole roster, all time)
  const owes = roster
    .map((a) => ({
      athlete: a,
      items: a.issuedItems.filter((i) => i.resolution === 'missing' || i.resolution === 'damaged'),
    }))
    .filter((e) => e.items.length > 0)
    .map((e) => ({ ...e, total: e.items.reduce((s, i) => s + i.qty * i.pricePerUnit, 0) }));
  const owesGrandTotal = owes.reduce((s, e) => s + e.total, 0);

  const totalOutstanding = outstandingByAthlete.reduce((s, e) => s + e.items.length, 0);
  const totalResolvedToday = roster.reduce(
    (s, a) => s + a.issuedItems.filter((i) => i.resolution).length,
    0
  );

  const [lastAction, setLastAction] = useState<{ athleteId: string; itemId: string; description: string; resolution: string; qty: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resolve(athleteId: string, itemId: string, resolution: 'returned' | 'missing' | 'damaged', qty: number, description: string) {
    resolveIssuedItem(athleteId, itemId, resolution);
    if (resolution === 'returned') {
      // Restock — issued records may reference either the row id or the human item #
      const inv = inventoryItems.find((i) => i.id === itemId || i.itemId === itemId);
      if (inv) returnItem(inv.id, qty);
    }
    setLastAction({ athleteId, itemId, description, resolution, qty });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setLastAction(null), 6000);
  }

  function undo() {
    if (!lastAction) return;
    unresolveIssuedItem(lastAction.athleteId, lastAction.itemId);
    if (lastAction.resolution === 'returned') {
      // Take the restocked quantity back out of inventory
      const inv = inventoryItems.find((i) => i.id === lastAction.itemId || i.itemId === lastAction.itemId);
      if (inv) issueItem(inv.id, lastAction.qty);
    }
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setLastAction(null);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4 block" style={{ color: '#00539F' }}>
          Return Day
        </span>
        <p className="text-sm text-gray-500 mt-2">
          Check gear back in as athletes come through. Mark each item returned, damaged, or missing — charges build the owes list automatically.
        </p>
      </div>

      {/* Sport picker + progress */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <select
          value={sport}
          onChange={(e) => setActiveSport(e.target.value as Sport)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#00539F] md:w-64"
        >
          {accessibleSports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClipboardCheck className="w-4 h-4 text-[#00539F]" />
          {totalOutstanding} item{totalOutstanding !== 1 ? 's' : ''} still out · {totalResolvedToday} closed
        </div>
      </div>

      {/* Athlete checklist */}
      {outstandingByAthlete.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">All gear is accounted for.</p>
          <p className="text-xs text-gray-400 mt-1">No outstanding items for this sport.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {outstandingByAthlete.map(({ athlete, items }) => (
            <div key={athlete.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <Link to={`/athletes/${athlete.id}`} className="font-semibold text-sm text-[#00539F] hover:underline">
                  {athlete.lastName}, {athlete.firstName}
                </Link>
                <span className="text-xs text-gray-400">{athlete.year} · {items.length} item{items.length !== 1 ? 's' : ''} out</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <div key={`${item.itemId}-${idx}`} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty {item.qty} · issued {item.issuedDate} · {money(item.qty * item.pricePerUnit)}
                        {item.returnByDate && (() => {
                          const d = relativeDueDate(item.returnByDate);
                          return (
                            <span className={`ml-1.5 font-medium ${d.overdue ? 'text-red-500' : 'text-gray-500'}`}>
                              {d.label}
                            </span>
                          );
                        })()}
                      </p>
                    </div>
                    {isManager && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => resolve(athlete.id, item.itemId, 'returned', item.qty, item.description)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200 active:bg-green-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Returned
                        </button>
                        <button
                          onClick={() => resolve(athlete.id, item.itemId, 'damaged', item.qty, item.description)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 active:bg-amber-100"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Damaged
                        </button>
                        <button
                          onClick={() => resolve(athlete.id, item.itemId, 'missing', item.qty, item.description)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 active:bg-red-100"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> Missing
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Owes list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" /> Owes List
        </h2>
        <p className="text-xs text-gray-400 mb-4">Missing and damaged gear, charged at replacement cost.</p>
        {owes.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing owed — clean slate.</p>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {owes.map(({ athlete, items, total }) => (
                <div key={athlete.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <Link to={`/athletes/${athlete.id}`} className="text-sm font-semibold text-[#00539F] hover:underline">
                      {athlete.lastName}, {athlete.firstName}
                    </Link>
                    <span className="text-sm font-bold text-gray-800">{money(total)}</span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {items.map((i, idx) => (
                      <li key={`${i.itemId}-${idx}`} className="text-xs text-gray-500 flex items-center justify-between">
                        <span>
                          {i.description} × {i.qty}
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${i.resolution === 'missing' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                            {i.resolution}
                          </span>
                        </span>
                        <span>{money(i.qty * i.pricePerUnit)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-1">
              <span className="text-sm font-semibold text-gray-700">Total owed</span>
              <span className="text-lg font-bold text-[#002855]">{money(owesGrandTotal)}</span>
            </div>
          </>
        )}
      </div>
      {/* Undo toast */}
      {lastAction && (
        <div className="fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[95] bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 md:min-w-[340px]">
          <span className="flex-1 truncate">
            {lastAction.description} marked <span className="font-semibold">{lastAction.resolution}</span>
          </span>
          <button onClick={undo} className="font-bold text-[#FFD200] shrink-0 px-2 py-1 -m-1 active:opacity-70">
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
