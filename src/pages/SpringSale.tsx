import { Printer, Tag } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

export default function SpringSale() {
  const { items, setSpringSale } = useInventory();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const saleItems = items.filter((i) => i.springSale);
  const totalIfSoldOut = saleItems.reduce((s, i) => s + (i.springSale?.salePrice ?? 0) * i.qtyOnHand, 0);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4" style={{ color: '#00539F' }}>
          Spring Sale
        </span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 font-medium"
        >
          <Printer className="w-3.5 h-3.5" /> Print Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">If everything sells</span>
        </div>
        <p className="text-3xl font-bold text-gray-800">${totalIfSoldOut.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="text-xs text-gray-400 mt-1">{saleItems.length} item{saleItems.length !== 1 ? 's' : ''} across {saleItems.reduce((s, i) => s + i.qtyOnHand, 0)} units — sale pricing only, never touches live inventory cost.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Sale Price</th>
              <th className="px-4 py-3 font-medium text-right">If Sold Out</th>
              {isManager && <th className="px-4 py-3 font-medium print:hidden"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {saleItems.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No items in the Spring Sale yet — archive items from Inventory and choose "Move to Spring Sale".</td></tr>
            ) : (
              saleItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{item.description}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{item.qtyOnHand}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">${item.springSale!.salePrice.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-800">${(item.springSale!.salePrice * item.qtyOnHand).toFixed(2)}</td>
                  {isManager && (
                    <td className="px-4 py-2.5 text-right print:hidden">
                      <button onClick={() => setSpringSale(item.id, undefined)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
