import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, TrendingDown, Wallet } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useSportsAccess } from '../hooks/useSportsAccess';
import { BUDGET_DATA } from '../data/mock/budgets';
import type { Order, Sport } from '../data/types';

const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Suggestion {
  id: string;
  sport: Sport;
  description: string;
  manufacturer: string;
  qtyOnHand: number;
  qtyOnOrder: number;
  suggestedQty: number;
  pricePerUnit: number;
}

export default function SmartReorder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filterBySports } = useSportsAccess();
  const { items, archivedIds } = useInventory();
  const { addOrder } = useOrders();
  const isManager = user?.role === 'manager';

  const [threshold, setThreshold] = useState(10);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [qtyOverrides, setQtyOverrides] = useState<Record<string, number>>({});

  // Low stock = on hand + already on order still below the threshold.
  // Suggest restocking to 2× the threshold so one order lasts a while.
  const suggestions: Suggestion[] = useMemo(() => {
    const scoped = filterBySports(
      items.filter((i) => !archivedIds.has(i.id)),
      (i) => i.sports
    );
    return scoped
      .filter((i) => i.qtyOnHand + i.qtyOnOrder < threshold)
      .map((i) => ({
        id: i.id,
        sport: i.sports[0],
        description: i.description,
        manufacturer: i.manufacturer,
        qtyOnHand: i.qtyOnHand,
        qtyOnOrder: i.qtyOnOrder,
        suggestedQty: Math.max(1, threshold * 2 - i.qtyOnHand - i.qtyOnOrder),
        pricePerUnit: i.pricePerUnit,
      }))
      .sort((a, b) => a.qtyOnHand + a.qtyOnOrder - (b.qtyOnHand + b.qtyOnOrder));
  }, [items, archivedIds, threshold, filterBySports]);

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

  function createDrafts() {
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
          Items running low across your sports, with a suggested restock quantity. Adjust, untick what you don't need, and turn the rest into draft orders in one tap.
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
                  {lines.map((s) => {
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
                  })}
                </div>
              </div>
            );
          })}

          {/* Sticky footer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{included.length} line{included.length !== 1 ? 's' : ''} · {money(grandTotal)} estimated</p>
              <p className="text-xs text-gray-400 mt-0.5">One draft order is created per sport, ready to review under Orders.</p>
            </div>
            {isManager && (
              <button
                onClick={createDrafts}
                disabled={included.length === 0}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#002855] disabled:opacity-40"
                style={{ backgroundColor: '#FFD200' }}
              >
                <ShoppingCart className="w-4 h-4" /> Create Draft Order{bySport.filter(([, l]) => l.some((x) => !excluded.has(x.id))).length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
