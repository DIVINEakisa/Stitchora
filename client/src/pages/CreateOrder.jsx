import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ImageDropzone from '../components/orders/ImageDropzone';
import Alert from '../components/ui/Alert';

const STEPS = ['Design', 'Measurements', 'Fabric', 'Timeline', 'Review'];

const emptyMeasurements = { chest: '', waist: '', hips: '', shoulders: '', inseam: '' };

export default function CreateOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [fabrics, setFabrics] = useState([]);
  const [designImage, setDesignImage] = useState('');
  const [measurements, setMeasurements] = useState(emptyMeasurements);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [designerChoosesFabric, setDesignerChoosesFabric] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/fabrics').then(({ data }) => setFabrics(data)).catch(() => {});
  }, []);

  const canNext = () => {
    if (step === 0) return !!designImage;
    if (step === 1) return Object.values(measurements).every((v) => v !== '');
    if (step === 2) return designerChoosesFabric || selectedFabric;
    if (step === 3) return !!preferredDate;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        designImage,
        measurements: Object.fromEntries(
          Object.entries(measurements).map(([k, v]) => [k, parseFloat(v)])
        ),
        fabric: selectedFabric,
        designerChoosesFabric,
        preferredCompletionDate: preferredDate,
      });
      setSuccess('Order submitted successfully!');
      setTimeout(() => navigate(`/orders/${data._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-primary">Create New Order</h1>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              i === step ? 'bg-primary text-white' : i < step ? 'bg-primary/10 text-primary' : 'bg-card text-charcoal/40'
            }`}
          >
            <span className="font-semibold">{i + 1}</span>
            {label}
          </div>
        ))}
      </div>

      <div className="card-surface mt-8">
        {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} className="mb-4" />}

        {step === 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Upload Your Design</h2>
            <p className="mt-1 text-sm text-charcoal/60">Share sketches, inspiration photos, or reference images</p>
            <div className="mt-6">
              <ImageDropzone preview={designImage} onUploaded={setDesignImage} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Your Measurements</h2>
            <p className="mt-1 text-sm text-charcoal/60">All measurements in inches</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.keys(measurements).map((key) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium capitalize">{key}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="input-field"
                    value={measurements[key]}
                    onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Select Fabric</h2>
            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-primary/15 p-4 transition hover:bg-card">
              <input
                type="checkbox"
                checked={designerChoosesFabric}
                onChange={(e) => {
                  setDesignerChoosesFabric(e.target.checked);
                  if (e.target.checked) setSelectedFabric(null);
                }}
                className="h-5 w-5 accent-primary"
              />
              <span className="font-medium">Let designer choose the best fabric</span>
            </label>
            {!designerChoosesFabric && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {fabrics.map((f) => (
                  <button
                    key={f._id}
                    type="button"
                    onClick={() => setSelectedFabric(f._id)}
                    className={`overflow-hidden rounded-xl border-2 text-left transition ${
                      selectedFabric === f._id ? 'border-accent shadow-soft' : 'border-transparent bg-white shadow-card'
                    }`}
                  >
                    <img src={f.image} alt={f.name} className="aspect-square w-full object-cover" />
                    <p className="p-2 text-sm font-medium">{f.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Preferred Completion Date</h2>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="input-field mt-6 max-w-xs"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-primary">Review & Submit</h2>
            {designImage && <img src={designImage} alt="Design" className="max-h-40 rounded-xl" />}
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {Object.entries(measurements).map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-lg bg-white px-3 py-2">
                  <dt className="capitalize text-charcoal/60">{k}</dt>
                  <dd className="font-medium">{v}&quot;</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm">
              Fabric: {designerChoosesFabric ? 'Designer will choose' : fabrics.find((f) => f._id === selectedFabric)?.name}
            </p>
            <p className="text-sm">Preferred date: {preferredDate}</p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="btn-outline disabled:opacity-30"
          >
            Back
          </button>
          {step < 4 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="btn-primary">
              Continue
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-accent">
              {submitting ? 'Submitting...' : 'Submit Order Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
