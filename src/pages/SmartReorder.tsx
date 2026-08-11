import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, TrendingDown, Wallet, Ruler } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrdersContext';
import { useAthletes } from '../context/AthletesContext';
import { useAuth } from '../context/AuthContext';
import { useSportsAccess } from '../hooks/useSportsAccess';
import { BUDGET_DATA } from '../data/mock/budgets';
import { getAthleteSizes, defaultSizeFieldFor, sizeSortIndex } from '../utils/sizeChart';
import type { ItemCategory, Order, Sport } from '../data/types';

const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Only these categories have a matching Size Chart field to pull from — an
// Equipment/Headwear/Bag/Accessory item stays a plain flat-quantity suggestion.
const SIZEABLE_CATEGORIES = new Set<ItemCategory>(['Top', 'Bottom', 'Outerwear', 'Footwear']);

interface Suggestion {
  id: string;
  itemId: string;
  sport: Sport;
  baseDescription: string;
  description: string;
  manufacturer: string;
  qtyOnHand: number;
  qtyOnOrder: number;
  suggestedQty: number;
  pricePerUnit: number;
  size?: string;
}

interface SizeMeta {
  field: string;
  availableFields: string[];
  unmatched: number;
  summary: string; // "2 XL, 1 M, 2 L" — exactly what the roster needs, for a quick glance
}

