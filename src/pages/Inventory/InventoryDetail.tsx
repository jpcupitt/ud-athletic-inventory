import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Tag, AlertTriangle, QrCode, Printer, Camera, Upload, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useAthletes } from '../../context/AthletesContext';
import { useStaff } from '../../context/StaffContext';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../../components/WebcamCapture';
import { recertDueDate, recertStatus, RECERT_STATUS_STYLE } from '../../utils/recert';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${checked ? 'bg-[#00539F]' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function InventoryDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const { items, setNonExpendable, setPhoto, markRecertified } = useInventory();
  const { athletes } = useAthletes();
  const { staff: staffMembers } = useStaff();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const canSeeCosts = user?.role !== 'student_manager';
  const item = items.find((i) => i.id === itemId);

  const [qrUrl, setQrUrl] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && item) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        // Camera photos can be 10+ MP; downscale so the stored data URL stays small
        const img = new Image();
        img.onload = () => {
          const max = 1024;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          if (scale === 1) {
            setPhoto(item.id, src);
            return;
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhoto(item.id, canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => setPhoto(item.id, src);
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }
  useEffect(() => {
    if (!item) return;
    QRCode.toDataURL(`EQI:ITEM:${item.id}`, { width: 480, margin: 1, color: { dark: '#003c71', light: '#ffffff' } })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) {
    return (
      <div className="space-y-4">
        <Link to="/inventory" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Inventory
        </Link>
        <p className="text-gray-500">Item not found.</p>
      </div>
    );
  }

  // Issued records store the inventory row id in `itemId`, so match against item.id.
  const issuedTo = [
    ...athletes.flatMap((a) =>
      a.issuedItems
        .filter((i) => i.itemId === item.id && !i.returned)
        .map((i) => ({ name: `${a.lastName}, ${a.firstName}`, type: 'Athlete' as const, id: a.id, ...i }))
    ),
    ...staffMembers.flatMap((s) =>
      s.issuedItems
        .filter((i) => i.itemId === item.id && !i.returned)
        .map((i) => ({ name: `${s.lastName}, ${s.firstName}`, type: 'Staff' as const, id: s.id, ...i }))
    ),
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/inventory" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {item.photoUrl ? (
              <div className="w-14 h-14 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                <img src={item.photoUrl} alt={item.description} className="w-14 h-14 object-cover rounded-lg" />
              </div>
            ) : isManager ? (
              <>
                {/* Desktop: webcam capture + file upload */}
                <div className="hidden md:flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    title="Take Photo"
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#00539F] hover:text-[#00539F] transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <label
                    title="Upload Photo"
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#00539F] hover:text-[#00539F] transition-colors cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
                {/* Mobile: one tap opens the native camera / photo library chooser */}
                <label
                  title="Add Photo"
                  className="md:hidden w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 active:border-[#00539F] active:text-[#00539F] transition-colors cursor-pointer shrink-0"
                >
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                </label>
              </>
            ) : (
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-7 h-7 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{item.description}</h1>
              <p className="text-sm text-gray-500 mt-0.5 font-mono">{item.itemId}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.sports.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-[#DAEAF5] text-[#00539F] rounded text-xs">{s}</span>
                ))}
                {item.isNonExpendable && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Must Return</span>
                )}
                {item.isSerialized && (
                  <span className="px-2 py-0.5 bg-[#003c71] text-white rounded text-xs">Tracked by Serial #</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-800">{item.qtyOnHand}</p>
            <p className="text-xs text-gray-400">on hand</p>
            {item.qtyOnOrder > 0 && (
              <>
                <p className="text-lg font-semibold text-amber-600 mt-1">{item.qtyOnOrder}</p>
                <p className="text-xs text-gray-400">on order</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" /> Item Details
          </h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Manufacturer', item.manufacturer],
              ['Model', item.model],
              ['Category', item.category],
              ['Unit', item.unit],
              ['Year', item.year],
              canSeeCosts ? ['Price / Unit', `$${item.pricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`] : null,
              item.returnByDate ? ['Return By', item.returnByDate] : null,
            ]
              .filter(Boolean)
              .map(([label, value]: any) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-800 text-right">{value}</dd>
                </div>
              ))}
            {isManager && (
              <div className="flex justify-between gap-4 items-center pt-2 mt-1 border-t border-gray-100">
                <dt className="text-gray-500">Non-Expendable (must be returned)</dt>
                <dd><Toggle checked={item.isNonExpendable} onChange={(v) => setNonExpendable(item.id, v)} /></dd>
              </div>
            )}
          </dl>
          {item.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-700">{item.notes}</p>
            </div>
          )}
        </div>

        {/* Serial numbers */}
        {item.isSerialized && item.serialNumbers && item.serialNumbers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Serial Numbers</h2>
            <ul className="space-y-1">
              {item.serialNumbers.map((sn) => (
                <li key={sn} className="font-mono text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded">{sn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recertification */}
        {item.recertification && item.recertification.units.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" /> Recertification
            </h2>
            <ul className="space-y-2">
              {item.recertification.units.map((unit) => {
                const status = recertStatus(unit, item.recertification!);
                const due = recertDueDate(unit, item.recertification!).toISOString().slice(0, 10);
                const style = RECERT_STATUS_STYLE[status];
                return (
                  <li key={unit.serialNumber} className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2 rounded">
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-gray-700">{unit.serialNumber}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Last certified {unit.lastCertifiedDate} · Due {due}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold rounded px-2 py-0.5" style={{ backgroundColor: style.bg, color: style.text }}>
                        {style.label}
                      </span>
                      {isManager && status !== 'ok' && (
                        <button
                          onClick={() => markRecertified(item.id, unit.serialNumber)}
                          className="text-[11px] font-medium text-[#00539F] hover:underline"
                        >
                          Mark Recertified
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* QR label */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-gray-400" /> QR Label
          </h2>
          <div className="flex items-center gap-4">
            <div className="print-label flex flex-col items-center shrink-0">
              {qrUrl && <img src={qrUrl} alt={`QR code for ${item.itemId}`} className="w-32 h-32" />}
              <p className="hidden print:block text-sm font-semibold mt-2">{item.description}</p>
              <p className="hidden print:block text-xs font-mono">{item.itemId}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 leading-relaxed">
                Print this label and stick it on the shelf or bin. Scanning it with the app's scanner opens this item instantly.
              </p>
              <button
                onClick={() => window.print()}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 font-medium"
              >
                <Printer className="w-3.5 h-3.5" /> Print Label
              </button>
            </div>
          </div>
        </div>

        {/* Low stock warning */}
        {item.qtyOnHand < 3 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Low Stock</p>
              <p className="text-sm text-red-600">Only {item.qtyOnHand} unit{item.qtyOnHand !== 1 ? 's' : ''} remaining. Consider placing an order.</p>
            </div>
          </div>
        )}
      </div>

      {/* Issued to */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Currently Issued To ({issuedTo.length})
        </h2>
        {issuedTo.length === 0 ? (
          <p className="text-sm text-gray-400">Not currently issued to anyone.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium">Issued</th>
                  <th className="pb-2 font-medium">Return By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {issuedTo.map((entry, i) => (
                  <tr key={i}>
                    <td className="py-2">
                      <Link
                        to={entry.type === 'Athlete' ? `/athletes/${entry.id}` : `/staff/${entry.id}`}
                        className="font-medium text-[#00539F] hover:underline"
                      >
                        {entry.name}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-500">{entry.type}</td>
                    <td className="py-2 text-right font-medium">{entry.qty}</td>
                    <td className="py-2 text-gray-500">{entry.issuedDate}</td>
                    <td className="py-2 text-gray-500">{entry.returnByDate ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showWebcam && (
        <WebcamCapture
          onCapture={(dataUrl) => { setPhoto(item.id, dataUrl); setShowWebcam(false); }}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </div>
  );
}
