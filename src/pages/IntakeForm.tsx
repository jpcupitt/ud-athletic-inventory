import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Share2, ExternalLink, X } from 'lucide-react';
import { usePendingIntakes } from '../context/PendingIntakesContext';
import { CLOTHING_SIZES, SHOE_SIZES, SPORT_SIZE_FIELDS, ALL_SPORTS, sizeOptionsFor } from '../utils/sizeChart';
import type { Sport } from '../data/types';

async function shareIntakeLink(url: string, lastName: string) {
  const shareData = { title: 'UD Athletics Equipment Form', text: `Fill out your equipment sizing for ${lastName}:`, url };
  if (navigator.share) {
    try { await navigator.share(shareData); return; } catch { /* user cancelled — fall through to copy */ }
  }
  await navigator.clipboard?.writeText(url).catch(() => {});
}

/**
 * Public, no-login form an athlete/transfer opens (in its own browser tab —
 * the "Quick Equipment Form" button on Athletes opens this exact route) to
 * submit their own sizing. Every sport starts with the same base
 * (Shirt/Shorts/Shoe/Cleat), then gets its own extra fields on top, driven
 * by SPORT_SIZE_FIELDS — a swimmer sees a Speedo/Swimsuit Size field, a
 * baseball player sees Glove/Bat/C-Flap fields, etc.
 * The Share button (top right) opens a panel to generate and distribute
 * more links for other athletes — the form itself opens first, sharing is
 * secondary.
 * Demo note: this prototype has no backend, so the submission is written to
 * this browser's local storage — it only shows up for the manager if they
 * open the equipment room app in this same browser. A real deployment would
 * need a backend to sync it across devices.
 */
