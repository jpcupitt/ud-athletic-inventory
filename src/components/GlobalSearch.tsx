import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, User, UserCog, ShoppingCart, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAthletes } from '../context/AthletesContext';
import { useStaff } from '../context/StaffContext';
import { useOrders } from '../context/OrdersContext';
import { useSportsAccess } from '../hooks/useSportsAccess';

interface Props {
  /** Full-screen sheet for phones; inline dropdown otherwise. */
  mobile?: boolean;
  onClose?: () => void;
}

/** One search box for everything: items, athletes, staff, and orders. */
export default function GlobalSearch({ mobile, onClose }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const { items, archivedIds } = useInventory();
  const { athletes } = useAthletes();
  const { staff } = useStaff();
  const { localOrders } = useOrders();
  const { filterBySports } = useSportsAccess();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    const has = (s: string | undefined) => (s ?? '').toLowerCase().includes(q);
    const foundItems = filterBySports(items.filter((i) => !archivedIds.has(i.id)), (i) => i.sports)
      .filter((i) => has(i.description) || has(i.itemId) || has(i.manufacturer))
      .slice(0, 5);
    const foundAthletes = filterBySports(athletes, (a) => a.sports)
      .filter((a) => has(`${a.firstName} ${a.lastName}`) || has(`${a.lastName}, ${a.firstName}`) || has(a.athleteId))
      .slice(0, 5);
    const foundStaff = filterBySports(staff, (s) => s.sports)
      .filter((s) => has(`${s.firstName} ${s.lastName}`) || has(s.staffId) || has(s.title))
      .slice(0, 5);
    const foundOrders = filterBySports(localOrders, (o) => [o.sport])
      .filter((o) => has(o.refNumber) || has(o.vendor) || has(o.id))
      .slice(0, 5);
    return {
      foundItems, foundAthletes, foundStaff, foundOrders,
      total: foundItems.length + foundAthletes.length + foundStaff.length + foundOrders.length,
    };
  }, [query, items, archivedIds, athletes, staff, localOrders, filterBySports]);

  // Ctrl+K / Cmd+K focuses the desktop search
  useEffect(() => {
    if (mobile) return;
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobile]);

  // Click outside closes the desktop dropdown
  useEffect(() => {
    if (mobile) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [mobile]);

  useEffect(() => {
    if (mobile) inputRef.current?.focus();
  }, [mobile]);

  function go(path: string) {
    setQuery('');
    setOpen(false);
    onClose?.();
    navigate(path);
  }

  const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const resultsList = results && (
    <div className={mobile ? 'flex-1 overflow-y-auto' : 'max-h-[420px] overflow-y-auto'}>
      {results.total === 0 && (
        <p className="text-sm text-gray-400 text-center py-6 px-4">Nothing matches "{query.trim()}".</p>
      )}
      {results.foundItems.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Inventory</p>
          {results.foundItems.map((i) => (
            <button key={i.id} onClick={() => go(`/inventory/${i.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 active:bg-gray-50">
              <Package className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-gray-800 truncate">{i.description}</span>
                <span className="block text-xs text-gray-400">#{i.itemId} · {i.qtyOnHand} on hand · {money(i.pricePerUnit)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {results.foundAthletes.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Athletes</p>
          {results.foundAthletes.map((a) => (
            <button key={a.id} onClick={() => go(`/athletes/${a.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 active:bg-gray-50">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-gray-800 truncate">{a.lastName}, {a.firstName}</span>
                <span className="block text-xs text-gray-400">{a.year} · {a.sports[0]}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {results.foundStaff.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Staff</p>
          {results.foundStaff.map((s) => (
            <button key={s.id} onClick={() => go(`/staff/${s.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 active:bg-gray-50">
              <UserCog className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-gray-800 truncate">{s.lastName}, {s.firstName}</span>
                <span className="block text-xs text-gray-400">{s.title}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {results.foundOrders.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Orders</p>
          {results.foundOrders.map((o) => (
            <button key={o.id} onClick={() => go(`/orders/${o.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 active:bg-gray-50">
              <ShoppingCart className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-gray-800 truncate">{o.refNumber}</span>
                <span className="block text-xs text-gray-400">{o.vendor} · {o.sport} · {o.status}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (mobile) {
    return (
      <div className="fixed inset-0 z-[80] bg-white flex flex-col">
        <div
          className="flex items-center gap-2 px-4 py-3 shrink-0"
          style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
        >
          <Search className="w-4 h-4 text-white/60 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search items, athletes, staff, orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/50 text-sm focus:outline-none"
          />
          <button onClick={onClose} className="text-white p-1 -m-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        {query.trim().length < 2 ? (
          <p className="text-sm text-gray-400 text-center py-8 px-4">Type at least 2 characters to search everything.</p>
        ) : (
          resultsList
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative hidden md:block">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search everything…  (Ctrl+K)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); } }}
        className="pl-8 pr-3 py-1.5 border border-white/50 rounded text-xs focus:outline-none focus:ring-1 focus:ring-white/50 w-56 bg-[#003c71] text-white placeholder-white/50"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full right-0 mt-1.5 w-[380px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 pb-1">
          {resultsList}
        </div>
      )}
    </div>
  );
}
