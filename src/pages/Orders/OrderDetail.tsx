import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle2, Save } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import type { OrderStatus, OrderLine } from '../../data/types';

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    submitted: 'bg-[#DAEAF5] text-[#00539F]',
    incomplete: 'bg-amber-100 text-amber-700',
    complete: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function computeStatus(lines: OrderLine[]): OrderStatus {
  const ordered = lines.reduce((s, l) => s + l.qtyOrdered, 0);
  const received = lines.reduce((s, l) => s + l.qtyReceived, 0);
  if (received === 0) return 'submitted';
  if (received < ordered) return 'incomplete';
  return 'complete';
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { localOrders, updateOrder } = useOrders();
  const order = localOrders.find((o) => o.id === orderId);

  const [editedLines, setEditedLines] = useState<OrderLine[] | null>(null);
  const [saved, setSaved] = useState(false);

  const lines = editedLines ?? order?.lines ?? [];
  const isDirty = editedLines !== null;

  const totalOrdered = useMemo(() => lines.reduce((s, l) => s + l.qtyOrdered, 0), [lines]);
  const totalReceived = useMemo(() => lines.reduce((s, l) => s + l.qtyReceived, 0), [lines]);

  if (!order) {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  function setLineReceived(index: number, value: number) {
    setEditedLines((prev) => {
      const base = prev ?? order!.lines.map((l) => ({ ...l }));
      return base.map((l, i) => (i === index ? { ...l, qtyReceived: Math.max(0, Math.min(value, l.qtyOrdered)) } : l));
    });
    setSaved(false);
  }

  function markAllReceived() {
    setEditedLines(order!.lines.map((l) => ({ ...l, qtyReceived: l.qtyOrdered })));
    setSaved(false);
  }

  function handleSave() {
    if (!editedLines) return;
    const newStatus = computeStatus(editedLines);
    updateOrder(order!.id, { lines: editedLines, status: newStatus });
    setEditedLines(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleDiscard() {
    setEditedLines(null);
    setSaved(false);
  }

  const previewStatus = isDirty ? computeStatus(lines) : order.status;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{order.refNumber}</h1>
              <p className="text-sm font-mono text-gray-400 mt-0.5">{order.id}</p>
            </div>
          </div>
          <StatusBadge status={previewStatus} />
        </div>

        <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-5 border-t border-gray-100">
          {[
            ['Order Date', order.orderDate],
            ['Vendor', order.vendor],
            ['Sport', order.sport],
            ['Created By', order.createdBy],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-gray-400 text-xs uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 font-medium text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Completion banner */}
      {order.status === 'complete' && !isDirty && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 font-medium">This order has been fully received.</p>
        </div>
      )}

      {/* Saved confirmation */}
      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 font-medium">Changes saved.</p>
        </div>
      )}

      {/* Line items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {isDirty && (
              <>
                <button
                  onClick={handleDiscard}
                  className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-3 py-1.5"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 text-xs text-white font-medium rounded px-3 py-1.5"
                  style={{ backgroundColor: '#002855' }}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </>
            )}
            {order.status !== 'complete' && (
              <button
                onClick={markAllReceived}
                className="flex items-center gap-1.5 text-xs font-medium rounded px-3 py-1.5 border"
                style={{ color: '#00539F', borderColor: '#00539F', backgroundColor: '#DAEAF5' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark All Received
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Ordered</th>
                <th className="pb-2 font-medium text-right">Received</th>
                <th className="pb-2 font-medium text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lines.map((line, i) => {
                const outstanding = line.qtyOrdered - line.qtyReceived;
                return (
                  <tr key={i}>
                    <td className="py-2.5 font-medium text-gray-800">{line.description}</td>
                    <td className="py-2.5 text-right text-gray-600">{line.qtyOrdered}</td>
                    <td className="py-2.5 text-right">
                      <input
                        type="number"
                        min={0}
                        max={line.qtyOrdered}
                        value={line.qtyReceived}
                        onChange={(e) => setLineReceived(i, parseInt(e.target.value) || 0)}
                        className="w-16 text-right border border-gray-200 rounded text-xs px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#00539F] text-gray-700"
                      />
                    </td>
                    <td className={`py-2.5 text-right font-medium ${outstanding > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {outstanding > 0 ? outstanding : '✓'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-gray-200">
              <tr>
                <td className="pt-3 text-sm font-semibold text-gray-700">Totals</td>
                <td className="pt-3 text-right font-semibold text-gray-800">{totalOrdered}</td>
                <td className="pt-3 text-right font-semibold text-gray-800">{totalReceived}</td>
                <td className={`pt-3 text-right font-semibold ${totalOrdered - totalReceived > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {totalOrdered - totalReceived > 0 ? totalOrdered - totalReceived : '✓'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
