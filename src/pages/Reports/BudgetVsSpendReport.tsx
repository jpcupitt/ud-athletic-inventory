import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ChevronLeft } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';

const BUDGET_DATA = [
  { sport: "Basketball, Men's",    budgeted: 120000, spent: 87000 },
  { sport: "Basketball, Women's",  budgeted: 110000, spent: 72000 },
  { sport: 'Baseball',             budgeted: 85000,  spent: 61000 },
  { sport: 'Football',             budgeted: 200000, spent: 155000 },
  { sport: 'Field Hockey',         budgeted: 70000,  spent: 48000 },
  { sport: 'Softball',             budgeted: 65000,  spent: 39000 },
  { sport: "Soccer, Men's",        budgeted: 75000,  spent: 52000 },
  { sport: "Soccer, Women's",      budgeted: 75000,  spent: 47000 },
  { sport: "Lacrosse, Men's",      budgeted: 60000,  spent: 41000 },
  { sport: "Lacrosse, Women's",    budgeted: 60000,  spent: 38000 },
  { sport: 'Volleyball',           budgeted: 55000,  spent: 32000 },
  { sport: 'Cross Country',        budgeted: 30000,  spent: 18000 },
  { sport: 'Track & Field, Indoor', budgeted: 40000, spent: 27000 },
  { sport: 'Track & Field, Outdoor', budgeted: 40000, spent: 29000 },
  { sport: "Swimming & Diving, Men's", budgeted: 35000, spent: 22000 },
  { sport: "Swimming & Diving, Women's", budgeted: 35000, spent: 24000 },
  { sport: "Tennis, Men's",        budgeted: 28000,  spent: 19000 },
  { sport: "Tennis, Women's",      budgeted: 28000,  spent: 21000 },
  { sport: 'Ice Hockey',           budgeted: 90000,  spent: 68000 },
  { sport: 'Rowing',               budgeted: 45000,  spent: 31000 },
  { sport: "Golf, Men's",          budgeted: 22000,  spent: 15000 },
  { sport: "Golf, Women's",        budgeted: 22000,  spent: 14000 },
];

const abbrev = (s: string) =>
  s.replace(", Men's", " (M)").replace(", Women's", " (W)")
   .replace('Track & Field, ', 'T&F ').replace('Swimming & Diving, ', 'Swim ');

type View = 'chart' | 'table';

