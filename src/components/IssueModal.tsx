import { useState, useMemo } from 'react';
import { X, Search, CheckSquare, Square } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { newIssueId } from '../utils/ids';
import type { IssuedItem, Sport } from '../data/types';

interface Props {
  personName: string;
  /** Athlete's position, if any — items scoped to specific positions (e.g. kicker
   *  cleats) are hidden from everyone else. */
  personPosition?: string;
  onClose: () => void;
  onIssue: (item: IssuedItem) => void;
}

interface CartLine {
  qty: number;
  returnByDate: string;
}

export default function IssueModal({ personName, personPosition, onClose, onIssue }: Props) {
  const { items, archivedIds, issueItem } = useInventory();
  const { user } = useAuth();
  const canSeeCosts = user?.role !== 'student_manager';
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Map<string, CartLine>>(new Map());

  const activeItems = useMemo(
    () => items.filter((i) =>
      !archivedIds.has(i.id) &&
      i.qtyOnHand > 0 &&
      (!i.positions || !i.positions.length || (personPosition ? i.positions.includes(personPosition) : false))
    ),
    [items, archivedIds, personPosition]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activeItems.filter(
      (i) => !q || i.description.toLowerCase().includes(q) || i.itemId.toLowerCase().includes(q)
    );
  }, [search, activeItems]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((i) => cart.has(i.id));

  function toggleItem(id: string) {
    setCart((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, { qty: 1, returnByDate: '' });
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    setCart((prev) => {
      const next = new Map(prev);
      if (allFilteredSelected) {
        filtered.forEach((i) => next.delete(i.id));
      } else {
        filtered.forEach((i) => { if (!next.has(i.id)) next.set(i.id, { qty: 1, returnByDate: '' }); });
      }
      return next;
    });
  }

  function updateCartLine(id: string, changes: Partial<CartLine>) {
    setCart((prev) => {
      const next = new Map(prev);
      const line = next.get(id);
      if (line) next.set(id, { ...line, ...changes });
      return next;
    });
  }

  const cartEntries = [...cart.entries()]
    .map(([id, line]) => ({ item: activeItems.find((i) => i.id === id), line }))
    .filter((e): e is { item: NonNullable<typeof e.item>; line: CartLine } => !!e.item);

  const cartValid = cartEntries.length > 0 && cartEntries.every((e) => e.line.qty >= 1 && e.line.qty <= e.item.qtyOnHand);

  function handleIssue() {
    if (!cartValid) return;
    const today = new Date().toISOString().slice(0, 10);
    for (const { item, line } of cartEntries) {
      const issued: IssuedItem = {
        issueId: newIssueId(),
        itemId: item.id,
        description: item.description,
        qty: line.qty,
        pricePerUnit: item.pricePerUnit,
        issuedDate: today,
        isNonExpendable: item.isNonExpendable,
        returnByDate: line.returnByDate || undefined,
        returned: false,
      };
      issueItem(item.id, line.qty);
      onIssue(issued);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white shadow-2xl flex flex-col w-full h-full rounded-none md:w-full md:max-w-lg md:h-auto md:max-h-[85vh] md:rounded-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 md:rounded-t-xl shrink-0" style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
          <span className="text-white font-semibold text-sm">Issue Items to {personName}</span>
          <button onClick={onClose} className="text-white hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto flex-1 md:flex-none" style={{ padding: '0.15in 0.2in' }}>
          {/* Item search */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-600">Search Inventory</label>
              {cart.size > 0 && <span className="text-[11px] text-[#00539F] font-medium">{cart.size} selected</span>}
            </div>
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description or item ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-9 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                style={{ padding: '0.05in 2rem 0.05in 0.05in' }}
              />
            </div>
          </div>

          {/* Item list — multi-select with a Select All for whatever's currently filtered */}
          {search && (
            <div className="border border-gray-200 rounded overflow-hidden">
              <button
                onClick={toggleSelectAllFiltered}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-[#00539F] bg-gray-50 border-b border-gray-200 hover:bg-gray-100"
              >
                {allFilteredSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                Select All ({filtered.length})
              </button>
              <div className="overflow-y-auto" style={{ maxHeight: '160px' }}>
                {filtered.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No items found.</p>
                ) : (
                  filtered.map((item) => {
                    const selected = cart.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-100 last:border-0 ${selected ? 'bg-blue-50' : ''}`}
                      >
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-[#00539F] shrink-0" /> : <Square className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-800">{item.description}</span>
                          <span className="text-gray-400 ml-2">#{item.itemId}</span>
                          <div className="text-gray-400 text-[10px] mt-0.5">
                            {(item.sports as Sport[]).slice(0, 2).join(', ')}{item.sports.length > 2 ? ' ...' : ''}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className={`font-medium ${item.qtyOnHand < 3 ? 'text-red-600' : item.qtyOnHand < 10 ? 'text-amber-600' : 'text-gray-700'}`}>
                            {item.qtyOnHand} on hand
                          </div>
                          {canSeeCosts && <div className="text-gray-400 text-[10px]">${item.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</div>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Selected items — qty / return-by per line */}
          {cartEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-gray-600">Issuing ({cartEntries.length})</label>
              {cartEntries.map(({ item, line }) => (
                <div key={item.id} className="bg-gray-50 rounded border border-gray-200 text-xs" style={{ padding: '0.08in 0.12in' }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-gray-800 truncate">{item.description}</div>
                    <button onClick={() => toggleItem(item.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min={1}
                        max={item.qtyOnHand}
                        value={line.qty}
                        onChange={(e) => updateCartLine(item.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-16 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                        style={{ padding: '0.04in' }}
                      />
                    </div>
                    {item.isNonExpendable && (
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Return By</label>
                        <input
                          type="date"
                          value={line.returnByDate}
                          onChange={(e) => updateCartLine(item.id, { returnByDate: e.target.value })}
                          className="border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                          style={{ padding: '0.04in' }}
                        />
                      </div>
                    )}
                  </div>
                  {line.qty > item.qtyOnHand && (
                    <p className="text-[10px] text-red-500 mt-1">Only {item.qtyOnHand} available.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleIssue}
            disabled={!cartValid}
            className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
            style={{ backgroundColor: '#003c71', padding: '0.08in', marginTop: '0.05in' }}
          >
            {cartEntries.length > 1 ? `Issue ${cartEntries.length} Items` : cartEntries.length === 1 ? `Issue ${cartEntries[0].line.qty}× ${cartEntries[0].item.description}` : 'Issue Items'}
          </button>
        </div>
      </div>
    </div>
  );
}
