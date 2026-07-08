import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Tag, AlertTriangle } from 'lucide-react';
import { inventoryItems } from '../../data/mock/inventory';
import { athletes } from '../../data/mock/athletes';
import { staffMembers } from '../../data/mock/staff';

export default function InventoryDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const item = inventoryItems.find((i) => i.id === itemId);

  if (!item) {
    return (
      <div className="space-y-4">
        <Link to="/inventory" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Inventory
        </Link>
        <p className="text-gray-500">Item not found.</p>
      </div>
    );
  }

  const issuedTo = [
    ...athletes.flatMap((a) =>
      a.issuedItems
        .filter((i) => i.itemId === item.itemId && !i.returned)
        .map((i) => ({ name: `${a.lastName}, ${a.firstName}`, type: 'Athlete' as const, id: a.id, ...i }))
    ),
    ...staffMembers.flatMap((s) =>
      s.issuedItems
        .filter((i) => i.itemId === item.itemId && !i.returned)
        .map((i) => ({ name: `${s.lastName}, ${s.firstName}`, type: 'Staff' as const, id: s.id, ...i }))
    ),
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/inventory" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{item.description}</h1>
              <p className="text-sm text-gray-500 mt-0.5 font-mono">{item.itemId}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.sports.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-[#DAEAF5] text-[#00539F] rounded text-xs">{s}</span>
                ))}
                {item.isNonExpendable && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Non-Expendable</span>
                )}
                {item.isSerialized && (
                  <span className="px-2 py-0.5 bg-[#002855] text-white rounded text-xs">Serialized</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-800">{item.qtyOnHand}</p>
            <p className="text-xs text-gray-400">on hand</p>
            {item.qtyOnOrder > 0 && (
              <>
                <p className="text-lg font-semibold text-amber-600 mt-1">{item.qtyOnOrder}</p>
                <p className="text-xs text-gray-400">on order</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" /> Item Details
          </h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Manufacturer', item.manufacturer],
              ['Model', item.model],
              ['Category', item.category],
              ['Unit', item.unit],
              ['Year', item.year],
              ['Price / Unit', `$${item.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
              item.returnByDate ? ['Return By', item.returnByDate] : null,
            ]
              .filter(Boolean)
              .map(([label, value]: any) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-800 text-right">{value}</dd>
                </div>
              ))}
          </dl>
          {item.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-700">{item.notes}</p>
            </div>
          )}
        </div>

        {/* Serial numbers */}
        {item.isSerialized && item.serialNumbers && item.serialNumbers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Serial Numbers</h2>
            <ul className="space-y-1">
              {item.serialNumbers.map((sn) => (
                <li key={sn} className="font-mono text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded">{sn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Low stock warning */}
        {item.qtyOnHand < 3 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Low Stock</p>
              <p className="text-sm text-red-600">Only {item.qtyOnHand} unit{item.qtyOnHand !== 1 ? 's' : ''} remaining. Consider placing an order.</p>
            </div>
          </div>
        )}
      </div>

      {/* Issued to */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Currently Issued To ({issuedTo.length})
        </h2>
        {issuedTo.length === 0 ? (
          <p className="text-sm text-gray-400">Not currently issued to anyone.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium">Issued</th>
                <th className="pb-2 font-medium">Return By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {issuedTo.map((entry, i) => (
                <tr key={i}>
                  <td className="py-2">
                    <Link
                      to={entry.type === 'Athlete' ? `/athletes/${entry.id}` : `/staff/${entry.id}`}
                      className="font-medium text-[#00539F] hover:underline"
                    >
                      {entry.name}
                    </Link>
                  </td>
                  <td className="py-2 text-gray-500">{entry.type}</td>
                  <td className="py-2 text-right font-medium">{entry.qty}</td>
                  <td className="py-2 text-gray-500">{entry.issuedDate}</td>
                  <td className="py-2 text-gray-500">{entry.returnByDate ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
