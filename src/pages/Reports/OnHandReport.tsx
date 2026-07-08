import React, { useState, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import type { ItemCategory, Sport, InventoryItem } from '../../data/types';

const ALL_CATEGORIES: ItemCategory[] = ['Top', 'Bottom', 'Outerwear', 'Footwear', 'Headwear', 'Equipment', 'Bag', 'Accessory'];
const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball', 'Football',
];

export default function OnHandReport() {
  const { items, archivedIds } = useInventory();
  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('');
  const [sportFilter, setSportFilter] = useState<Sport | ''>('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const allItems = useMemo(
    () => items.filter((i) => !archivedIds.has(i.id)),
    [items, archivedIds]
  );
  const scopedItems = useMemo(() => filterBySports(allItems, (i) => i.sports as string[]), [allItems, filterBySports]);

  const filtered = useMemo(() => {
    return scopedItems.filter((item) => {
      const matchCategory = !categoryFilter || item.category === categoryFilter;
      const matchSport = !sportFilter || item.sports.includes(sportFilter);
      const matchLow = !showLowOnly || item.qtyOnHand < 10;
      return matchCategory && matchSport && matchLow;
    });
  }, [categoryFilter, sportFilter, showLowOnly, scopedItems]);

  const totalValue = filtered.reduce((s, i) => s + (i.qtyOnHand + i.qtyOnOrder) * i.pricePerUnit, 0);
  const totalOnHand = filtered.reduce((s, i) => s + i.qtyOnHand, 0);
  const totalOnOrder = filtered.reduce((s, i) => s + i.qtyOnOrder, 0);

  return (
    <div className="flex flex-col" style={{ gap: '0.1in' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">On-Hand Report</h1>
        <span className="text-sm text-gray-400">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Units On Hand', value: totalOnHand.toLocaleString() },
          { label: 'Total Units On Order', value: totalOnOrder.toLocaleString() },
          { label: 'Estimated Value', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#002855' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 border border-gray-300 rounded bg-white px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#00539F]">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
            className="text-sm focus:outline-none bg-transparent border-none appearance-none pr-2"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value as Sport | '')}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
        >
          <option value="">All Sports</option>
          {(isLead ? ALL_SPORTS : accessibleSports).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowOnly}
            onChange={(e) => setShowLowOnly(e.target.checked)}
            className="rounded border-gray-300 text-[#00539F] focus:ring-[#00539F]"
          />
          Low stock only (&lt;10)
        </label>

        {(categoryFilter || sportFilter || showLowOnly) && (
          <button
            onClick={() => { setCategoryFilter(''); setSportFilter(''); setShowLowOnly(false); }}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Item Detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ width: '480px', maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center shrink-0" style={{ padding: '0.1in', backgroundColor: '#002855' }}>
              <h2 className="text-sm font-semibold text-white truncate px-8">{selectedItem.description}</h2>
              <button onClick={() => setSelectedItem(null)} className="absolute text-white hover:opacity-70" style={{ right: '0.1in' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: '0.1in' }}>
              <div className="divide-y divide-gray-200 mb-4">
                {([
                  ['Item ID',      <span className="font-mono text-[#00539F]">{selectedItem.itemId}</span>],
                  ['Category',     selectedItem.category],
                  ['Manufacturer', selectedItem.manufacturer],
                  ['Model',        selectedItem.model],
                  ['Year',         selectedItem.year],
                  ['Unit',         selectedItem.unit],
                  ['On Hand',      <span className={`font-semibold ${selectedItem.qtyOnHand < 3 ? 'text-red-600' : selectedItem.qtyOnHand < 10 ? 'text-amber-600' : 'text-gray-800'}`}>{selectedItem.qtyOnHand}</span>],
                  ['On Order',     selectedItem.qtyOnOrder > 0 ? selectedItem.qtyOnOrder : '—'],
                  ['Unit Price',   `$${selectedItem.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                  ['Type',         selectedItem.isNonExpendable ? 'Non-Expendable' : 'Expendable'],
                ] as [string, React.ReactNode][]).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-xs py-2">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
              {selectedItem.sports.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sports</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.sports.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-[#DAEAF5] text-[#00539F] rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedItem.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-xs text-gray-600">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Item ID</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Manufacturer</th>
              <th className="px-4 py-3 font-medium">Sports</th>
              <th className="px-4 py-3 font-medium text-right">On Hand</th>
              <th className="px-4 py-3 font-medium text-right">On Order</th>
              <th className="px-4 py-3 font-medium text-right">Unit Price</th>
              <th className="px-4 py-3 font-medium text-right">Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">No items match the current filters.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className={item.qtyOnHand < 3 ? 'bg-red-50' : item.qtyOnHand < 10 ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3 font-mono text-xs text-[#00539F] cursor-pointer hover:underline" onClick={() => setSelectedItem(item)}>{item.itemId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.description}</td>
                  <td className="px-4 py-3 text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-gray-600">{item.manufacturer}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.sports.slice(0, 2).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-[#DAEAF5] text-[#00539F] rounded text-xs">{s}</span>
                      ))}
                      {item.sports.length > 2 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{item.sports.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${item.qtyOnHand < 3 ? 'text-red-600' : item.qtyOnHand < 10 ? 'text-amber-600' : 'text-gray-800'}`}>
                      {item.qtyOnHand}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.qtyOnOrder > 0 ? item.qtyOnOrder : '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">${item.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    ${((item.qtyOnHand + item.qtyOnOrder) * item.pricePerUnit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t-2 border-gray-300 bg-gray-50">
            <tr>
              <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700">Totals</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800">{totalOnHand}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800">{totalOnOrder > 0 ? totalOnOrder : '—'}</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3 text-right font-semibold text-gray-800">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Row highlighted in <span className="text-amber-600 font-medium">amber</span> = under 10 units. <span className="text-red-600 font-medium">Red</span> = under 3 units.
      </p>
    </div>
  );
}
