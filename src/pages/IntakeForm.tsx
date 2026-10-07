import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { usePendingIntakes } from '../context/PendingIntakesContext';
import { CLOTHING_SIZES, SHOE_SIZES, GLOVE_SIZES } from '../utils/sizeChart';

/**
 * Public, no-login form an athlete/transfer opens (in its own browser tab —
 * the "Open Form" button on Athletes opens this exact route) to submit their
 * own sizing. Demo note: this prototype has no backend, so the submission is
 * written to this browser's local storage — it only shows up for the manager
 * if they open the equipment room app in this same browser. A real
 * deployment would need a backend to sync it across devices.
 */
export default function IntakeForm() {
  const { token } = useParams<{ token: string }>();
  const { getIntake, submitIntake } = usePendingIntakes();
  const intake = token ? getIntake(token) : undefined;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(intake?.lastName ?? '');
  const [jersey, setJersey] = useState('');
  const [position, setPosition] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [shortsSize, setShortsSize] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [gloveSize, setGloveSize] = useState('');
  const [cleatSize, setCleatSize] = useState('');
  const [practiceJerseySize, setPracticeJerseySize] = useState('');
  const [practicePantSize, setPracticePantSize] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !firstName.trim() || !lastName.trim()) return;
    submitIntake(token, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      jersey: jersey.trim(),
      position: position.trim(),
      shirtSize, shortsSize, shoeSize,
      gloveSize, cleatSize, practiceJerseySize, practicePantSize,
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
    });
    setDone(true);
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

  return (
    <div className="min-h-dvh bg-gray-100 px-4 py-8 flex justify-center">
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

          {/* Sizes */}
          <SelectField label="Shirt Size" value={shirtSize} onChange={setShirtSize} options={CLOTHING_SIZES} />
          <SelectField label="Shorts Size" value={shortsSize} onChange={setShortsSize} options={CLOTHING_SIZES} />

          <div style={{ padding: '0.05in 0' }}>
            <label className="block text-xs font-semibold text-gray-600" style={{ padding: '0.05in 0' }}>Shoe Size</label>
            <input
              type="text" value={shoeSize} onChange={(e) => setShoeSize(e.target.value)}
              placeholder="e.g. 10.5"
              className="w-full border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00539F]"
              style={{ padding: '0.05in' }}
            />
          </div>

          <SelectField label="Glove Size" value={gloveSize} onChange={setGloveSize} options={GLOVE_SIZES} />
          <SelectField label="Cleat Size" value={cleatSize} onChange={setCleatSize} options={SHOE_SIZES} />
          <SelectField label="Practice Jersey Size" value={practiceJerseySize} onChange={setPracticeJerseySize} options={CLOTHING_SIZES} />
          <SelectField label="Practice Pant Size" value={practicePantSize} onChange={setPracticePantSize} options={CLOTHING_SIZES} />

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
    </div>
  );
}