export default function IntakeForm() {
  const { token } = useParams<{ token: string }>();
  const { getIntake, submitIntake, createIntakeLink } = usePendingIntakes();
  const intake = token ? getIntake(token) : undefined;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(intake?.lastName ?? '');
  const [jersey, setJersey] = useState('');
  const [position, setPosition] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [shortsSize, setShortsSize] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSport, setShareSport] = useState<Sport | ''>(intake?.sport ?? '');
  const [shareNames, setShareNames] = useState('');
  const [shareLinks, setShareLinks] = useState<{ token: string; url: string; lastName: string }[]>([]);

  if (!intake) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-gray-800">This link isn't valid</p>
          <p className="text-sm text-gray-500 mt-2">Ask your equipment manager to send a new one.</p>
        </div>
      </div>
    );
  }

  if (done || intake.status !== 'pending') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-sm text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-800">Thanks — you're all set!</p>
          <p className="text-sm text-gray-500 mt-2">Your equipment manager will review this and add you shortly.</p>
        </div>
      </div>
    );
  }

  const extraFields = SPORT_SIZE_FIELDS[intake.sport] ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !firstName.trim() || !lastName.trim()) return;
    submitIntake(token, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      jersey: jersey.trim(),
      position: position.trim(),
      shirtSize, shortsSize, shoeSize,
      sizes,
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
    });
    setDone(true);
  }

  function handleCreateShareLinks() {
    if (!shareSport) return;
    const names = shareNames.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    setShareLinks(names.map((name) => ({ ...createIntakeLink(shareSport as Sport, name), lastName: name })));
  }

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div style={{ padding: '0.05in 0' }}>
      <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
        style={{ padding: '0.05in' }}
      >
        <option value="">Select Size</option>
        {options.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );

  const TextField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div style={{ padding: '0.05in 0' }}>
      <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
        style={{ padding: '0.05in' }}
      />
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-100 px-4 py-8 flex justify-center">
      {/* Share — opens a panel to generate/distribute links for other athletes. The form itself is the primary view; sharing is secondary. */}
      <button
        onClick={() => setShowShareModal(true)}
        className="fixed z-20 flex items-center gap-1 bg-white border border-[#00539F] text-[#00539F] font-semibold text-xs rounded-full shadow hover:bg-[#EFF6FF]"
        style={{ top: 'calc(env(safe-area-inset-top) + 0.2in)', right: '0.2in', padding: '0.08in 0.14in' }}
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden h-fit">
        {/* Header — matches the "New Athlete" modal's header bar */}
        <div className="px-5 py-4" style={{ backgroundColor: '#003c71' }}>
          <span className="text-white font-semibold text-sm block">Equipment Sign-Up</span>
          <span className="text-white/70 text-xs">{intake.sport}</span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0.2in' }}>
          {/* Name */}
          <div style={{ padding: '0.05in 0' }}>
            <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Name</label>
            <div className="flex gap-2">
              <input
                type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                className="flex-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                style={{ padding: '0.05in' }}
              />
              <input
                type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                className="flex-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                style={{ padding: '0.05in' }}
              />
            </div>
          </div>

          {/* Jersey # */}
          <div style={{ padding: '0.05in 0' }}>
            <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Preferred Jersey #</label>
            <input
              type="text" value={jersey} onChange={(e) => setJersey(e.target.value)}
              placeholder="e.g. 4"
              className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
              style={{ padding: '0.05in' }}
            />
          </div>

          {/* Position */}
          <div style={{ padding: '0.05in 0' }}>
            <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Position</label>
            <input
              type="text" value={position} onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Kicker"
              className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
              style={{ padding: '0.05in' }}
            />
          </div>

          {/* Universal base sizes, every sport's form starts here */}
          <SelectField label="Shirt Size" value={shirtSize} onChange={setShirtSize} options={CLOTHING_SIZES} />
          <SelectField label="Shorts Size" value={shortsSize} onChange={setShortsSize} options={CLOTHING_SIZES} />
          <SelectField label="Shoe Size" value={shoeSize} onChange={setShoeSize} options={SHOE_SIZES} />
          <SelectField
            label="Cleat Size"
            value={sizes['Cleat Size'] ?? ''}
            onChange={(v) => setSizes((prev) => ({ ...prev, 'Cleat Size': v }))}
            options={SHOE_SIZES}
          />

          {/* Sport-specific sizes on top of the base, e.g. Glove/Bat for Baseball, Speedo/Swimsuit for Swimming */}
          {extraFields.map((label) => {
            const options = sizeOptionsFor(label);
            const value = sizes[label] ?? '';
            const onChange = (v: string) => setSizes((prev) => ({ ...prev, [label]: v }));
            return options.length > 0
              ? <SelectField key={label} label={label} value={value} onChange={onChange} options={options} />
              : <TextField key={label} label={label} value={value} onChange={onChange} placeholder="Type here" />;
          })}

          {/* Notes */}
          <div style={{ padding: '0.05in 0' }}>
            <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Notes (preferences, allergies, anything else)</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
              style={{ padding: '0.05in' }}
            />
          </div>

          {/* Submit */}
          <div style={{ marginTop: '0.1in', padding: '0.05in 0' }}>
            <button
              type="submit"
              disabled={!firstName.trim() || !lastName.trim()}
              className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
              style={{ backgroundColor: '#003c71', padding: '0.08in' }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Share panel — generate + distribute self-service links for other athletes */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white shadow-2xl flex flex-col w-full h-full rounded-none md:w-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center justify-between px-5 py-3 md:rounded-t-xl" style={{ backgroundColor: '#003c71', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
              <span className="text-white font-semibold text-sm">Share Equipment Form</span>
              <button onClick={() => setShowShareModal(false)} className="text-white hover:opacity-70"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-scroll flex-1" style={{ padding: '0.15in 0.2in' }}>
              <p className="text-xs text-gray-500 mb-3">
                Generate a link for a new or transferring athlete to fill out their own sizing on their phone.
                Send it to them yourself — approve the submission back on the Athletes page once it comes in.
              </p>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Sport</label>
                <select
                  value={shareSport}
                  onChange={(e) => setShareSport(e.target.value as Sport)}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                >
                  <option value="">Select Sport</option>
                  {ALL_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ padding: '0.05in 0' }}>
                <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Last Name(s) — one per line, for mass distribution</label>
                <textarea
                  value={shareNames}
                  onChange={(e) => setShareNames(e.target.value)}
                  placeholder={'Hart\nDaniels\nJohnson'}
                  rows={4}
                  className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
                  style={{ padding: '0.05in' }}
                />
              </div>

              <button
                onClick={handleCreateShareLinks}
                disabled={!shareSport || !shareNames.trim()}
                className="w-full text-white text-xs font-semibold rounded disabled:opacity-40"
                style={{ backgroundColor: '#003c71', padding: '0.08in', marginTop: '0.05in' }}
              >
                Generate Link{shareNames.split(/[,\n]/).filter((s) => s.trim()).length > 1 ? 's' : ''}
              </button>

              {shareLinks.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {shareLinks.map((link) => (
                    <div key={link.token} className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className="text-xs font-medium text-gray-700 truncate">{link.lastName}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => window.open(link.url, '_blank')}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#00539F] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Form
                        </button>
                        <button
                          onClick={() => shareIntakeLink(link.url, link.lastName)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#00539F] hover:underline"
                        >
                          <Share2 className="w-3 h-3" /> Share
                        </button>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    "Open Form" opens the real sign-up page — a full page in its own tab, exactly what the athlete will see. "Share" opens your phone's share sheet (text, email, etc.), or copies the link.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
