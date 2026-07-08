import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, RotateCcw, Plus } from 'lucide-react';
import { useAthletes } from '../../context/AthletesContext';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import IssueModal from '../../components/IssueModal';
import type { IssuedItem } from '../../data/types';

export default function AthleteProfile() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const { athletes, issueToAthlete, returnFromAthlete } = useAthletes();
  const { returnItem } = useInventory();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [showIssueModal, setShowIssueModal] = useState(false);

  const athlete = athletes.find((a) => a.id === athleteId);

  if (!athlete) {
    return (
      <div className="space-y-4">
        <Link to="/athletes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Athletes
        </Link>
        <p className="text-gray-500">Athlete not found.</p>
      </div>
    );
  }

  const activeItems = athlete.issuedItems.filter((i) => !i.returned);
  const returnedItems = athlete.issuedItems.filter((i) => i.returned);
  const totalValue = activeItems.reduce((s, i) => s + i.qty * i.pricePerUnit, 0);

  function handleIssue(item: IssuedItem) {
    issueToAthlete(athlete!.id, item);
  }

  function handleReturn(itemId: string, qty: number) {
    returnFromAthlete(athlete!.id, itemId);
    returnItem(itemId, qty);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link to="/athletes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Athletes
        </Link>
        {isManager && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-1.5 text-[#003c71] font-semibold text-sm rounded-md"
            style={{ backgroundColor: '#FFD200', padding: '0.04in 0.12in' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Items
          </button>
        )}
      </div>

      {/* Header card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          {athlete.photoUrl ? (
            <img src={athlete.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#00539F] flex items-center justify-center text-white text-xl font-bold shrink-0">
              {athlete.firstName[0]}{athlete.lastName[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{athlete.firstName} {athlete.lastName}</h1>
            <p className="text-gray-500 mt-0.5">{athlete.year}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {athlete.sports.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-[#DAEAF5] text-[#00539F] rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400">gear value out</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-5 border-t border-gray-100">
          <div>
            <dt className="text-gray-400 text-xs uppercase tracking-wide">Athlete ID</dt>
            <dd className="mt-1 font-mono font-medium text-gray-800">{athlete.athleteId}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs uppercase tracking-wide">Barcode</dt>
            <dd className="mt-1 font-mono font-medium text-gray-800">{athlete.barcode}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs uppercase tracking-wide">Items Out</dt>
            <dd className="mt-1 font-medium text-gray-800">{activeItems.length}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs uppercase tracking-wide">Sizes</dt>
            <dd className="mt-1 text-gray-600 text-xs leading-5">
              {athlete.shirtSize && <div>Shirt: {athlete.shirtSize}</div>}
              {athlete.shortsSize && <div>Shorts: {athlete.shortsSize}</div>}
              {athlete.shoeSize && <div>Shoe: {athlete.shoeSize}</div>}
              {!athlete.shirtSize && !athlete.shortsSize && !athlete.shoeSize && '—'}
            </dd>
          </div>
        </dl>

        {athlete.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700">{athlete.notes}</p>
          </div>
        )}
      </div>

      {/* Currently issued */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          Currently Issued ({activeItems.length})
        </h2>
        {activeItems.length === 0 ? (
          <p className="text-sm text-gray-400">No items currently issued.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Unit Price</th>
                <th className="pb-2 font-medium">Issued</th>
                <th className="pb-2 font-medium">Return By</th>
                <th className="pb-2 font-medium">Type</th>
                {isManager && <th className="pb-2 font-medium"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeItems.map((item, i) => (
                <tr key={i}>
                  <td className="py-2.5 font-medium text-gray-800">{item.description}</td>
                  <td className="py-2.5 text-right text-gray-600">{item.qty}</td>
                  <td className="py-2.5 text-right text-gray-600">${item.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2.5 text-gray-500">{item.issuedDate}</td>
                  <td className="py-2.5">
                    {item.returnByDate ? (
                      <span className={new Date(item.returnByDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {item.returnByDate}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2.5">
                    {item.isNonExpendable ? (
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Non-Exp</span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Expendable</span>
                    )}
                  </td>
                  {isManager && (
                    <td className="py-2.5">
                      <button
                        onClick={() => handleReturn(item.itemId, item.qty)}
                        className="flex items-center gap-1 text-xs text-[#00539F] hover:text-[#003D75] font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Return
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200">
              <tr>
                <td className="pt-3 text-sm font-semibold text-gray-700">Total Value</td>
                <td colSpan={isManager ? 6 : 5} className="pt-3 text-right font-semibold text-gray-800">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Returned items */}
      {returnedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-gray-400" />
            Returned Items ({returnedItems.length})
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {returnedItems.map((item, i) => (
                <tr key={i} className="opacity-60">
                  <td className="py-2 text-gray-600">{item.description}</td>
                  <td className="py-2 text-right text-gray-500">{item.qty}</td>
                  <td className="py-2 text-gray-400">{item.issuedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showIssueModal && (
        <IssueModal
          personName={`${athlete.firstName} ${athlete.lastName}`}
          onClose={() => setShowIssueModal(false)}
          onIssue={handleIssue}
        />
      )}
    </div>
  );
}
