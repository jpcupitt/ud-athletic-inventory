import { Fragment, useState } from 'react';
import { useSubmittedOrders } from '../../context/SubmittedOrdersContext';

export default function SubmittedOrdersReport() {
  const { submittedRecords } = useSubmittedOrders();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div className="flex flex-col" style={{ gap: '0.1in' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Submitted Orders</h1>
        <span className="text-sm text-gray-400">{submittedRecords.length} submission{submittedRecords.length !== 1 ? 's' : ''}</span>
      </div>

      {submittedRecords.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No orders have been submitted yet.</p>
          <p className="text-gray-300 text-xs mt-1">Submitted orders will appear here for your records.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium w-8" />
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Sport</th>
                <th className="px-4 py-3 font-medium text-right">Items</th>
                <th className="px-4 py-3 font-medium text-right">Total Qty</th>
                <th className="px-4 py-3 font-medium">Submitted At</th>
                <th className="px-4 py-3 font-medium">Submitted By</th>
              </tr>
            </thead>
            <tbody>
              {submittedRecords.map((record) => {
                const totalQty = record.order.lines.reduce((s, l) => s + l.qtyOrdered, 0);
                const isExpanded = expanded.has(record.recordId);
                return (
                  <Fragment key={record.recordId}>
                    <tr
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(record.recordId)}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</td>
                      <td className="px-4 py-3 font-mono text-[#00539F] font-medium">{record.order.refNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{record.order.vendor}</td>
                      <td className="px-4 py-3 text-gray-700">{record.order.sport}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{record.order.lines.length}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{totalQty}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(record.submittedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{record.submittedBy}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={8} className="px-8 py-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-500 border-b border-gray-200">
                                <th className="text-left py-1.5 font-medium">Item Description</th>
                                <th className="text-right py-1.5 font-medium">Qty Ordered</th>
                                <th className="text-right py-1.5 font-medium">Qty Received</th>
                                <th className="text-right py-1.5 font-medium">Remaining</th>
                              </tr>
                            </thead>
                            <tbody>
                              {record.order.lines.map((line, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                  <td className="py-1.5 text-gray-700">{line.description}</td>
                                  <td className="py-1.5 text-right text-gray-600">{line.qtyOrdered}</td>
                                  <td className="py-1.5 text-right text-gray-600">{line.qtyReceived}</td>
                                  <td className="py-1.5 text-right font-medium" style={{ color: line.qtyOrdered - line.qtyReceived > 0 ? '#B38600' : '#15803d' }}>
                                    {line.qtyOrdered - line.qtyReceived}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
