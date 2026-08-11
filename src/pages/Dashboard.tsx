import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { Package, ShoppingCart, X, ChevronLeft, ChevronRight, CalendarCheck, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import { useSportsAccess } from '../hooks/useSportsAccess';
import { useActiveSport } from '../context/SportContext';
import { useSubmittedOrders } from '../context/SubmittedOrdersContext';
import { useInventory } from '../context/InventoryContext';
import { useAthletes } from '../context/AthletesContext';
import { useStaff } from '../context/StaffContext';
import { useOrders } from '../context/OrdersContext';
import { transactions } from '../data/mock/transactions';
import type { Sport, Order } from '../data/types';

const SPORTS: (Sport | 'All Sports')[] = [
  'All Sports', "Basketball, Men's", "Basketball, Women's", 'Baseball', 'Football',
  'Field Hockey', 'Softball', "Soccer, Men's", "Soccer, Women's",
];


const CHART_OPTIONS = [
  { id: 'real-time',           label: 'Real Time Inventory' },
  { id: 'transaction-history', label: 'Transaction History' },
  { id: 'budget',              label: 'Budget' },
  { id: 'orders-arriving',     label: 'Orders Arriving' },
] as const;


function BarLabel({ x, y, width, height, value, formatter, insideColor }: { x?: number; y?: number; width?: number; height?: number; value?: number; formatter?: (v: number) => string; insideColor?: string }) {
  if (!value) return null;
  const inside = (height ?? 0) >= 18;
  const label = formatter ? formatter(value) : String(value);
  return (
    <text
      x={(x ?? 0) + (width ?? 0) / 2}
      y={inside ? (y ?? 0) + 12 : (y ?? 0) - 4}
      textAnchor="middle"
      fill={inside ? (insideColor ?? '#ffffff') : '#6b7280'}
      fontSize={9}
      fontWeight={600}
    >
      {label}
    </text>
  );
}

function RemoveOverlay({ onRemove }: { onRemove: () => void }) {
  return (
    <>
      <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ backgroundColor: 'rgba(107,114,128,0.12)', zIndex: 5 }} />
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors pointer-events-auto"
        style={{ zIndex: 10 }}
        title="Remove chart"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </>
  );
}

