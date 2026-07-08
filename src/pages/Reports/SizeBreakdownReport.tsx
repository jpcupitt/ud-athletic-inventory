import { useState, useMemo } from 'react';
import { useAthletes } from '../../context/AthletesContext';
import { useStaff } from '../../context/StaffContext';
import type { Sport } from '../../data/types';

const ALL_SPORTS: Sport[] = [
  'Baseball', "Basketball, Men's", "Basketball, Women's", 'Cross Country', 'Field Hockey',
  'Football', "Golf, Men's", "Golf, Women's", 'Ice Hockey', "Lacrosse, Men's", "Lacrosse, Women's",
  'Rowing', "Soccer, Men's", "Soccer, Women's", 'Softball', "Swimming & Diving, Men's",
  "Swimming & Diving, Women's", "Tennis, Men's", "Tennis, Women's", 'Track & Field, Indoor',
  'Track & Field, Outdoor', 'Volleyball',
];

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

type SizeType = 'shirt' | 'shorts' | 'shoe';

function countSizes(values: (string | undefined)[]): Record<string, number> {
  const counts: Record<string, number> = {};
  values.forEach((v) => {
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  });
  return counts;
}

function SizeBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-12 text-right">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
        <div className="h-full bg-[#00539F] rounded" style={{ width: `${pct}%` }} />
        <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white mix-blend-luminosity">
          {count}
        </span>
      </div>
      <span className="text-xs text-gray-400 w-8">{count}</span>
    </div>
  );
}

export default function SizeBreakdownReport() {
  const { athletes } = useAthletes();
  const { staff } = useStaff();
  const [sportFilter, setSportFilter] = useState<Sport | 'All Sports'>('All Sports');
  const [typeFilter, setTypeFilter] = useState<'all' | 'athlete' | 'staff'>('all');
  const [sizeType, setSizeType] = useState<SizeType>('shirt');

  const filteredAthletes = useMemo(
    () => typeFilter === 'staff' ? [] : athletes.filter((a) =>
      sportFilter === 'All Sports' || a.sports.includes(sportFilter as Sport)
    ),
    [athletes, sportFilter, typeFilter]
  );

  const filteredStaff = useMemo(
    () => typeFilter === 'athlete' ? [] : staff.filter((s) =>
      sportFilter === 'All Sports' || s.sports.includes(sportFilter as Sport)
    ),
    [staff, sportFilter, typeFilter]
  );

  const allPeople = [...filteredAthletes, ...filteredStaff];

  const sizeValues = useMemo(() => {
    return allPeople.map((p) => {
      if (sizeType === 'shirt') return p.shirtSize;
      if (sizeType === 'shorts') return p.shortsSize;
      return p.shoeSize;
    });
  }, [allPeople, sizeType]);

  const counts = countSizes(sizeValues);
  const maxCount = Math.max(...Object.values(counts), 1);

  const knownSizes = SIZE_ORDER.filter((s) => counts[s]);
  const otherSizes = Object.keys(counts).filter((s) => !SIZE_ORDER.includes(s)).sort();
  const allSizes = [...knownSizes, ...otherSizes];

  const totalWithSize = sizeValues.filter(Boolean).length;
  const totalWithout = sizeValues.length - totalWithSize;

  const tableRows = useMemo(() => {
    return allPeople.map((p) => ({
      name: `${p.firstName} ${p.lastName}`,
      type: 'athleteId' in p ? 'Athlete' : 'Staff',
      sport: p.sports[0] ?? '—',
      shirtSize: p.shirtSize ?? '—',
      shortsSize: p.shortsSize ?? '—',
      shoeSize: p.shoeSize ?? '—',
    }));
  }, [allPeople]);

  return (
    <div className="flex flex-col" style={{ gap: '0.1in' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Size Breakdown</h1>
        <span className="text-sm text-gray-400">{allPeople.length} person{allPeople.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value as Sport | 'All Sports')}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#00539F] bg-white"
        >
          <option value="All Sports">All Sports</option>
          {ALL_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
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
        <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
          {(['shirt', 'shorts', 'shoe'] as SizeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setSizeType(t)}
              className={`px-3 py-1 text-xs rounded capitalize transition-colors ${sizeType === t ? 'bg-white text-[#003c71] font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Size distribution chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 capitalize">{sizeType} Size Distribution</h2>
          {allSizes.length === 0 ? (
            <p className="text-sm text-gray-400">No size data available for this filter.</p>
          ) : (
            <div className="space-y-2">
              {allSizes.map((size) => (
                <SizeBar key={size} label={size} count={counts[size]} max={maxCount} />
              ))}
            </div>
          )}
          {totalWithout > 0 && (
            <p className="text-xs text-gray-400 mt-3">{totalWithout} person{totalWithout !== 1 ? 's' : ''} with no {sizeType} size on file</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col" style={{ gap: '0.1in' }}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total People</dt>
                <dd className="font-medium text-gray-800">{allPeople.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">With {sizeType} size on file</dt>
                <dd className="font-medium text-gray-800">{totalWithSize}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Missing size</dt>
                <dd className={`font-medium ${totalWithout > 0 ? 'text-amber-600' : 'text-green-600'}`}>{totalWithout}</dd>
              </div>
              {allSizes.length > 0 && (
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <dt className="text-gray-500">Most common</dt>
                  <dd className="font-medium text-gray-800">
                    {allSizes.sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))[0]}
                    {' '}({counts[allSizes.sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))[0]]} people)
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Size counts table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Count by Size</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium text-right">Count</th>
                  <th className="pb-2 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allSizes.map((size) => (
                  <tr key={size}>
                    <td className="py-1.5 font-medium text-gray-800">{size}</td>
                    <td className="py-1.5 text-right text-gray-600">{counts[size]}</td>
                    <td className="py-1.5 text-right text-gray-500">
                      {totalWithSize > 0 ? Math.round((counts[size] / totalWithSize) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Individual Records</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Sport</th>
              <th className="px-4 py-3 font-medium">Shirt</th>
              <th className="px-4 py-3 font-medium">Shorts</th>
              <th className="px-4 py-3 font-medium">Shoe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableRows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No records found.</td></tr>
            ) : (
              tableRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{row.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${row.type === 'Athlete' ? 'bg-[#DAEAF5] text-[#00539F]' : 'bg-gray-100 text-gray-600'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{row.sport}</td>
                  <td className="px-4 py-2.5 text-gray-700">{row.shirtSize}</td>
                  <td className="px-4 py-2.5 text-gray-700">{row.shortsSize}</td>
                  <td className="px-4 py-2.5 text-gray-700">{row.shoeSize}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
