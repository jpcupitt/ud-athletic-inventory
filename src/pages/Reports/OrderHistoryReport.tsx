import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import type { Sport, OrderStatus, Order } from '../../data/types';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  incomplete: 'bg-amber-100 text-amber-700',
  complete: 'bg-green-100 text-green-700',
};

export default function OrderHistoryReport() {
  const { localOrders } = useOrders();
  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const defaultSport = isLead ? 'All Sports' : (accessibleSports[0] ?? 'All Sports') as Sport | 'All Sports';
  const [sportFilter, setSportFilter] = useState<Sport | 'All Sports'>(defaultSport);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [vendorFilter, setVendorFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const scopedOrders = useMemo(() => filterBySports(localOrders, (o) => [o.sport]), [localOrders, filterBySports]);

  const vendors = useMemo(() => {
    const set = new Set(scopedOrders.map((o) => o.vendor));
    return Array.from(set).sort();
  }, [scopedOrders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scopedOrders.filter((o) => {
      const matchSport = sportFilter === 'All Sports' || o.sport === sportFilter;
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      const matchVendor = !vendorFilter || o.vendor === vendorFilter;
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.refNumber.toLowerCase().includes(q) || o.vendor.toLowerCase().includes(q);
      return matchSport && matchStatus && matchVendor && matchSearch;
    }).sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [scopedOrders, sportFilter, statusFilter, vendorFilter, search]);

  const totalOrdered = filtered.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.qtyOrdered, 0), 0);
  const totalReceived = filtered.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.qtyReceived, 0), 0);
  const completeCount = filtered.filter((o) => o.status === 'complete').length;

  return (
    <div className="flex flex-col gap-2 md:gap-[0.1in]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Order History</h1>
        <span className="text-sm text-gray-400">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Orders</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#003c71' }}>{filtered.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Complete</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{completeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Units Ordered</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#003c71' }}>{totalOrdered.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Units Received</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#003c71' }}>{totalReceived.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value as Sport | 'All Sports')}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
        >
          {isLead && <option value="All Sports">All Sports</option>}
          {(isLead ? ALL_SPORTS : accessibleSports).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="incomplete">Incomplete</option>
          <option value="complete">Complete</option>
        </select>
        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
        >
          <option value="">All Vendors</option>
          {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search order ID, ref, vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white w-full md:w-56"
        />
      </div>

      {/* Order Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-[calc(100vw-2rem)] md:w-[480px] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center shrink-0" style={{ padding: '0.1in', backgroundColor: '#003c71' }}>
              <h2 className="text-sm font-semibold text-white">{selectedOrder.refNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="absolute text-white hover:opacity-70" style={{ right: '0.1in' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: '0.1in' }}>
              <div className="divide-y divide-gray-200 mb-4">
                {([
                  ['Order ID',   <span key="order-id" className="font-mono text-[#00539F]">{selectedOrder.id}</span>],
                  ['Date',       selectedOrder.orderDate],
                  ['Vendor',     selectedOrder.vendor],
                  ['Sport',      selectedOrder.sport],
                  ['Created By', selectedOrder.createdBy],
                  ['Status',     <span key="status" className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[selectedOrder.status]}`}>{selectedOrder.status}</span>],
                ] as [string, React.ReactNode][]).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-xs py-2">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Lines</p>
              <div className="divide-y divide-gray-200">
                {selectedOrder.lines.map((line, i) => {
                  const pct = line.qtyOrdered > 0 ? Math.round((line.qtyReceived / line.qtyOrdered) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded text-xs p-2" style={{ backgroundColor: '#f9fafb' }}>
                      <span className="flex-1 text-gray-700">{line.description}</span>
                      <span className="text-gray-400 shrink-0">Ord: {line.qtyOrdered}</span>
                      <span className="text-gray-400 shrink-0">Rcv: {line.qtyReceived}</span>
                      <span className={`font-semibold shrink-0 ${pct === 100 ? 'text-green-600' : pct > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-center text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Ref Number</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Sport</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Ordered</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">% Received</th>
              <th className="px-4 py-3 font-medium">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400">No orders match the current filters.</td>
              </tr>
            ) : (
              filtered.map((order) => {
                const qtyOrdered = order.lines.reduce((s, l) => s + l.qtyOrdered, 0);
                const qtyReceived = order.lines.reduce((s, l) => s + l.qtyReceived, 0);
                const pct = qtyOrdered > 0 ? Math.round((qtyReceived / qtyOrdered) * 100) : 0;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center font-mono text-xs text-[#00539F] cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>{order.id}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-800">{order.refNumber}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{order.orderDate}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{order.vendor}</td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{order.sport}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{order.lines.length}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{qtyOrdered}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{qtyReceived}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden shrink-0">
                          <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-gray-300'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`font-medium text-xs shrink-0 ${pct === 100 ? 'text-green-600' : pct > 0 ? 'text-amber-600' : 'text-gray-500'}`}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{order.createdBy}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