function NotifBadge({ label, count, color, onClick }: { label: string; count: number; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-lg text-white text-center cursor-pointer hover:opacity-90 transition-opacity`}
      style={{ padding: '0.1in 0.1in' }}
    >
      <p className="text-2xl font-bold leading-none">{count}</p>
      <p className="text-xs mt-2 opacity-90 leading-tight">{label}</p>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const { recordSubmission } = useSubmittedOrders();
  const { overdueReturns, lowInventory, ordersForApproval } = useNotifications();
  const { localOrders: orders } = useOrders();
  const { items: allInventoryItems } = useInventory();
  const inventoryItems = filterBySports(allInventoryItems, (i) => i.sports as string[]);
  const { athletes } = useAthletes();
  useStaff();
  // Shared with the sport picker next to the search bar — pick a sport there
  // (or in either panel below, they're the same selection) and every
  // sport-scoped panel on this page narrows to just that team.
  const { activeSport: chartSport, setActiveSport: setChartSport } = useActiveSport();
  const { activeSport: budgetSport, setActiveSport: setBudgetSport } = useActiveSport();
  const [chartView, setChartView] = useState<'qty' | 'price'>('qty');
  const [showRTFilters, setShowRTFilters] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(['Top', 'Bottom', 'Outerwear', 'Footwear', 'Headwear', 'Equipment', 'Bag', 'Accessory']));
  const [showBudgetFilters, setShowBudgetFilters] = useState(false);
  const [showTxFilters, setShowTxFilters] = useState(false);
  const [txTimeRange, setTxTimeRange] = useState<'week' | '2weeks' | 'month' | '3months' | '6months' | 'year'>('month');
  const [txTeam, setTxTeam] = useState<Sport | 'All Teams'>('All Teams');
  const [showQuickSubmit, setShowQuickSubmit] = useState(false);
  const [quickSubmitOrder, setQuickSubmitOrder] = useState<Order | null>(null);
  const [showLowInventory, setShowLowInventory] = useState(false);
  const [showNewOpenStatus, setShowNewOpenStatus] = useState(false);
  const [showOverdueReturns, setShowOverdueReturns] = useState(false);
  const [submittedOrderIds, setSubmittedOrderIds] = useState<Set<string>>(new Set());
  const [showOrderSubmitted, setShowOrderSubmitted] = useState(false);
  const [budgetView, setBudgetView] = useState<'overview' | 'monthly'>('overview');
  const [visibleCharts, setVisibleCharts] = useState<Set<string>>(
    new Set(['real-time', 'transaction-history', 'budget', 'orders-arriving'])
  );
  const [removeMode, setRemoveMode] = useState(false);
  const [showAddChart, setShowAddChart] = useState(false);

  const filteredItems = chartSport === 'All Sports'
    ? inventoryItems
    : inventoryItems.filter((i) => i.sports.includes(chartSport as Sport));


  const PRICE_INTERVAL: Partial<Record<Sport | 'All Sports', number>> = {
    "Basketball, Men's": 2000,
    "Basketball, Women's": 1000,
    'Baseball': 1000,
    'Football': 6000,
    'Field Hockey': 1000,
    'Softball': 1000,
    "Soccer, Men's": 1000,
    "Soccer, Women's": 1000,
  };
  const priceInterval = PRICE_INTERVAL[chartSport] ?? 5000;

  const ALL_CATEGORIES = ['Top', 'Bottom', 'Outerwear', 'Footwear', 'Headwear', 'Equipment', 'Bag', 'Accessory'];
  const categoryTotals = filteredItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.qtyOnHand;
    return acc;
  }, {});
  const categoryOnOrder = filteredItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.qtyOnOrder;
    return acc;
  }, {});
  const inventoryChartData = ALL_CATEGORIES
    .filter((name) => selectedCats.has(name))
    .map((name) => ({ name, onHand: categoryTotals[name] ?? 0, onOrder: categoryOnOrder[name] ?? 0 }))
    .filter((d) => d.onHand > 0 || d.onOrder > 0);
  const yMax = Math.ceil(Math.max(...inventoryChartData.map((d) => Math.max(d.onHand, d.onOrder)), 100) / 100) * 100;
  const yTicks = Array.from({ length: yMax / 100 + 1 }, (_, i) => i * 100);

  const categoryPrices = filteredItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.pricePerUnit * item.qtyOnHand;
    return acc;
  }, {});
  const categoryOnOrderPrices = filteredItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.pricePerUnit * item.qtyOnOrder;
    return acc;
  }, {});
  const priceChartData = ALL_CATEGORIES
    .filter((name) => selectedCats.has(name))
    .map((name) => ({ name, onHand: Math.round(categoryPrices[name] ?? 0), onOrder: Math.round(categoryOnOrderPrices[name] ?? 0) }))
    .filter((d) => d.onHand > 0 || d.onOrder > 0);
  const pMax = Math.ceil(Math.max(...priceChartData.map((d) => Math.max(d.onHand, d.onOrder)), priceInterval) / priceInterval) * priceInterval;
  const pTicks = Array.from({ length: pMax / priceInterval + 1 }, (_, i) => i * priceInterval);


  const budgetDataAll = [
    { name: "Basketball, Men's",    budgeted: 120000, spent: 87000 },
    { name: "Basketball, Women's",  budgeted: 110000, spent: 72000 },
    { name: 'Baseball',             budgeted: 85000,  spent: 61000 },
    { name: 'Football',             budgeted: 200000, spent: 155000 },
    { name: 'Field Hockey',         budgeted: 70000,  spent: 48000 },
    { name: 'Softball',             budgeted: 65000,  spent: 39000 },
    { name: "Soccer, Men's",        budgeted: 75000,  spent: 52000 },
    { name: "Soccer, Women's",      budgeted: 75000,  spent: 47000 },
  ];
  const budgetData = isLead ? budgetDataAll : budgetDataAll.filter((d) => accessibleSports.includes(d.name as never));

  const itemBudgetData: Partial<Record<Sport | 'All Sports', Array<{ name: string; budgeted: number; spent: number }>>> = {
    "Basketball, Men's": [
      { name: 'Jerseys',       budgeted: 15000, spent: 12400 },
      { name: 'Shorts',        budgeted: 10000, spent: 8200 },
      { name: 'Shoes',         budgeted: 25000, spent: 21000 },
      { name: 'Practice Gear', budgeted: 18000, spent: 13500 },
      { name: 'Balls',         budgeted: 12000, spent: 9800 },
      { name: 'Bags',          budgeted: 8000,  spent: 6100 },
      { name: 'Accessories',   budgeted: 10000, spent: 7200 },
      { name: 'Warmups',       budgeted: 22000, spent: 8800 },
    ],
    "Basketball, Women's": [
      { name: 'Jerseys',       budgeted: 14000, spent: 11200 },
      { name: 'Shorts',        budgeted: 9000,  spent: 7400 },
      { name: 'Shoes',         budgeted: 22000, spent: 18500 },
      { name: 'Practice Gear', budgeted: 16000, spent: 11000 },
      { name: 'Balls',         budgeted: 10000, spent: 8300 },
      { name: 'Bags',          budgeted: 7000,  spent: 5200 },
      { name: 'Accessories',   budgeted: 9000,  spent: 5600 },
      { name: 'Warmups',       budgeted: 23000, spent: 4800 },
    ],
    'Baseball': [
      { name: 'Jerseys',       budgeted: 12000, spent: 9800 },
      { name: 'Pants',         budgeted: 8000,  spent: 6200 },
      { name: 'Cleats',        budgeted: 14000, spent: 11400 },
      { name: 'Helmets',       budgeted: 10000, spent: 7500 },
      { name: 'Batting Gloves',budgeted: 5000,  spent: 4100 },
      { name: 'Bats',          budgeted: 18000, spent: 12000 },
      { name: 'Bags',          budgeted: 8000,  spent: 5800 },
      { name: 'Accessories',   budgeted: 10000, spent: 4200 },
    ],
    'Football': [
      { name: 'Helmets',        budgeted: 45000, spent: 38000 },
      { name: 'Shoulder Pads',  budgeted: 35000, spent: 28500 },
      { name: 'Jerseys',        budgeted: 22000, spent: 18000 },
      { name: 'Pants',          budgeted: 15000, spent: 12000 },
      { name: 'Cleats',         budgeted: 28000, spent: 22000 },
      { name: 'Gloves',         budgeted: 12000, spent: 9500 },
      { name: 'Practice Gear',  budgeted: 25000, spent: 18000 },
      { name: 'Bags',           budgeted: 18000, spent: 9000 },
    ],
    'Field Hockey': [
      { name: 'Jerseys',       budgeted: 10000, spent: 7800 },
      { name: 'Skirts/Shorts', budgeted: 8000,  spent: 5900 },
      { name: 'Cleats',        budgeted: 12000, spent: 9200 },
      { name: 'Sticks',        budgeted: 18000, spent: 12000 },
      { name: 'Shin Guards',   budgeted: 5000,  spent: 3800 },
      { name: 'Mouth Guards',  budgeted: 2000,  spent: 1400 },
      { name: 'Bags',          budgeted: 7000,  spent: 4600 },
      { name: 'Accessories',   budgeted: 8000,  spent: 3300 },
    ],
    'Softball': [
      { name: 'Jerseys',       budgeted: 10000, spent: 7600 },
      { name: 'Pants',         budgeted: 7000,  spent: 5200 },
      { name: 'Cleats',        budgeted: 11000, spent: 8400 },
      { name: 'Helmets',       budgeted: 8000,  spent: 5800 },
      { name: 'Batting Gloves',budgeted: 4000,  spent: 2900 },
      { name: 'Bats',          budgeted: 14000, spent: 8500 },
      { name: 'Bags',          budgeted: 6000,  spent: 4000 },
      { name: 'Accessories',   budgeted: 5000,  spent: 1600 },
    ],
    "Soccer, Men's": [
      { name: 'Jerseys',       budgeted: 12000, spent: 9400 },
      { name: 'Shorts',        budgeted: 7000,  spent: 5200 },
      { name: 'Cleats',        budgeted: 16000, spent: 12800 },
      { name: 'Shin Guards',   budgeted: 4000,  spent: 3100 },
      { name: 'Balls',         budgeted: 8000,  spent: 6200 },
      { name: 'Gloves (GK)',   budgeted: 5000,  spent: 3800 },
      { name: 'Bags',          budgeted: 8000,  spent: 5600 },
      { name: 'Accessories',   budgeted: 15000, spent: 5900 },
    ],
    "Soccer, Women's": [
      { name: 'Jerseys',       budgeted: 12000, spent: 8800 },
      { name: 'Shorts',        budgeted: 7000,  spent: 4900 },
      { name: 'Cleats',        budgeted: 16000, spent: 11600 },
      { name: 'Shin Guards',   budgeted: 4000,  spent: 2800 },
      { name: 'Balls',         budgeted: 8000,  spent: 6000 },
      { name: 'Gloves (GK)',   budgeted: 5000,  spent: 3200 },
      { name: 'Bags',          budgeted: 8000,  spent: 5100 },
      { name: 'Accessories',   budgeted: 15000, spent: 4600 },
    ],
  };

  const currentBudgetData = budgetSport === 'All Sports' ? budgetData : (itemBudgetData[budgetSport as Sport] ?? []);
  const budgetInterval = budgetSport === 'All Sports' ? 50000 : 5000;
  const budgetMax = budgetSport === 'All Sports' ? 250000 : Math.ceil(Math.max(...currentBudgetData.map((d) => d.budgeted), 5000) / 5000) * 5000;
  const budgetTicks = Array.from({ length: budgetMax / budgetInterval + 1 }, (_, i) => i * budgetInterval);

  const monthlyBudgetData = [
    { month: 'Jan', expected: 18000, actual: 15200 },
    { month: 'Feb', expected: 22000, actual: 24100 },
    { month: 'Mar', expected: 35000, actual: 31800 },
    { month: 'Apr', expected: 28000, actual: 29500 },
    { month: 'May', expected: 20000, actual: 18700 },
    { month: 'Jun', expected: 15000, actual: 16200 },
    { month: 'Jul', expected: 12000, actual: 10900 },
    { month: 'Aug', expected: 25000, actual: 27300 },
    { month: 'Sep', expected: 30000, actual: 28600 },
    { month: 'Oct', expected: 22000, actual: null },
    { month: 'Nov', expected: 19000, actual: null },
    { month: 'Dec', expected: 14000, actual: null },
  ];
  const monthlyMax = 40000;
  const monthlyTicks = Array.from({ length: monthlyMax / 5000 + 1 }, (_, i) => i * 5000);

  const TX_TIME_MS: Record<string, number> = {
    week: 7, '2weeks': 14, month: 30, '3months': 90, '6months': 180, year: 365,
  };
  const txCutoff = new Date(Date.now() - TX_TIME_MS[txTimeRange] * 86400000);
  const scopedTransactions = filterBySports(transactions, (tx) => [tx.sport]);
  const filteredTransactions = scopedTransactions
    .filter((tx) => new Date(tx.timestamp) >= txCutoff)
    .filter((tx) => txTeam === 'All Teams' || tx.sport === txTeam)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const txSports = [...new Set(scopedTransactions.map((t) => t.sport))].sort() as Sport[];

  const arrivingOrders = filterBySports(orders, (o) => [o.sport]).filter((o) => o.status !== 'complete');

  void (overdueReturns.length + lowInventory.length + ordersForApproval.length);

  return (
    <div>
      {/* Page sub-header + Quick Links on same row */}
      <div className="flex flex-wrap items-start justify-between gap-4" style={{ marginBottom: '0.5in' }}>
        <span className="font-semibold text-[28px] underline decoration-[#FFD200] decoration-2 underline-offset-4" style={{ color: '#00539F' }}>Dashboard</span>
        <div className="flex w-full flex-col items-end gap-1.5 min-w-0 md:w-auto">
          <span className="font-semibold text-[18px] self-start text-gray-500">Quick Links</span>
          <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap">
            <NotifBadge label="Low Inventory" count={lowInventory.length} color="bg-[#003c71]" onClick={() => setShowLowInventory(true)} />
            <NotifBadge label="New Open Status" count={ordersForApproval.length} color="bg-[#00539F]" onClick={() => setShowNewOpenStatus(true)} />
            <NotifBadge label="Overdue Returns" count={overdueReturns.length} color="bg-[#00a0df]" onClick={() => setShowOverdueReturns(true)} />
            <div className="relative">
              <button
                onClick={() => { setShowQuickSubmit(true); setQuickSubmitOrder(null); }}
                className="w-full h-full md:w-auto md:h-auto rounded-lg text-center transition-colors hover:opacity-90 cursor-pointer"
                style={{ padding: '0.1in', backgroundColor: '#FFD200', color: '#003c71' }}
              >
                <p className="text-2xl font-bold leading-none">+</p>
                <p className="text-xs mt-2 opacity-90 leading-tight">Quick Submit Order</p>
              </button>
              {orders.filter((o) => o.status !== 'complete' && !submittedOrderIds.has(o.id)).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00539F] text-white text-[11px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 pointer-events-none">
                  {orders.filter((o) => o.status !== 'complete' && !submittedOrderIds.has(o.id)).length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today — what needs attention right now */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <CalendarCheck className="w-4 h-4 text-[#00539F]" />
          <span className="text-sm font-semibold text-gray-700">Today</span>
        </div>
        {overdueReturns.length === 0 && lowInventory.length === 0 && ordersForApproval.length === 0 && arrivingOrders.length === 0 ? (
          <div className="px-4 py-4 flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> All caught up — nothing needs your attention.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {overdueReturns.length > 0 && (
              <button onClick={() => navigate('/returns')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-50">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="flex-1 text-sm text-gray-700">
                  <span className="font-semibold">{overdueReturns.length} return{overdueReturns.length !== 1 ? 's' : ''} overdue</span> — check gear back in
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            )}
            {lowInventory.length > 0 && (
              <button onClick={() => navigate('/reorder')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-50">
                <Package className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="flex-1 text-sm text-gray-700">
                  <span className="font-semibold">{lowInventory.length} item{lowInventory.length !== 1 ? 's' : ''} critically low</span> — review suggested reorder
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            )}
            {ordersForApproval.length > 0 && (
              <button onClick={() => { setShowQuickSubmit(true); setQuickSubmitOrder(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-50">
                <ShoppingCart className="w-4 h-4 text-[#00539F] shrink-0" />
                <span className="flex-1 text-sm text-gray-700">
                  <span className="font-semibold">{ordersForApproval.length} order{ordersForApproval.length !== 1 ? 's' : ''} awaiting action</span> — review and submit
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            )}
            {arrivingOrders.length > 0 && (
              <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-50">
                <Truck className="w-4 h-4 text-green-600 shrink-0" />
                <span className="flex-1 text-sm text-gray-700">
                  <span className="font-semibold">{arrivingOrders.length} order{arrivingOrders.length !== 1 ? 's' : ''} on the way</span> — mark items received as they arrive
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            )}
          </div>
        )}
      </div>

      {(visibleCharts.has('real-time') || visibleCharts.has('transaction-history')) && (
      <div className="flex flex-col gap-4 items-stretch lg:flex-row lg:flex-wrap">
        {/* Left column — charts */}
        {visibleCharts.has('real-time') && (
        <div className="flex-1 flex flex-row min-w-0 gap-4" style={{ minWidth: '280px' }}>
          {/* Real Time Inventory chart */}
          {visibleCharts.has('real-time') && (
          <div className="relative lg:flex-1 h-80 bg-white rounded-lg flex flex-col" style={removeMode ? { border: '3px solid #4B5563' } : { border: '1px solid #e5e7eb' }}>
            {removeMode && <RemoveOverlay onRemove={() => setVisibleCharts((v) => { const n = new Set(v); n.delete('real-time'); return n; })} />}
            <div className="flex items-center px-2 md:px-5 pb-4" style={{ paddingTop: '0.05in' }}>
              <span className="flex-1 text-sm font-semibold text-gray-700" style={{ padding: '0.08in 0.15in' }}>Real Time Inventory</span>
              <div className="flex rounded border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setChartView('qty')}
                  className={`text-xs transition-colors ${chartView === 'qty' ? 'bg-[#00539F] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  style={{ padding: '0.1in 0.1in' }}
                >
                  Qty
                </button>
                <button
                  onClick={() => setChartView('price')}
                  className={`text-xs transition-colors border-l border-gray-200 ${chartView === 'price' ? 'bg-[#00539F] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  style={{ padding: '0.1in 0.1in' }}
                >
                  Price
                </button>
              </div>
              <div className="flex-1 flex flex-col items-end gap-1 relative" style={{ paddingRight: '0.1in' }}>
                <button
                  onClick={() => setShowRTFilters((v) => !v)}
                  className={`text-xs border rounded text-center transition-colors ${showRTFilters ? 'bg-[#00539F] text-white border-[#00539F]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  style={{ padding: '0.03in', width: '3.5rem' }}
                >Filters</button>
                {showRTFilters && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-52 max-w-[calc(100vw-2rem)]">
                    <div className="border-b border-gray-100" style={{ padding: '0.12in 0.15in 0.08in' }}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Sport</p>
                      <select
                        value={chartSport}
                        onChange={(e) => setChartSport(e.target.value as Sport | 'All Sports')}
                        className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                      >
                        {isLead && <option value="All Sports">All Sports</option>}
                        {(isLead ? SPORTS.filter((s) => s !== 'All Sports') : accessibleSports).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ padding: '0.1in 0.15in' }}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Categories</p>
                      {['Top', 'Bottom', 'Outerwear', 'Footwear', 'Headwear', 'Equipment', 'Bag', 'Accessory'].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-[#00539F]" style={{ padding: '0.04in 0' }}>
                          <input
                            type="checkbox"
                            checked={selectedCats.has(cat)}
                            onChange={() => setSelectedCats((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; })}
                            className="rounded border-gray-300 accent-[#00539F]"
                          />
                          {cat}
                        </label>
                      ))}
                    </div>
                    <div className="border-t border-gray-100" style={{ padding: '0.08in 0.15in' }}>
                      <button onClick={() => { setChartSport('All Sports'); setSelectedCats(new Set(['Top', 'Bottom', 'Outerwear', 'Footwear', 'Headwear', 'Equipment', 'Bag', 'Accessory'])); }} className="text-xs text-[#00539F] hover:underline font-medium">Reset all</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-3 pb-2 flex-1" style={{ paddingTop: '0.2in' }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'qty' ? (
                  <BarChart data={inventoryChartData} margin={{ top: 2, right: 4, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Item', position: 'insideBottom', offset: -10, fontSize: 14, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} ticks={yTicks} domain={[0, yMax]} label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: 10, fontSize: 14, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="onHand" name="On-Hand" fill="#00539F" radius={[2, 2, 0, 0]} maxBarSize={30}>
                      <LabelList dataKey="onHand" content={(props) => <BarLabel {...(props as any)} />} />
                    </Bar>
                    <Bar dataKey="onOrder" name="On-Order" fill="#DAEAF5" stroke="#00539F" strokeWidth={1} radius={[2, 2, 0, 0]} maxBarSize={30}>
                      <LabelList dataKey="onOrder" content={(props) => <BarLabel {...(props as any)} insideColor="#003c71" />} />
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={priceChartData} margin={{ top: 2, right: 4, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Item', position: 'insideBottom', offset: -10, fontSize: 14, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} ticks={pTicks} domain={[0, pMax]} tickFormatter={(v) => `$${v.toLocaleString()}`} tickMargin={3} label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', offset: 7, fontSize: 14, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} />
                    <Bar dataKey="onHand" name="On-Hand" fill="#00539F" radius={[2, 2, 0, 0]} maxBarSize={30}>
                      <LabelList dataKey="onHand" content={(props) => <BarLabel {...(props as any)} formatter={(v) => `$${(v / 1000).toFixed(0)}k`} />} />
                    </Bar>
                    <Bar dataKey="onOrder" name="On-Order" fill="#DAEAF5" stroke="#00539F" strokeWidth={1} radius={[2, 2, 0, 0]} maxBarSize={30}>
                      <LabelList dataKey="onOrder" content={(props) => <BarLabel {...(props as any)} formatter={(v) => `$${(v / 1000).toFixed(0)}k`} insideColor="#003c71" />} />
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between" style={{ paddingBottom: '0.1in', paddingRight: '1rem', paddingLeft: '0.5rem' }}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#00539F' }} />
                  On-Hand
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#DAEAF5', border: '1px solid #00539F' }} />
                  On-Order
                </span>
              </div>
            </div>
          </div>
          )}

        </div>
        )}

        {/* Right column — transactions */}
        {visibleCharts.has('transaction-history') && (
        <div className="w-full lg:w-72 flex flex-col" style={{ minWidth: '240px' }}>
          <div className="relative bg-white rounded-lg flex flex-col flex-1 overflow-hidden" style={removeMode ? { border: '3px solid #4B5563' } : { border: '1px solid #e5e7eb' }}>
            {removeMode && <RemoveOverlay onRemove={() => setVisibleCharts((v) => { const n = new Set(v); n.delete('transaction-history'); return n; })} />}
            <div className="flex items-center justify-between border-b border-gray-100 shrink-0" style={{ padding: '0.05in' }}>
              <span className="text-sm font-semibold text-gray-700">Transaction History</span>
              <button
                onClick={() => setShowTxFilters((v) => !v)}
                className={`text-xs hover:underline ${showTxFilters ? 'text-[#003c71] font-semibold' : 'text-[#00539F]'}`}
              >View Transactions</button>
            </div>
            {showTxFilters && (
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Time Range</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(['week', '2weeks', 'month', '3months', '6months', 'year'] as const).map((r) => {
                    const labels = { week: 'This Wk', '2weeks': '2 Wks', month: '1 Mo', '3months': '3 Mo', '6months': '6 Mo', year: '1 Yr' };
                    return (
                      <button key={r} onClick={() => setTxTimeRange(r)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${txTimeRange === r ? 'bg-[#00539F] text-white border-[#00539F]' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                        {labels[r]}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Team</p>
                <select
                  value={txTeam}
                  onChange={(e) => setTxTeam(e.target.value as Sport | 'All Teams')}
                  className="w-full text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                >
                  <option value="All Teams">All Teams</option>
                  {txSports.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: '480px' }}>
              {filteredTransactions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No transactions in this period</p>
              ) : filteredTransactions.map((tx) => {
                const isAthlete = athletes.some((a) => a.id === tx.personId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ padding: '0.2in 0.1in 0.25rem' }}
                    onClick={() => navigate(isAthlete ? '/athletes' : '/staff')}
                    title={`View ${isAthlete ? 'athlete' : 'staff'} profile`}
                  >
                    <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{tx.items[0]?.description}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {tx.type === 'issue' ? 'Issued to' : 'Returned by'} {tx.personName}
                      </p>
                      <p className="text-[11px] font-medium truncate" style={{ color: '#003c71' }}>{tx.sport.split(',')[0]}</p>
                      <p className="text-[11px] text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>
      )}

      {(visibleCharts.has('budget') || visibleCharts.has('orders-arriving')) && (
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap" style={{ marginTop: '0.25in' }}>

      {/* Budget panel */}
      {visibleCharts.has('budget') && (
      <div className="relative lg:flex-1 h-80 bg-white rounded-lg flex flex-col" style={{ minWidth: '280px', ...(removeMode ? { border: '3px solid #4B5563' } : { border: '1px solid #e5e7eb' }) }}>
        {removeMode && <RemoveOverlay onRemove={() => setVisibleCharts((v) => { const n = new Set(v); n.delete('budget'); return n; })} />}
        <div className="flex items-center px-2 md:px-5" style={{ paddingTop: '0.05in', paddingBottom: '0.1in' }}>
          <span className="flex-1 text-sm font-semibold text-gray-700" style={{ padding: '0.08in 0.15in' }}>
            {budgetView === 'overview'
              ? `Budget${budgetSport !== 'All Sports' ? ` — ${budgetSport}` : ''}`
              : 'Budget — Expected vs. Actual'}
          </span>
          <div className="flex rounded border border-gray-200 overflow-hidden">
            <button
              onClick={() => setBudgetView('overview')}
              className={`text-xs transition-colors ${budgetView === 'overview' ? 'bg-[#00539F] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              style={{ padding: '0.1in 0.1in' }}
            >Overview</button>
            <button
              onClick={() => setBudgetView('monthly')}
              className={`text-xs transition-colors border-l border-gray-200 ${budgetView === 'monthly' ? 'bg-[#00539F] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              style={{ padding: '0.1in 0.1in' }}
            >Monthly</button>
          </div>
          <div className="flex-1 flex items-center justify-end relative" style={{ paddingRight: '0.1in' }}>
            {budgetView === 'overview' && (
              <>
                <button
                  onClick={() => setShowBudgetFilters((v) => !v)}
                  className={`text-base transition-colors px-2 py-1 ${
                    showBudgetFilters || budgetSport !== 'All Sports'
                      ? 'text-[#00539F]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {budgetSport}
                </button>
                {showBudgetFilters && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-52 max-w-[calc(100vw-2rem)] overflow-hidden">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest" style={{ padding: '0.12in 0.15in 0.06in' }}>Select Sport</p>
                    <div style={{ padding: '0 0 0.08in' }}>
                      {(isLead ? SPORTS : ['All Sports' as const, ...accessibleSports]).map((s) => (
                        <button
                          key={s}
                          onClick={() => { setBudgetSport(s); setShowBudgetFilters(false); }}
                          className={`w-full text-left text-sm transition-colors ${
                            budgetSport === s
                              ? 'bg-[#EFF6FF] text-[#00539F] font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          style={{ padding: '0.07in 0.15in' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="px-3 pb-2 flex-1" style={{ paddingTop: '0.2in' }}>
          <ResponsiveContainer width="100%" height="100%">
            {budgetView === 'overview' ? (
              <BarChart data={currentBudgetData} margin={{ top: 2, right: 4, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: budgetSport === 'All Sports' ? 'Sport' : 'Item', position: 'insideBottom', offset: -10, fontSize: 14, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} ticks={budgetTicks} domain={[0, budgetMax]} interval={0} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 14, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} />
                <Bar dataKey="budgeted" name="Budgeted" fill="#003c71" radius={[2, 2, 0, 0]} maxBarSize={30}>
                  <LabelList dataKey="budgeted" content={(props) => <BarLabel {...(props as any)} formatter={(v) => `$${(v / 1000).toFixed(0)}k`} />} />
                </Bar>
                <Bar dataKey="spent" name="Spent" fill="#DAEAF5" stroke="#00539F" strokeWidth={1} radius={[2, 2, 0, 0]} maxBarSize={30}>
                  <LabelList dataKey="spent" content={(props) => <BarLabel {...(props as any)} formatter={(v) => `$${(v / 1000).toFixed(0)}k`} insideColor="#003c71" />} />
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={monthlyBudgetData} margin={{ top: 2, right: 33, left: 10, bottom: 20 }}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Month', position: 'insideBottom', offset: -10, fontSize: 14, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} ticks={monthlyTicks} domain={[0, monthlyMax]} interval={0} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 14, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="expected" name="Expected" stroke="#00539F" strokeWidth={2} dot={{ r: 3, fill: '#00539F' }} strokeDasharray="5 3" connectNulls={false} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#00a0df" strokeWidth={2} dot={{ r: 3, fill: '#00a0df' }} connectNulls={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between" style={{ paddingBottom: '0.1in', paddingRight: '1rem', paddingLeft: '0.5rem' }}>
          <div className="flex items-center gap-3">
            {budgetView === 'overview' ? (
              <>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#003c71' }} />
                  Budgeted
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#DAEAF5', border: '1px solid #00539F' }} />
                  Spent
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: '#00539F' }} />
                  Expected
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="inline-block w-6 border-t-2" style={{ borderColor: '#00a0df' }} />
                  Actual
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Orders Arriving This Week */}
      {visibleCharts.has('orders-arriving') && (
      <div className="relative w-full lg:w-72 h-80 bg-white rounded-lg flex flex-col" style={{ minWidth: '240px', ...(removeMode ? { border: '3px solid #4B5563' } : { border: '1px solid #e5e7eb' }) }}>
        {removeMode && <RemoveOverlay onRemove={() => setVisibleCharts((v) => { const n = new Set(v); n.delete('orders-arriving'); return n; })} />}
        <div className="flex items-center justify-between border-b border-gray-100 shrink-0" style={{ padding: '0.05in' }}>
          <span className="text-sm font-semibold text-gray-700">Orders Arriving</span>
          <button onClick={() => navigate('/orders')} className="text-xs text-[#00539F] hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
          {arrivingOrders.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No pending orders</p>
          ) : arrivingOrders.map((order) => {
            const totalOrdered = order.lines.reduce((s, l) => s + l.qtyOrdered, 0);
            const totalReceived = order.lines.reduce((s, l) => s + l.qtyReceived, 0);
            const remaining = totalOrdered - totalReceived;
            return (
              <div
                key={order.id}
                className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ padding: '0.2in 0.1in 0.25rem' }}
                onClick={() => navigate('/orders')}
                title="View order details"
              >
                <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{order.refNumber}</p>
                  <p className="text-[11px] text-gray-400 truncate">{order.vendor}</p>
                  <p className="text-[11px] text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#DAEAF5] text-[#00539F]`}>
                    {order.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{remaining} left</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      </div>
      )}

      {/* Chart management toolbar */}
      <div className="flex items-center gap-3" style={{ marginTop: '0.5in' }}>
        <button
          onClick={() => { setShowAddChart(true); setRemoveMode(false); }}
          className="flex items-center gap-2 rounded-lg text-sm font-medium text-white transition-colors bg-[#00539F] hover:bg-[#003D75]"
          style={{ padding: '0.05in' }}
        >
          Add Chart
        </button>
        <button
          onClick={() => { setRemoveMode((v) => !v); setShowAddChart(false); }}
          className={`flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${removeMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
          style={{ padding: '0.05in' }}
        >
          {removeMode ? 'Done Removing' : 'Remove Chart'}
        </button>
      </div>

      {/* Add Chart modal */}
      {showAddChart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddChart(false); }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[calc(100vw-2rem)] max-w-[360px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Add Chart</h2>
              <button onClick={() => setShowAddChart(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {CHART_OPTIONS.map((opt) => {
                const isVisible = visibleCharts.has(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => { if (!isVisible) { setVisibleCharts((v) => { const n = new Set(v); n.add(opt.id); return n; }); } }}
                    disabled={isVisible}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${isVisible ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-default' : 'border-gray-200 text-gray-700 hover:bg-[#EFF6FF] hover:border-[#00539F]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isVisible && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium">Active</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Low Inventory modal */}
      {showLowInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowLowInventory(false)}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-[calc(100vw-2rem)] max-w-[360px] max-h-[520px]" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center shrink-0" style={{ padding: '0.1in', backgroundColor: '#003c71' }}>
              <h2 className="text-sm font-semibold text-white">Low Inventory</h2>
              <button onClick={() => setShowLowInventory(false)} className="absolute text-white hover:opacity-70" style={{ right: '0.1in' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: '0.05in' }}>
              {lowInventory.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No low inventory items</p>
              ) : (
                lowInventory.map((item) => (
                  <button key={item.id} onClick={() => { setShowLowInventory(false); navigate(`/inventory/${item.id}`); }} className="w-full text-left flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate" style={{ marginTop: '0.05in' }}>{item.description}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.category} · {item.sports.join(', ')}</p>
                    </div>
                    <p className="text-[11px] font-semibold shrink-0 rounded" style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.01in 0.03in' }}>{item.qtyOnHand} left</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Open Status modal */}
      {showNewOpenStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowNewOpenStatus(false)}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-[calc(100vw-2rem)] max-w-[360px] max-h-[520px]" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center shrink-0" style={{ padding: '0.1in', backgroundColor: '#003c71' }}>
              <h2 className="text-sm font-semibold text-white">New Open Status</h2>
              <button onClick={() => setShowNewOpenStatus(false)} className="absolute text-white hover:opacity-70" style={{ right: '0.1in' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: '0.05in' }}>
              {ordersForApproval.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No new open orders this week</p>
              ) : (
                ordersForApproval.map((order) => (
                  <button key={order.id} onClick={() => { setShowNewOpenStatus(false); navigate(`/orders/${order.id}`); }} className="w-full text-left flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate" style={{ marginTop: '0.05in' }}>{order.refNumber}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{order.vendor} · {order.sport}</p>
                    </div>
                    <p className="text-[11px] font-semibold shrink-0 rounded" style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.01in 0.03in' }}>Open</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overdue Returns modal */}
      {showOverdueReturns && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowOverdueReturns(false)}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-[calc(100vw-2rem)] max-w-[360px] max-h-[520px]" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center shrink-0" style={{ padding: '0.1in', backgroundColor: '#003c71' }}>
              <h2 className="text-sm font-semibold text-white">Overdue Returns</h2>
              <button onClick={() => setShowOverdueReturns(false)} className="absolute text-white hover:opacity-70" style={{ right: '0.1in' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: '0.05in' }}>
              {overdueReturns.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No overdue returns</p>
              ) : (
                overdueReturns.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate" style={{ marginTop: '0.05in' }}>{r.personName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{r.description}</p>
                    </div>
                    <p className="text-[11px] font-semibold shrink-0 rounded" style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.01in 0.03in' }}>Due {r.returnByDate}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Submit Order modal */}
      {showQuickSubmit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowQuickSubmit(false); setQuickSubmitOrder(null); } }}
        >
          <div className="bg-white shadow-2xl flex flex-col w-full h-full rounded-none md:w-[480px] md:h-auto md:max-h-[80vh] md:rounded-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {quickSubmitOrder ? (
              <>
                {/* Order detail header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
                  <button onClick={() => setQuickSubmitOrder(null)} className="text-gray-400 hover:text-gray-600 mr-1">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-sm font-semibold text-gray-800 flex-1 truncate">{quickSubmitOrder.refNumber}</h2>
                  <button onClick={() => { setShowQuickSubmit(false); setQuickSubmitOrder(null); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Order detail body */}
                <div className="p-5 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs mb-5">
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] font-semibold mb-0.5">Vendor</p>
                      <p className="text-gray-800 font-medium">{quickSubmitOrder.vendor}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] font-semibold mb-0.5">Sport</p>
                      <p className="text-gray-800 font-medium">{quickSubmitOrder.sport}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] font-semibold mb-0.5">Order Date</p>
                      <p className="text-gray-800 font-medium">{new Date(quickSubmitOrder.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] font-semibold mb-0.5">Created By</p>
                      <p className="text-gray-800 font-medium">{quickSubmitOrder.createdBy}</p>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="text-left py-2 font-semibold">Item</th>
                        <th className="text-right py-2 font-semibold">Ordered</th>
                        <th className="text-right py-2 font-semibold">Received</th>
                        <th className="text-right py-2 font-semibold">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickSubmitOrder.lines.map((line, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 text-gray-800">{line.description}</td>
                          <td className="py-2 text-right text-gray-600">{line.qtyOrdered}</td>
                          <td className="py-2 text-right text-gray-600">{line.qtyReceived}</td>
                          <td className="py-2 text-right font-medium" style={{ color: line.qtyOrdered - line.qtyReceived > 0 ? '#b45309' : '#15803d' }}>
                            {line.qtyOrdered - line.qtyReceived}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Submit footer */}
                <div className="flex items-center justify-end px-5 py-3 border-t border-gray-100 shrink-0">
                  <button
                    onClick={() => {
                      recordSubmission(quickSubmitOrder, user?.name ?? 'Unknown');
                      setSubmittedOrderIds((prev) => new Set([...prev, quickSubmitOrder.id]));
                      setShowQuickSubmit(false);
                      setQuickSubmitOrder(null);
                      setShowOrderSubmitted(true);
                      setTimeout(() => setShowOrderSubmitted(false), 3000);
                    }}
                    className="text-sm font-medium text-white rounded-lg transition-colors bg-[#00539F] hover:bg-[#003D75]"
                    style={{ padding: '0.05in' }}
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Order list header */}
                <div className="relative flex items-center justify-center shrink-0" style={{ padding: '0.1in', paddingTop: 'calc(env(safe-area-inset-top) + 0.1in)', backgroundColor: '#003c71' }}>
                  <h2 className="text-sm font-semibold text-white">Quick Submit Order</h2>
                  <button onClick={() => setShowQuickSubmit(false)} className="absolute text-white hover:opacity-70" style={{ right: '0.1in' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Order list body */}
                <div className="flex-1 overflow-y-auto" style={{ padding: '0.05in' }}>
                  {orders.filter((o) => o.status === 'submitted' && !submittedOrderIds.has(o.id)).map((order) => (
                    <div key={order.id} className="w-full text-left p-3 flex items-center gap-3 border-b border-gray-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate" style={{ marginTop: '0.05in' }}>{order.refNumber}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{order.vendor} · {order.sport}</p>
                      </div>
                      <button
                        onClick={() => setQuickSubmitOrder(order)}
                        className="text-[10px] font-semibold rounded shrink-0"
                        style={{ backgroundColor: '#FFD200', color: '#003c71', padding: '0.05in' }}
                      >
                        Review & Submit
                      </button>
                    </div>
                  ))}
                  {orders.filter((o) => o.status === 'submitted' && !submittedOrderIds.has(o.id)).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-8">No orders ready to submit</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Submitted toast */}
      {showOrderSubmitted && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: '#003c71' }}>
          <svg width="16" height="16" fill="none" stroke="#FFD200" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
          Order Submitted
        </div>
      )}
    </div>
  );
}
