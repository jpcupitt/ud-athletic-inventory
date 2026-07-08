import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import type { IssuedItem, Sport } from '../data/types';

interface Props {
  personName: string;
  onClose: () => void;
  onIssue: (item: IssuedItem) => void;
}

export default function IssueModal({ personName, onClose, onIssue }: Props) {
  const { items, archivedIds, issueItem } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [qty, setQty] = useState(1);
  const [returnByDate, setReturnByDate] = useState('');

  const activeItems = useMemo(
    () => items.filter((i) => !archivedIds.has(i.id) && i.qtyOnHand > 0),
    [items, archivedIds]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activeItems.filter(
      (i) => !q || i.description.toLowerCase().includes(q) || i.itemId.toLowerCase().includes(q)
    );
  }, [search, activeItems]);

  const selectedItem = activeItems.find((i) => i.id === selectedItemId);

  function handleIssue() {
    if (!selectedItem || qty < 1) return;
    const today = new Date().toISOString().slice(0, 10);
    const issued: IssuedItem = {
      itemId: selectedItem.id,
      description: selectedItem.description,
      qty,
      pricePerUnit: selectedItem.pricePerUnit,
      issuedDate: today,
      isNonExpendable: selectedItem.isNonExpendable,
      returnByDate: returnByDate || undefined,
      returned: false,
    };
    issueItem(selectedItem.id, qty);
    onIssue(issued);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 rounded-t-xl" style={{ backgroundColor: '#002855' }}>
          <span className="text-white font-semibold text-sm">Issue Items to {personName}</span>
          <button onClick={onClose} className="text-white hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto" style={{ padding: '0.15in 0.2in' }}>
          {/* Item search */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Search Inventory</label>
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description or item ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedItemId(''); }}
                className="w-full pl-3 pr-9 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                style={{ padding: '0.05in 2rem 0.05in 0.05in' }}
              />
            </div>
          </div>

          {/* Item list */}
          {search && (
            <div className="border border-gray-200 rounded overflow-y-auto" style={{ maxHeight: '160px' }}>
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No items found.</p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItemId(item.id); setSearch(item.description); }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-100 last:border-0 ${selectedItemId === item.id ? 'bg-blue-50' : ''}`}
                  >
                    <div>
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
                      <div className="text-gray-400 text-[10px]">${item.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Selected item details */}
          {selectedItem && (
            <div className="bg-gray-50 rounded border border-gray-200 text-xs" style={{ padding: '0.08in 0.12in' }}>
              <div className="font-semibold text-gray-800">{selectedItem.description}</div>
              <div className="flex gap-4 mt-1 text-gray-500">
                <span>Item #{selectedItem.itemId}</span>
                <span>{selectedItem.manufacturer}</span>
                <span className={selectedItem.isNonExpendable ? 'text-orange-600 font-medium' : ''}>
                  {selectedItem.isNonExpendable ? 'Non-Expendable' : 'Expendable'}
                </span>
              </div>
            </div>
          )}

          {/* Qty */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              max={selectedItem?.qtyOnHand ?? 1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
              style={{ padding: '0.05in' }}
            />
            {selectedItem && qty > selectedItem.qtyOnHand && (
              <p className="text-xs text-red-500 mt-1">Only {selectedItem.qtyOnHand} available.</p>
            )}
          </div>

          {/* Return by date (for non-expendable) */}
          {selectedItem?.isNonExpendable && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Return By Date</label>
              <input
                type="date"
                value={returnByDate}
                onChange={(e) => setReturnByDate(e.target.value)}
                className="border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                style={{ padding: '0.05in' }}
              />
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleIssue}
            disabled={!selectedItem || qty < 1 || qty > (selectedItem?.qtyOnHand ?? 0)}
            className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
            style={{ backgroundColor: '#002855', padding: '0.08in', marginTop: '0.05in' }}
          >
            Issue {qty > 0 && selectedItem ? `${qty}× ${selectedItem.description}` : 'Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