export default function SmartReorder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filterBySports } = useSportsAccess();
  const { items, archivedIds, addOnOrder } = useInventory();
  const { addOrder } = useOrders();
  const { athletes } = useAthletes();
  const isManager = user?.role === 'manager';

  const [threshold, setThreshold] = useState(10);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [qtyOverrides, setQtyOverrides] = useState<Record<string, number>>({});
  const [sizeFieldOverride, setSizeFieldOverride] = useState<Record<string, string>>({});

  // Low stock = on hand + already on order still below the threshold.
  // For clothing/footwear, pull the exact sizes needed from each athlete's Size
  // Chart on that sport's roster instead of guessing a flat quantity.
  const { suggestions, sizeMetaByItem } = useMemo(() => {
    const scoped = filterBySports(
      items.filter((i) => !archivedIds.has(i.id)),
      (i) => i.sports
    );
    const lowStock = scoped.filter((i) => i.qtyOnHand + i.qtyOnOrder < threshold);

    const rows: Suggestion[] = [];
    const metaByItem: Record<string, SizeMeta> = {};

    for (const i of lowStock) {
      const sport = i.sports[0];
      const base = {
        itemId: i.id,
        sport,
        baseDescription: i.description,
        manufacturer: i.manufacturer,
        qtyOnHand: i.qtyOnHand,
        qtyOnOrder: i.qtyOnOrder,
        pricePerUnit: i.pricePerUnit,
      };

      let meta: SizeMeta | null = null;
      if (SIZEABLE_CATEGORIES.has(i.category)) {
        const roster = athletes.filter((a) => a.sports.includes(sport));
        if (roster.length > 0) {
          const fieldSet = new Set<string>();
          roster.forEach((a) => getAthleteSizes(a).forEach((f) => { if (f.label.trim()) fieldSet.add(f.label); }));
          const availableFields = [...fieldSet].sort();
          const guess = defaultSizeFieldFor(i.category);
          const chosenField = sizeFieldOverride[i.id]
            ?? (guess && availableFields.includes(guess) ? guess : availableFields[0]);

          if (chosenField) {
            const counts = new Map<string, number>();
            let unmatched = 0;
            for (const a of roster) {
              const val = getAthleteSizes(a).find((f) => f.label === chosenField)?.value?.trim();
              if (val) counts.set(val, (counts.get(val) ?? 0) + 1);
              else unmatched++;
            }
            if (counts.size > 0) {
              const sortedCounts = [...counts.entries()]
                .map(([size, count]) => ({ size, count }))
                .sort((a, b) => sizeSortIndex(a.size) - sizeSortIndex(b.size));
              meta = {
                field: chosenField,
                availableFields,
                unmatched,
                summary: sortedCounts.map((c) => `${c.count} ${c.size}`).join(', '),
              };
              for (const { size, count } of sortedCounts) {
                rows.push({ ...base, id: `${i.id}::${size}`, description: `${i.description} — ${size}`, size, suggestedQty: count });
              }
            }
          }
        }
      }

      if (meta) {
        metaByItem[i.id] = meta;
      } else {
        rows.push({ ...base, id: i.id, description: i.description, suggestedQty: Math.max(1, threshold * 2 - i.qtyOnHand - i.qtyOnOrder) });
      }
    }

    rows.sort((a, b) => a.qtyOnHand + a.qtyOnOrder - (b.qtyOnHand + b.qtyOnOrder));
    return { suggestions: rows, sizeMetaByItem: metaByItem };
  }, [items, archivedIds, threshold, filterBySports, athletes, sizeFieldOverride]);

  const included = suggestions.filter((s) => !excluded.has(s.id));
  const qtyFor = (s: Suggestion) => qtyOverrides[s.id] ?? s.suggestedQty;
  const lineCost = (s: Suggestion) => qtyFor(s) * s.pricePerUnit;

  // Group by sport for budget context + order creation
  const bySport = useMemo(() => {
    const map = new Map<Sport, Suggestion[]>();
    for (const s of suggestions) {
      const list = map.get(s.sport) ?? [];
      list.push(s);
      map.set(s.sport, list);
    }
    return [...map.entries()];
  }, [suggestions]);

  const grandTotal = included.reduce((sum, s) => sum + lineCost(s), 0);

  function toggle(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function createOrders() {
    const stamp = Date.now().toString().slice(-5);
    let n = 0;
    for (const [sport, lines] of bySport) {
      const selected = lines.filter((l) => !excluded.has(l.id));
      if (selected.length === 0) continue;
      n++;
      // Vendor = the most common manufacturer among the lines
      const counts = new Map<string, number>();
      selected.forEach((l) => counts.set(l.manufacturer, (counts.get(l.manufacturer) ?? 0) + 1));
      const vendor = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const order: Order = {
        id: `reorder-${stamp}-${n}`,
        refNumber: `RO-${stamp}-${n}`,
        orderDate: new Date().toISOString().slice(0, 10),
        vendor,
        sport,
        lines: selected.map((l) => ({ description: l.description, qtyOrdered: qtyFor(l), qtyReceived: 0 })),
        status: 'submitted',
        createdBy: user?.name ?? 'Unknown',
      };
      addOrder(order);
      // Reflect the ordered quantities on inventory so these items drop off the
      // suggestion list and a second tap doesn't duplicate the same order.
      selected.forEach((l) => addOnOrder(l.itemId, qtyFor(l)));
    }
    if (n > 0) navigate('/orders');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4 block" style={{ color: '#00539F' }}>
          Smart Reorder
        </span>
        <p className="text-sm text-gray-500 mt-2">
          Items running low across your sports, with a suggested restock quantity. Clothing and footwear break down by the exact sizes your roster needs, pulled from each athlete's Size Chart. Adjust, untick what you don't need, and submit the rest as orders in one tap.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-[#00539F]" />
          Low-stock threshold
        </label>
        <select
          value={threshold}
          onChange={(e) => { setThreshold(Number(e.target.value)); setQtyOverrides({}); setExcluded(new Set()); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#00539F]"
        >
          {[5, 10, 15, 20].map((t) => (
            <option key={t} value={t}>Under {t} units</option>
          ))}
        </select>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Nothing needs reordering.</p>
          <p className="text-xs text-gray-400 mt-1">No items are below {threshold} units on hand + on order.</p>
        </div>
      ) : (
        <>
          {bySport.map(([sport, lines]) => {
            const budget = BUDGET_DATA.find((b) => b.sport === sport);
            const remaining = budget ? budget.budgeted - budget.spent : null;
            const sportTotal = lines.filter((l) => !excluded.has(l.id)).reduce((s, l) => s + lineCost(l), 0);

            // Rows that share an itemId (a sized item split into XL/M/L/...) render
            // together as one card; everything else renders as today's single row.
            const groups: Suggestion[][] = [];
            const groupIndex = new Map<string, number>();
            for (const l of lines) {
              if (groupIndex.has(l.itemId)) {
                groups[groupIndex.get(l.itemId)!].push(l);
              } else {
                groupIndex.set(l.itemId, groups.length);
                groups.push([l]);
              }
            }

            return (
              <div key={sport} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="font-semibold text-sm text-gray-800">{sport}</span>
                  {remaining !== null && (
                    <span className={`flex items-center gap-1 text-xs ${sportTotal > remaining ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                      <Wallet className="w-3.5 h-3.5" />
                      {money(sportTotal)} of {money(remaining)} budget left
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-50">
                  {groups.map((group) => {
                    if (group.length === 1) {
                      const s = group[0];
                      const on = !excluded.has(s.id);
                      return (
                        <div key={s.id} className={`px-4 py-3 flex items-center gap-3 ${on ? '' : 'opacity-45'}`}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(s.id)}
                            disabled={!isManager}
                            className="w-4 h-4 accent-[#00539F] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{s.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              <span className={s.qtyOnHand < 3 ? 'text-red-500 font-medium' : ''}>{s.qtyOnHand} on hand</span>
                              {s.qtyOnOrder > 0 ? ` + ${s.qtyOnOrder} on order` : ''} · {s.manufacturer} · {money(s.pricePerUnit)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              min={1}
                              value={qtyFor(s)}
                              disabled={!isManager || !on}
                              onChange={(e) =>
                                setQtyOverrides((prev) => ({ ...prev, [s.id]: Math.max(1, parseInt(e.target.value) || 1) }))
                              }
                              className="w-16 border border-gray-200 rounded px-2 py-1.5 text-sm text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                            />
                            <span className="text-xs text-gray-500 w-20 text-right hidden md:block">{money(lineCost(s))}</span>
                          </div>
                        </div>
                      );
                    }

                    const first = group[0];
                    const meta = sizeMetaByItem[first.itemId];
                    return (
                      <div key={first.itemId} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-800">{first.baseDescription}</p>
                          {isManager && meta && meta.availableFields.length > 1 && (
                            <select
                              value={meta.field}
                              onChange={(e) => setSizeFieldOverride((prev) => ({ ...prev, [first.itemId]: e.target.value }))}
                              className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 bg-white shrink-0 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                            >
                              {meta.availableFields.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          <span className={first.qtyOnHand < 3 ? 'text-red-500 font-medium' : ''}>{first.qtyOnHand} on hand</span>
                          {first.qtyOnOrder > 0 ? ` + ${first.qtyOnOrder} on order` : ''} · {first.manufacturer} · {money(first.pricePerUnit)} each
                        </p>
                        {meta && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-600 mb-2 bg-gray-50 rounded px-2 py-1.5">
                            <Ruler className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium text-gray-800">{meta.summary}</span>
                            <span className="text-gray-400">— from {meta.field}{meta.unmatched > 0 ? `, ${meta.unmatched} on roster with no size on file` : ''}</span>
                          </p>
                        )}
                        <div className="space-y-1.5">
                          {group.map((s) => {
                            const on = !excluded.has(s.id);
                            return (
                              <div key={s.id} className={`flex items-center gap-3 pl-1 ${on ? '' : 'opacity-45'}`}>
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() => toggle(s.id)}
                                  disabled={!isManager}
                                  className="w-4 h-4 accent-[#00539F] shrink-0"
                                />
                                <span className="w-14 shrink-0 text-sm font-medium text-gray-700">{s.size}</span>
                                <span className="flex-1 text-xs text-gray-400">{s.suggestedQty} needed</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={qtyFor(s)}
                                  disabled={!isManager || !on}
                                  onChange={(e) =>
                                    setQtyOverrides((prev) => ({ ...prev, [s.id]: Math.max(1, parseInt(e.target.value) || 1) }))
                                  }
                                  className="w-16 border border-gray-200 rounded px-2 py-1.5 text-sm text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                                />
                                <span className="text-xs text-gray-500 w-20 text-right hidden md:block shrink-0">{money(lineCost(s))}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Sticky footer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{included.length} line{included.length !== 1 ? 's' : ''} · {money(grandTotal)} estimated</p>
              <p className="text-xs text-gray-400 mt-0.5">One submitted order is created per sport, viewable under Orders.</p>
            </div>
            {isManager && (
              <button
                onClick={createOrders}
                disabled={included.length === 0}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#003c71] disabled:opacity-40"
                style={{ backgroundColor: '#FFD200' }}
              >
                <ShoppingCart className="w-4 h-4" /> Submit Order{bySport.filter(([, l]) => l.some((x) => !excluded.has(x.id))).length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
