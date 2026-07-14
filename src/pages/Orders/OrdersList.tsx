import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import { useActiveSport } from '../../context/SportContext';
import type { Order, OrderLine, OrderStatus, Sport } from '../../data/types';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  submitted: 'text-[#00539F]',
  incomplete: 'text-amber-600',
  complete: 'text-green-600',
};

const STATUS_BADGE_STYLES: Record<OrderStatus, string> = {
  submitted: 'bg-[#DAEAF5] text-[#00539F]',
  incomplete: 'bg-amber-100 text-amber-700',
  complete: 'bg-green-100 text-green-700',
};

type ViewMode = 'All' | 'submitted' | 'incomplete' | 'complete' | 'archived';

function nextOrderId(all: Order[]): string {
  const nums = all.map((o) => parseInt(o.id.replace('ord-', ''), 10)).filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 200000;
  return `ord-${max + 1}`;
}

export default function OrdersList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { localOrders, addOrder } = useOrders();

  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const isManager = user?.role === 'manager';
  const { activeSport: sportFilter, setActiveSport: setSportFilter } = useActiveSport();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('status') as ViewMode) ?? 'All'
  );

  // New Order modal state
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newSport, setNewSport] = useState<Sport | ''>('');
  const [newRefNumber, setNewRefNumber] = useState('');
  const [newOrderDate, setNewOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVendor, setNewVendor] = useState('');
  const [newLines, setNewLines] = useState<OrderLine[]>([{ description: '', qtyOrdered: 0, qtyReceived: 0 }]);

  const allOrders = localOrders;
  const scopedOrders = useMemo(() => filterBySports(allOrders, (o) => [o.sport]), [allOrders, filterBySports]);


  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scopedOrders.filter((o) => {
      if (archivedIds.has(o.id)) return false;
      const matchSport = sportFilter === 'All Sports' || o.sport === sportFilter;
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.refNumber.toLowerCase().includes(q) || o.vendor.toLowerCase().includes(q);
      const matchStatus = viewMode === 'All' || viewMode === 'archived' || o.status === viewMode;
      return matchSport && matchSearch && matchStatus;
    });
  }, [sportFilter, search, viewMode, archivedIds, scopedOrders]);

  const archivedOrders = useMemo(
    () => scopedOrders.filter((o) => archivedIds.has(o.id)),
    [archivedIds, scopedOrders]
  );

  const displayList = viewMode === 'archived' ? archivedOrders : filtered;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === displayList.length ? new Set() : new Set(displayList.map((o) => o.id))
    );
  }

  function archiveSelected() {
    setArchivedIds((prev) => new Set([...prev, ...selectedIds]));
    setSelectedIds(new Set());
  }

  function resetNewOrder() {
    setNewSport('');
    setNewRefNumber('');
    setNewOrderDate(new Date().toISOString().split('T')[0]);
    setNewVendor('');
    setNewLines([{ description: '', qtyOrdered: 0, qtyReceived: 0 }]);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (rows.length === 0) return;

      // Try to pull header fields from the first row or sheet name
      const first = rows[0];
      const keys = Object.keys(first).map((k) => k.toLowerCase());

      const find = (candidates: string[]) => {
        for (const c of candidates) {
          const k = keys.find((k) => k.includes(c));
          if (k) return String(first[Object.keys(first)[keys.indexOf(k)]] ?? '');
        }
        return '';
      };

      setNewRefNumber((v) => v || find(['ref', 'reference', 'order name', 'po']));
      setNewVendor((v) => v || find(['vendor', 'supplier', 'company']));
      const dateVal = find(['date', 'order date']);
      if (dateVal) {
        // Normalise to YYYY-MM-DD if it looks like a date
        const parsed = new Date(dateVal);
        if (!isNaN(parsed.getTime())) setNewOrderDate(parsed.toISOString().split('T')[0]);
      }

      // Build line items from rows
      const lines: OrderLine[] = rows
        .map((row) => {
          const rowKeys = Object.keys(row).map((k) => k.toLowerCase());
          const get = (candidates: string[]) => {
            for (const c of candidates) {
              const k = rowKeys.find((k) => k.includes(c));
              if (k) return String(row[Object.keys(row)[rowKeys.indexOf(k)]] ?? '');
            }
            return '';
          };
          const desc = get(['description', 'item', 'product', 'name', 'style']);
          const ordered = parseInt(get(['ordered', 'qty ordered', 'quantity ordered', 'quantity', 'qty'])) || 0;
          const received = parseInt(get(['received', 'qty received', 'quantity received'])) || 0;
          return desc ? { description: desc, qtyOrdered: ordered, qtyReceived: received } : null;
        })
        .filter(Boolean) as OrderLine[];

      if (lines.length > 0) setNewLines(lines);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  function updateLine(i: number, field: keyof OrderLine, value: string | number) {
    setNewLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function addLine() {
    setNewLines((prev) => [...prev, { description: '', qtyOrdered: 0, qtyReceived: 0 }]);
  }

  function removeLine(i: number) {
    setNewLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleAddOrder() {
    if (!newSport || !newRefNumber || !newVendor) return;
    const totalOrdered = newLines.reduce((s, l) => s + l.qtyOrdered, 0);
    const totalReceived = newLines.reduce((s, l) => s + l.qtyReceived, 0);
    const status: OrderStatus =
      totalReceived === 0 ? 'submitted' :
      totalReceived < totalOrdered ? 'incomplete' : 'complete';

    const order: Order = {
      id: nextOrderId(allOrders),
      refNumber: newRefNumber,
      orderDate: newOrderDate,
      vendor: newVendor,
      sport: newSport as Sport,
      lines: newLines.filter((l) => l.description.trim()),
      status,
      createdBy: user?.name ?? 'Unknown',
    };
    addOrder(order);
    resetNewOrder();
    setShowNewOrder(false);
  }

  return (
    <div>
      {/* Page title */}
      <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4" style={{ color: '#00539F' }}>Orders</span>

      {/* Filter bar */}
      <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1.5 text-sm flex-wrap gap-y-1">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value as Sport | 'All Sports')}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            <option value="All Sports">{isLead ? 'All Sports' : 'All My Sports'}</option>
            {(isLead ? ALL_SPORTS : accessibleSports).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {isManager && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => { resetNewOrder(); setShowNewOrder(true); }}
                className="text-[#003c71] font-semibold text-sm border-none focus:outline-none cursor-pointer rounded-md py-[0.025in] px-[0.1in]"
                style={{ backgroundColor: '#FFD200' }}
              >
                + New Order
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={viewMode}
            onChange={(e) => { setViewMode(e.target.value as ViewMode); setSelectedIds(new Set()); }}
            className="text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-sm hover:text-gray-700 pr-5"
          >
            <option value="All">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Complete</option>
            <option value="archived">Archived</option>
          </select>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID or Reference No."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-9 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#00539F] w-full sm:w-60 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table / Cards container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-[0.1in]">
        {/* Desktop table */}
        <table className="hidden md:table w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-center text-gray-500">
              {isManager && (
                <th className="p-[0.05in] font-bold w-8">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedIds.size === displayList.length && displayList.length > 0}
                    onChange={toggleAll}
                  />
                </th>
              )}
              <th className="p-[0.05in] font-bold">Order ID</th>
              <th className="p-[0.05in] font-bold">Ref Number</th>
              <th className="p-[0.05in] font-bold">Order Date</th>
              <th className="p-[0.05in] font-bold">Vendor</th>
              <th className="p-[0.05in] font-bold">Items Ordered</th>
              <th className="p-[0.05in] font-bold">Qty Ordered</th>
              {viewMode !== 'archived' && (
                <>
                  <th className="p-[0.05in] font-bold">Qty Received</th>
                  <th className="p-[0.05in] font-bold">% Received</th>
                </>
              )}
              <th className="p-[0.05in] font-bold">Order Status</th>
              <th className="p-[0.05in] font-bold">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={(isManager ? 1 : 0) + (viewMode !== 'archived' ? 10 : 8)} className="px-4 py-8 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              displayList.map((order) => {
                const totalOrdered = order.lines.reduce((s, l) => s + l.qtyOrdered, 0);
                const totalReceived = order.lines.reduce((s, l) => s + l.qtyReceived, 0);
                const pct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
                return (
                  <tr
                    key={order.id}
                    onClick={() => viewMode !== 'archived' && navigate(`/orders/${order.id}`)}
                    className={`${viewMode !== 'archived' ? 'hover:bg-[#EFF6FF] cursor-pointer' : ''} transition-colors ${selectedIds.has(order.id) ? 'bg-blue-50' : ''}`}
                  >
                    {isManager && (
                      <td className="p-[0.05in] text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleSelect(order.id)}
                        />
                      </td>
                    )}
                    <td className="p-[0.05in] text-center font-mono text-[#00539F] hover:underline">{order.id}</td>
                    <td className="p-[0.05in] text-center font-medium text-gray-800">{order.refNumber}</td>
                    <td className="p-[0.05in] text-center text-gray-600">{order.orderDate}</td>
                    <td className="p-[0.05in] text-center text-gray-600">{order.vendor}</td>
                    <td className="p-[0.05in] text-center text-gray-600">{order.lines.length}</td>
                    <td className="p-[0.05in] text-center text-gray-600">{totalOrdered}</td>
                    {viewMode !== 'archived' && (
                      <>
                        <td className="p-[0.05in] text-center text-gray-600">{totalReceived}</td>
                        <td className="p-[0.05in] text-center font-medium text-gray-700">{pct}%</td>
                      </>
                    )}
                    <td className="p-[0.05in] text-center">
                      <span className={`font-medium capitalize ${STATUS_STYLES[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-[0.05in] text-center text-gray-600">{order.createdBy}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-100">
          {displayList.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">No orders found.</p>
          ) : (
            displayList.map((order) => {
              const totalOrdered = order.lines.reduce((s, l) => s + l.qtyOrdered, 0);
              const totalReceived = order.lines.reduce((s, l) => s + l.qtyReceived, 0);
              const pct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
              return (
                <button
                  key={order.id}
                  onClick={() => viewMode !== 'archived' && navigate(`/orders/${order.id}`)}
                  className={`flex items-start gap-3 px-4 py-3 min-h-12 active:bg-[#EFF6FF] text-left w-full ${viewMode !== 'archived' ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-gray-800 truncate">{order.refNumber}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${STATUS_BADGE_STYLES[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 font-mono">{order.id}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-500 truncate">{order.vendor}</span>
                      {sportFilter === 'All Sports' && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-500 truncate">{order.sport}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{order.orderDate}</span>
                      {viewMode !== 'archived' && totalOrdered > 0 && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{pct}% received</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">{displayList.length} order{displayList.length !== 1 ? 's' : ''}</p>

      {/* Floating delete bar */}
      {isManager && selectedIds.size > 0 && viewMode !== 'archived' && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-xl px-[0.2in] py-[0.1in]">
          <span className="text-sm text-gray-600 font-medium">
            {selectedIds.size} order{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={archiveSelected}
            className="text-white text-sm font-medium rounded py-[0.05in] px-[0.15in]"
            style={{ backgroundColor: '#dc2626' }}
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* New Order modal */}
      {showNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full h-full rounded-none md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] md:rounded-xl shadow-2xl flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0 md:rounded-t-xl" style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
              <span className="text-white font-semibold text-sm">New Order</span>
              <button onClick={() => setShowNewOrder(false)} className="text-white hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-scroll flex-1 p-[0.15in] px-[0.2in]">

              {/* Upload confirmation / spreadsheet */}
              <div className="py-[0.05in] mb-[0.1in]">
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-[#00539F] hover:bg-[#f0f7ff] transition-colors text-xs text-gray-500 hover:text-[#00539F] p-[0.12in]">
                  <Upload className="w-4 h-4" />
                  Upload order confirmation or spreadsheet (.xlsx, .xls, .csv)
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
                </label>
                <p className="text-[10px] text-gray-400 text-center mt-1">Fields will be auto-filled from the file. You can edit them below.</p>
              </div>

              {/* Order ID (read-only) */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Order ID</label>
                <input
                  type="text"
                  readOnly
                  value={nextOrderId(allOrders)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-400 bg-gray-50 focus:outline-none p-[0.05in]"
                />
              </div>

              {/* Sport */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Sport</label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value as Sport)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                >
                  <option value="">Select Sport</option>
                  {ALL_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Ref Number */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Ref Number</label>
                <input
                  type="text"
                  value={newRefNumber}
                  onChange={(e) => setNewRefNumber(e.target.value)}
                  placeholder="e.g. MBB Workout Sneaker"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                />
              </div>

              {/* Order Date */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Order Date</label>
                <input
                  type="date"
                  value={newOrderDate}
                  onChange={(e) => setNewOrderDate(e.target.value)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                />
              </div>

              {/* Vendor */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Vendor</label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  placeholder="e.g. BSN Sports - Adidas"
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.05in]"
                />
              </div>

              {/* Items Ordered */}
              <div className="py-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Items Ordered</label>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-200 rounded overflow-hidden">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-center text-gray-500">
                        <th className="p-[0.05in] font-bold text-left">Description</th>
                        <th className="p-[0.05in] font-bold w-20">Qty Ordered</th>
                        <th className="p-[0.05in] font-bold w-20">Qty Received</th>
                        <th className="p-[0.05in] w-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {newLines.map((line, i) => (
                        <tr key={i}>
                          <td className="p-[0.05in]">
                            <input
                              type="text"
                              value={line.description}
                              onChange={(e) => updateLine(i, 'description', e.target.value)}
                              placeholder="Item description"
                              className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.03in] px-[0.05in]"
                            />
                          </td>
                          <td className="p-[0.05in]">
                            <input
                              type="number"
                              min={0}
                              value={line.qtyOrdered}
                              onChange={(e) => updateLine(i, 'qtyOrdered', parseInt(e.target.value) || 0)}
                              className="w-full border border-gray-200 rounded text-xs text-gray-700 text-center focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.03in] px-[0.05in]"
                            />
                          </td>
                          <td className="p-[0.05in]">
                            <input
                              type="number"
                              min={0}
                              value={line.qtyReceived}
                              onChange={(e) => updateLine(i, 'qtyReceived', parseInt(e.target.value) || 0)}
                              className="w-full border border-gray-200 rounded text-xs text-gray-700 text-center focus:outline-none focus:ring-1 focus:ring-[#00539F] p-[0.03in] px-[0.05in]"
                            />
                          </td>
                          <td className="p-[0.05in] text-center">
                            {newLines.length > 1 && (
                              <button onClick={() => removeLine(i)} className="text-gray-400 hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={addLine}
                  className="mt-1 text-xs text-[#003c71] hover:text-[#00539F] bg-transparent border-none cursor-pointer py-[0.05in]"
                >
                  + Add Line Item
                </button>
              </div>

              {/* Status preview */}
              <div className="py-[0.05in] mt-[0.05in]">
                <label className="block text-xs font-semibold text-gray-600 py-[0.05in]">Order Status (auto)</label>
                <div className="text-xs text-gray-500 border border-gray-200 rounded bg-gray-50 p-[0.05in]">
                  {(() => {
                    const tot = newLines.reduce((s, l) => s + l.qtyOrdered, 0);
                    const rec = newLines.reduce((s, l) => s + l.qtyReceived, 0);
                    if (rec === 0) return <span className="text-[#00539F] font-medium">Submitted</span>;
                    if (rec < tot) return <span className="text-amber-600 font-medium">Incomplete</span>;
                    return <span className="text-green-600 font-medium">Complete</span>;
                  })()}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-[0.1in] py-[0.05in]">
                <button
                  onClick={handleAddOrder}
                  disabled={!newSport || !newRefNumber || !newVendor}
                  className="w-full text-white text-xs font-semibold rounded disabled:opacity-40 py-[0.08in]"
                  style={{ backgroundColor: '#003c71' }}
                >
                  Add Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
