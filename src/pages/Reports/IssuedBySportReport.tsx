import { useState, useMemo } from 'react';
import { useAthletes } from '../../context/AthletesContext';
import { useStaff } from '../../context/StaffContext';
import { useSportsAccess } from '../../hooks/useSportsAccess';
import type { Sport } from '../../data/types';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];

export default function IssuedBySportReport() {
  const { athletes: allAthletes } = useAthletes();
  const { staff: allStaff } = useStaff();
  const { isLead, filterBySports, accessibleSports } = useSportsAccess();
  const athletes = useMemo(() => filterBySports(allAthletes, (a) => a.sports as string[]), [allAthletes, filterBySports]);
  const staff = useMemo(() => filterBySports(allStaff, (s) => s.sports as string[]), [allStaff, filterBySports]);
  const defaultSport = isLead ? 'All Sports' : (accessibleSports[0] ?? 'All Sports') as Sport | 'All Sports';
  const [sportFilter, setSportFilter] = useState<Sport | 'All Sports'>(defaultSport);
  const [typeFilter, setTypeFilter] = useState<'all' | 'athlete' | 'staff'>('all');

  interface Row {
    personId: string;
    personName: string;
    type: 'Athlete' | 'Staff';
    sport: string;
    description: string;
    qty: number;
    pricePerUnit: number;
    issuedDate: string;
    isNonExpendable: boolean;
    returned: boolean;
    returnByDate?: string;
  }

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];

    if (typeFilter !== 'staff') {
      athletes.forEach((a) => {
        a.issuedItems.forEach((item) => {
          const sport = a.sports[0] ?? '';
          if (sportFilter !== 'All Sports' && sport !== sportFilter) return;
          result.push({
            personId: a.id,
            personName: `${a.firstName} ${a.lastName}`,
            type: 'Athlete',
            sport,
            description: item.description,
            qty: item.qty,
            pricePerUnit: item.pricePerUnit,
            issuedDate: item.issuedDate,
            isNonExpendable: item.isNonExpendable,
            returned: item.returned,
            returnByDate: item.returnByDate,
          });
        });
      });
    }

    if (typeFilter !== 'athlete') {
      staff.forEach((s) => {
        s.issuedItems.forEach((item) => {
          const sport = s.sports[0] ?? '';
          if (sportFilter !== 'All Sports' && sport !== sportFilter) return;
          result.push({
            personId: s.id,
            personName: `${s.firstName} ${s.lastName}`,
            type: 'Staff',
            sport,
            description: item.description,
            qty: item.qty,
            pricePerUnit: item.pricePerUnit,
            issuedDate: item.issuedDate,
            isNonExpendable: item.isNonExpendable,
            returned: item.returned,
            returnByDate: item.returnByDate,
          });
        });
      });
    }

    return result.sort((a, b) => a.sport.localeCompare(b.sport));
  }, [athletes, staff, sportFilter, typeFilter]);

  const activeRows = rows.filter((r) => !r.returned);
  const totalValue = activeRows.reduce((s, r) => s + r.qty * r.pricePerUnit, 0);
  const nonExpCount = activeRows.filter((r) => r.isNonExpendable).length;

  return (
    <div className="flex flex-col gap-2 md:gap-[0.1in]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Issued Items by Sport</h1>
        <span className="text-sm text-gray-400">{activeRows.length} active issue{activeRows.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Active Issues</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#002855' }}>{activeRows.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Must-Return Items Out</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{nonExpCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ padding: '0.15in 0.2in' }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Estimated Value Out</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#002855' }}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'athlete' | 'staff')}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
        >
          <option value="all">Athletes & Staff</option>
          <option value="athlete">Athletes Only</option>
          <option value="staff">Staff Only</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-orange-200 inline-block border border-orange-400" />
          Must be returned
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Sport</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Unit Price</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Return By</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">No items currently issued.</td>
              </tr>
            ) : (
              activeRows.map((row, i) => (
                <tr key={i} className={row.isNonExpendable ? 'bg-orange-50' : ''}>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.personName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${row.type === 'Athlete' ? 'bg-[#DAEAF5] text-[#00539F]' : 'bg-gray-100 text-gray-600'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.sport}</td>
                  <td className="px-4 py-3 text-gray-800">{row.description}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{row.qty}</td>
                  <td className="px-4 py-3 text-right text-gray-600">${row.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.issuedDate}</td>
                  <td className="px-4 py-3 text-xs">
                    {row.returnByDate ? (
                      <span className={new Date(row.returnByDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {row.returnByDate}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {row.isNonExpendable ? (
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Non-Exp</span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Expendable</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {activeRows.length > 0 && (
            <tfoot className="border-t-2 border-gray-300 bg-gray-50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700">Totals</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                  {activeRows.reduce((s, r) => s + r.qty, 0)}
                </td>
                <td className="px-4 py-3" />
                <td colSpan={2} className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-semibold text-gray-800">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          )}
        </table>
        </div>
      </div>
    </div>
  );
}