export default function BudgetVsSpendReport() {
  const [view, setView] = useState<View>('chart');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const { items, archivedIds } = useInventory();
  const { isLead, accessibleSports } = useSportsAccess();

  const scopedBudgetData = useMemo(
    () => isLead ? BUDGET_DATA : BUDGET_DATA.filter((d) => accessibleSports.includes(d.sport as never)),
    [isLead, accessibleSports]
  );

  const totalBudgeted = scopedBudgetData.reduce((s, d) => s + d.budgeted, 0);
  const totalSpent = scopedBudgetData.reduce((s, d) => s + d.spent, 0);
  const remaining = totalBudgeted - totalSpent;
  const pctUsed = Math.round((totalSpent / totalBudgeted) * 100);

  const chartData = scopedBudgetData.map((d) => ({
    name: abbrev(d.sport),
    sport: d.sport,
    Budgeted: d.budgeted,
    Spent: d.spent,
  }));

  const sportBudget = useMemo(
    () => selectedSport ? BUDGET_DATA.find((d) => d.sport === selectedSport) : null,
    [selectedSport]
  );

  const sportInventory = useMemo(() => {
    if (!selectedSport) return [];
    return items
      .filter((i) => !archivedIds.has(i.id) && i.sports.includes(selectedSport as never))
      .map((i) => ({ name: i.description.length > 22 ? i.description.slice(0, 22) + '…' : i.description, 'On Hand': i.qtyOnHand, 'On Order': i.qtyOnOrder }));
  }, [selectedSport, items, archivedIds]);

  const drillInto = (sport: string) => {
    setSelectedSport(sport);
    setView('chart');
  };

  /* ── Sport drill-down view ─────────────────────────── */
  if (selectedSport && sportBudget) {
    const rem = sportBudget.budgeted - sportBudget.spent;
    const pct = Math.round((sportBudget.spent / sportBudget.budgeted) * 100);
    const budgetChartData = [
      { name: 'Budget', Budgeted: sportBudget.budgeted, Spent: sportBudget.spent },
    ];

    return (
      <div className="flex flex-col" style={{ gap: '0.1in' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSport(null)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{selectedSport}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(['chart', 'table'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs rounded capitalize font-medium ${view === v ? 'bg-[#002855] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={{ padding: '0.05in 0.12in' }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Sport budget summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Budgeted', value: `$${sportBudget.budgeted.toLocaleString()}`, color: 'text-[#002855]' },
            { label: 'Spent', value: `$${sportBudget.spent.toLocaleString()}`, color: 'text-[#002855]' },
            { label: 'Remaining', value: `${rem >= 0 ? '' : '-'}$${Math.abs(rem).toLocaleString()}`, color: rem >= 0 ? 'text-green-600' : 'text-red-600' },
            { label: '% Used', value: `${pct}%`, color: pct >= 100 ? 'text-red-600' : pct >= 90 ? 'text-amber-600' : 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {view === 'chart' ? (
          <>
            {/* Budget vs Spend chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in' }}>
              <p className="text-sm font-semibold text-gray-700 mb-3">Budget vs. Spend</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={budgetChartData} margin={{ top: 10, right: 16, left: 60, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="Budgeted" fill="#DAEAF5" stroke="#00539F" strokeWidth={1} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Spent" fill="#00539F" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory bar chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in' }}>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Inventory ({sportInventory.length} item{sportInventory.length !== 1 ? 's' : ''})
              </p>
              {sportInventory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No inventory items for this sport.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, sportInventory.length * 36)}>
                  <BarChart data={sportInventory} layout="vertical" margin={{ top: 4, right: 40, left: 160, bottom: 4 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={155} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="On Hand" fill="#00539F" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="On Order" fill="#DAEAF5" stroke="#00539F" strokeWidth={1} radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Budget table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs text-gray-500">
                    <th className="px-4 py-3 font-medium">Budgeted</th>
                    <th className="px-4 py-3 font-medium">Spent</th>
                    <th className="px-4 py-3 font-medium">Remaining</th>
                    <th className="px-4 py-3 font-medium">% Used</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={pct >= 100 ? 'bg-red-50' : pct >= 90 ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 text-gray-800 font-medium">${sportBudget.budgeted.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">${sportBudget.spent.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-medium ${rem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rem >= 0 ? '' : '-'}${Math.abs(rem).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 font-medium ${pct >= 100 ? 'text-red-600' : pct >= 90 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {pct}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-400' : 'bg-[#00539F]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs text-gray-500">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium text-right">On Hand</th>
                    <th className="px-4 py-3 font-medium text-right">On Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sportInventory.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No inventory items for this sport.</td></tr>
                  ) : sportInventory.map((row) => (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{row.name}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">{row['On Hand']}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{row['On Order'] > 0 ? row['On Order'] : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Overview ──────────────────────────────────────── */
  return (
    <div className="flex flex-col" style={{ gap: '0.1in' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Budget vs. Spend</h1>
        <div className="flex items-center gap-2">
          {(['chart', 'table'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs rounded capitalize font-medium ${view === v ? 'bg-[#002855] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={{ padding: '0.05in 0.12in' }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Budgeted', value: `$${(totalBudgeted / 1000).toFixed(0)}K`, color: 'text-[#002855]' },
          { label: 'Total Spent', value: `$${(totalSpent / 1000).toFixed(0)}K`, color: 'text-[#002855]' },
          { label: 'Remaining', value: `$${(remaining / 1000).toFixed(0)}K`, color: remaining >= 0 ? 'text-green-600' : 'text-red-600' },
          { label: '% Used', value: `${pctUsed}%`, color: pctUsed > 90 ? 'text-red-600' : pctUsed > 75 ? 'text-amber-600' : 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {view === 'chart' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in' }}>
          <p className="text-xs text-gray-400 mb-2">Click a sport to drill down</p>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 60, bottom: 80 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend verticalAlign="top" />
              <Bar dataKey="Budgeted" fill="#DAEAF5" stroke="#00539F" strokeWidth={1} radius={[2, 2, 0, 0]} cursor="pointer" onClick={(d: any) => drillInto(d.sport)} />
              <Bar dataKey="Spent" fill="#00539F" radius={[2, 2, 0, 0]} cursor="pointer" onClick={(d: any) => drillInto(d.sport)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Sport</th>
                <th className="px-4 py-3 font-medium text-right">Budgeted</th>
                <th className="px-4 py-3 font-medium text-right">Spent</th>
                <th className="px-4 py-3 font-medium text-right">Remaining</th>
                <th className="px-4 py-3 font-medium text-right">% Used</th>
                <th className="px-4 py-3 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scopedBudgetData.map((row) => {
                const rem = row.budgeted - row.spent;
                const pct = Math.round((row.spent / row.budgeted) * 100);
                return (
                  <tr key={row.sport} className={`cursor-pointer hover:bg-blue-50 ${pct >= 100 ? 'bg-red-50' : pct >= 90 ? 'bg-amber-50' : ''}`} onClick={() => setSelectedSport(row.sport)}>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.sport}</td>
                    <td className="px-4 py-3 text-right text-gray-600">${row.budgeted.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">${row.spent.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${rem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rem >= 0 ? '' : '-'}${Math.abs(rem).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${pct >= 100 ? 'text-red-600' : pct >= 90 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {pct}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-400' : 'bg-[#00539F]'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-300 bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">Totals</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">${totalBudgeted.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">${totalSpent.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remaining.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">{pctUsed}%</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
