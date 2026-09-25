import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Download,
  Mail,
  Plus,
  Save,
  Share2,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  buildShareText,
  CURRENCY_OPTIONS,
  COMPANY_CONFIG,
  createId,
  formatAmount,
  getDemoPackageData,
  getFilenameSafe,
  PackageCreatorData,
  sanitizeText,
  TEMPLATE_OPTIONS,
  type InclusionItem,
  type ItineraryDay,
  type OutputFormat,
  type StayItem,
} from '../../lib/packageCreator';

type ValidationErrors = Partial<Record<string, string>>;

const cloneData = (data: PackageCreatorData): PackageCreatorData => JSON.parse(JSON.stringify(data));

const createEmptyStay = (): StayItem => ({
  id: createId(),
  city: '',
  hotel: '',
  nights: 1,
  category: '4 Star',
  mealPlan: 'Breakfast',
});

const createEmptyInclusion = (): InclusionItem => ({
  id: createId(),
  value: '',
});

const createEmptyDay = (dayNumber: number): ItineraryDay => ({
  id: createId(),
  day: dayNumber,
  title: `DAY ${String(dayNumber).padStart(2, '0')}`,
  date: '',
  city: '',
  description: '',
  activities: [''],
});

const syncItineraryLength = (days: number, itinerary: ItineraryDay[]): ItineraryDay[] => {
  const next = [...itinerary];

  while (next.length < days) {
    const nextDay = next.length + 1;
    next.push(createEmptyDay(nextDay));
  }

  while (next.length > days) {
    next.pop();
  }

  return next.map((day, index) => ({
    ...day,
    day: index + 1,
    title: day.title || `DAY ${String(index + 1).padStart(2, '0')}`,
    activities: (day.activities && day.activities.length > 0 ? day.activities : ['']).filter((activity) => activity.trim().length > 0 || activity === ''),
  }));
};

export const PackageCreator: React.FC = () => {
  const [packageData, setPackageData] = useState<PackageCreatorData>(() => cloneData(getDemoPackageData()));
  const [validation, setValidation] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const stayNightsTotal = useMemo(
    () => packageData.stays.reduce((total, item) => total + Number(item.nights || 0), 0),
    [packageData.stays]
  );

  const stayMismatch = packageData.nights > 0 && stayNightsTotal !== packageData.nights;

  const updateField = <K extends keyof PackageCreatorData>(field: K, value: PackageCreatorData[K]) => {
    setPackageData((prev) => ({ ...prev, [field]: value }));
  };

  const updateStayField = (id: string, field: keyof StayItem, value: string | number) => {
    setPackageData((prev) => ({
      ...prev,
      stays: prev.stays.map((stay) =>
        stay.id === id ? { ...stay, [field]: value } : stay
      ),
    }));
  };

  const addStay = () => {
    setPackageData((prev) => ({
      ...prev,
      stays: [...prev.stays, createEmptyStay()],
    }));
  };

  const removeStay = (id: string) => {
    setPackageData((prev) => ({
      ...prev,
      stays: prev.stays.filter((stay) => stay.id !== id),
    }));
  };

  const addInclusion = () => {
    setPackageData((prev) => ({ ...prev, inclusions: [...prev.inclusions, createEmptyInclusion()] }));
  };

  const updateInclusion = (id: string, value: string) => {
    setPackageData((prev) => ({
      ...prev,
      inclusions: prev.inclusions.map((item) => (item.id === id ? { ...item, value } : item)),
    }));
  };

  const removeInclusion = (id: string) => {
    setPackageData((prev) => ({ ...prev, inclusions: prev.inclusions.filter((item) => item.id !== id) }));
  };

  const reorderInclusion = (index: number, direction: 'up' | 'down') => {
    setPackageData((prev) => {
      const updated = [...prev.inclusions];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return { ...prev, inclusions: updated };
    });
  };

  const addExclusion = () => {
    setPackageData((prev) => ({ ...prev, exclusions: [...prev.exclusions, createEmptyInclusion()] }));
  };

  const updateExclusion = (id: string, value: string) => {
    setPackageData((prev) => ({
      ...prev,
      exclusions: prev.exclusions.map((item) => (item.id === id ? { ...item, value } : item)),
    }));
  };

  const removeExclusion = (id: string) => {
    setPackageData((prev) => ({ ...prev, exclusions: prev.exclusions.filter((item) => item.id !== id) }));
  };

  const reorderExclusion = (index: number, direction: 'up' | 'down') => {
    setPackageData((prev) => {
      const updated = [...prev.exclusions];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return { ...prev, exclusions: updated };
    });
  };

  const updateDayField = (id: string, field: keyof ItineraryDay, value: string | number | string[]) => {
    setPackageData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day) => (day.id === id ? { ...day, [field]: value } : day)),
    }));
  };

  const addDay = () => {
    setPackageData((prev) => {
      const nextDayNumber = prev.itinerary.length + 1;
      const nextDay = createEmptyDay(nextDayNumber);
      return { ...prev, itinerary: [...prev.itinerary, nextDay], days: prev.days || nextDayNumber };
    });
  };

  const removeDay = (id: string) => {
    setPackageData((prev) => {
      const filtered = prev.itinerary.filter((day) => day.id !== id);
      const normalizedDays = Math.max(filtered.length, 1);
      return {
        ...prev,
        itinerary: syncItineraryLength(normalizedDays, filtered),
        days: normalizedDays,
      };
    });
  };

  const moveDay = (index: number, direction: 'up' | 'down') => {
    setPackageData((prev) => {
      const updated = [...prev.itinerary];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return {
        ...prev,
        itinerary: updated.map((day, idx) => ({ ...day, day: idx + 1, title: day.title || `DAY ${String(idx + 1).padStart(2, '0')}` })),
      };
    });
  };

  const handleDaysChange = (value: string) => {
    const nextDays = Number(value) || 0;
    setPackageData((prev) => ({
      ...prev,
      days: nextDays,
      itinerary: syncItineraryLength(nextDays, prev.itinerary),
    }));
  };

  const handleNightsChange = (value: string) => {
    const nextNights = Number(value) || 0;
    updateField('nights', nextNights);
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      updateField('coverImage', result);
    };
    reader.readAsDataURL(file);
  };

  const generateShare = (): string => buildShareText(packageData);

  const validatePackage = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!sanitizeText(packageData.packageTitle || '').length) {
      errors.packageTitle = 'Package title is required.';
    }

    if (!packageData.days || packageData.days <= 0) {
      errors.days = 'Total package days are required.';
    }

    if (!packageData.nights || packageData.nights <= 0) {
      errors.nights = 'Total package nights are required.';
    }

    if (!packageData.stays.length) {
      errors.stays = 'At least one stay is required.';
    }

    if (!packageData.adultPrice || Number(packageData.adultPrice) <= 0) {
      errors.adultPrice = 'Adult price is required.';
    }

    if (!packageData.itinerary.length) {
      errors.itinerary = 'At least one itinerary day is required.';
    }

    return errors;
  };

  const handleSavePackage = () => {
    localStorage.setItem('travel4life:packageCreatorData', JSON.stringify(packageData));
    setStatus('Package draft saved locally.');
  };

  const downloadImage = () => {
    const canvas = document.createElement('canvas');
    const url = generatedImageUrl || '';

    if (!url) {
      setStatus('Generate the package first to download it.');
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = getFilenameSafe(packageData.packageTitle);
    link.click();
    setStatus('PNG download started.');
  };

  const handleGenerateImage = async () => {
    const errors = validatePackage();
    setValidation(errors);

    if (Object.keys(errors).length > 0) {
      setStatus('Please fix the highlighted validation errors before generating the package image.');
      return;
    }

    if (!previewRef.current) {
      setStatus('Unable to generate the package image. Please try again.');
      return;
    }

    try {
      setStatus('Generating premium package image...');
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#f7f3ee',
        scale: 2,
        width: 794,
        height: 1123,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const url = canvas.toDataURL('image/png');
      setGeneratedImageUrl(url);
      setStatus('Package image generated successfully.');
    } catch (error) {
      console.error('Package image generation failed', error);
      setStatus('Unable to generate the package image. Your package information has not been lost.');
    }
  };

  const copyShareText = async () => {
    const text = generateShare();
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Share text copied to clipboard.');
    } catch (error) {
      setStatus('Clipboard access is not available in this browser.');
    }
  };

  const copyImage = async () => {
    if (!generatedImageUrl) {
      setStatus('Generate the package image before copying it.');
      return;
    }

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const clipboardItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([clipboardItem]);
      setStatus('Package image copied to clipboard.');
    } catch (error) {
      setStatus('Image copy is unavailable in this browser.');
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateShare());
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const emailPackage = () => {
    const subject = encodeURIComponent(`Travel4Life Package Proposal - ${packageData.packageTitle}`);
    const body = encodeURIComponent(generateShare());
    window.location.href = `mailto:${COMPANY_CONFIG.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">TRAVEL4LIFE</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Package Creator</h1>
          <p className="mt-2 text-sm text-stone-600">Create a client-ready travel package in minutes.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSavePackage}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-900"
          >
            <Save className="h-4 w-4" />
            Save package
          </button>
          <button
            type="button"
            onClick={handleGenerateImage}
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            <Wand2 className="h-4 w-4" />
            Generate package
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,700px)]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Package basics</h2>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">Demo data</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Package title</label>
                <input
                  value={packageData.packageTitle}
                  onChange={(event) => updateField('packageTitle', event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                  placeholder="European Summer Escape"
                />
                {validation.packageTitle && <p className="mt-2 text-xs text-red-600">{validation.packageTitle}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Number of nights</label>
                <input
                  type="number"
                  min={1}
                  value={packageData.nights}
                  onChange={(event) => handleNightsChange(event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                />
                {validation.nights && <p className="mt-2 text-xs text-red-600">{validation.nights}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Number of days</label>
                <input
                  type="number"
                  min={1}
                  value={packageData.days}
                  onChange={(event) => handleDaysChange(event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                />
                <p className="mt-2 text-xs text-stone-500">Suggested: {Math.max(packageData.nights + 1, 1)} days</p>
                {validation.days && <p className="mt-2 text-xs text-red-600">{validation.days}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Package reference</label>
                <input
                  value={packageData.packageReference}
                  onChange={(event) => updateField('packageReference', event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                  placeholder="T4L-EUROPE-2027-001"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Stay details</h2>
              <button
                type="button"
                onClick={addStay}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 hover:border-stone-500 hover:text-stone-900"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another stay
              </button>
            </div>

            <div className="space-y-4">
              {packageData.stays.map((stay, index) => (
                <div key={stay.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Stay {index + 1}</p>
                    {packageData.stays.length > 1 && (
                      <button type="button" onClick={() => removeStay(stay.id)} className="text-stone-500 hover:text-red-600" aria-label="Remove stay">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">City</label>
                      <input value={stay.city} onChange={(e) => updateStayField(stay.id, 'city', e.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500" placeholder="Paris" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Hotel</label>
                      <input value={stay.hotel} onChange={(e) => updateStayField(stay.id, 'hotel', e.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500" placeholder="Pullman Paris Tour Eiffel" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Nights</label>
                      <input type="number" min={1} value={stay.nights} onChange={(e) => updateStayField(stay.id, 'nights', Number(e.target.value) || 0)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Category</label>
                      <select value={stay.category} onChange={(e) => updateStayField(stay.id, 'category', e.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500">
                        <option>3 Star</option>
                        <option>4 Star</option>
                        <option>5 Star</option>
                        <option>Luxury</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Meal plan</label>
                      <select value={stay.mealPlan} onChange={(e) => updateStayField(stay.id, 'mealPlan', e.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500">
                        <option>Room Only</option>
                        <option>Breakfast</option>
                        <option>Half Board</option>
                        <option>Full Board</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {packageData.nights > 0 && (
              <div className={`mt-4 rounded-2xl border px-3 py-2 text-sm ${stayMismatch ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                <div className="flex items-center gap-2">
                  {stayMismatch ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{stayMismatch ? `Stay nights total ${stayNightsTotal}, but package duration is ${packageData.nights} nights.` : `Stay nights total ${stayNightsTotal} matches the package duration.`}</span>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Inclusions</h2>
            <div className="space-y-3">
              {packageData.inclusions.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <input
                    value={item.value}
                    onChange={(event) => updateInclusion(item.id, event.target.value)}
                    className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-500"
                    placeholder="Airport transfers"
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => reorderInclusion(index, 'up')} className="rounded-lg border border-stone-300 p-2 text-stone-600 hover:border-stone-500" aria-label="Move inclusion up"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => reorderInclusion(index, 'down')} className="rounded-lg border border-stone-300 p-2 text-stone-600 hover:border-stone-500" aria-label="Move inclusion down"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => removeInclusion(item.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:border-red-300" aria-label="Remove inclusion"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addInclusion} className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 hover:border-stone-500 hover:text-stone-900">
              <Plus className="h-3.5 w-3.5" />
              Add inclusion
            </button>
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Exclusions</h2>
            <div className="space-y-3">
              {packageData.exclusions.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <input
                    value={item.value}
                    onChange={(event) => updateExclusion(item.id, event.target.value)}
                    className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-500"
                    placeholder="International flights"
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => reorderExclusion(index, 'up')} className="rounded-lg border border-stone-300 p-2 text-stone-600 hover:border-stone-500" aria-label="Move exclusion up"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => reorderExclusion(index, 'down')} className="rounded-lg border border-stone-300 p-2 text-stone-600 hover:border-stone-500" aria-label="Move exclusion down"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => removeExclusion(item.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:border-red-300" aria-label="Remove exclusion"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addExclusion} className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 hover:border-stone-500 hover:text-stone-900">
              <Plus className="h-3.5 w-3.5" />
              Add exclusion
            </button>
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Pricing</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Adult price</label>
                <input
                  type="number"
                  min={0}
                  value={packageData.adultPrice}
                  onChange={(event) => updateField('adultPrice', Number(event.target.value) || 0)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500"
                />
                {validation.adultPrice && <p className="mt-2 text-xs text-red-600">{validation.adultPrice}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Child price</label>
                <input
                  type="number"
                  min={0}
                  value={packageData.childPrice}
                  onChange={(event) => updateField('childPrice', Number(event.target.value) || 0)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Infant price</label>
                <input
                  type="number"
                  min={0}
                  value={packageData.infantPrice}
                  onChange={(event) => updateField('infantPrice', Number(event.target.value) || 0)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Currency</label>
                <select
                  value={packageData.currency}
                  onChange={(event) => updateField('currency', event.target.value as PackageCreatorData['currency'])}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  {CURRENCY_OPTIONS.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Brand details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Template</label>
                <select
                  value={packageData.template}
                  onChange={(event) => updateField('template', event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500"
                >
                  {TEMPLATE_OPTIONS.map((template) => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Output format</label>
                <div className="flex flex-wrap gap-3">
                  {(['single', 'multi-page'] as OutputFormat[]).map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => updateField('outputFormat', format)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${packageData.outputFormat === format ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
                    >
                      {format === 'single' ? 'Single long image' : 'Multi-page package images'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-stone-700">Optional cover image</label>
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-3">
                  <input type="file" accept="image/*" className="hidden" id="cover-upload" onChange={handleCoverUpload} />
                  <label htmlFor="cover-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700">
                    <Upload className="h-4 w-4" />
                    Upload cover image
                  </label>
                  {packageData.coverImage ? <span className="text-xs text-stone-600">Cover image attached</span> : <span className="text-xs text-stone-500">No cover image</span>}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Additional information</h2>
            <textarea
              value={packageData.additionalInformation}
              onChange={(event) => updateField('additionalInformation', event.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-sm text-stone-900 outline-none focus:border-stone-500"
            />
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Itinerary builder</h2>
              <button type="button" onClick={addDay} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 hover:border-stone-500 hover:text-stone-900">
                <Plus className="h-3.5 w-3.5" />
                Add day
              </button>
            </div>

            {validation.itinerary && <p className="mb-3 text-xs text-red-600">{validation.itinerary}</p>}

            <div className="space-y-5">
              {packageData.itinerary.map((day, index) => (
                <div key={day.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Day {index + 1}</p>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveDay(index, 'up')} className="rounded-lg border border-stone-300 p-2 text-stone-600 hover:border-stone-500" aria-label="Move day up"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" onClick={() => moveDay(index, 'down')} className="rounded-lg border border-stone-300 p-2 text-stone-600 hover:border-stone-500" aria-label="Move day down"><ArrowDown className="h-4 w-4" /></button>
                      {packageData.itinerary.length > 1 && (
                        <button type="button" onClick={() => removeDay(day.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:border-red-300" aria-label="Remove day"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Day title</label>
                      <input
                        value={day.title}
                        onChange={(event) => updateDayField(day.id, 'title', event.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Date</label>
                      <input type="text" value={day.date} onChange={(event) => updateDayField(day.id, 'date', event.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500" placeholder="12 Jun 2027" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">City</label>
                      <input type="text" value={day.city} onChange={(event) => updateDayField(day.id, 'city', event.target.value)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500" placeholder="Paris" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Description</label>
                      <textarea
                        rows={3}
                        value={day.description}
                        onChange={(event) => updateDayField(day.id, 'description', event.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-stone-500">Activities</label>
                      <textarea
                        rows={2}
                        value={day.activities.join('\n')}
                        onChange={(event) => updateDayField(day.id, 'activities', event.target.value.split('\n').map((activity) => activity.trim()).filter(Boolean))}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
                        placeholder="Airport arrival&#10;Private transfer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500">Live preview</p>
                <h3 className="mt-1 text-lg font-semibold text-stone-900">Package document</h3>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={downloadImage} className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:border-stone-500">
                  <Download className="h-3.5 w-3.5" />
                  Download PNG
                </button>
              </div>
            </div>

            <div className="mb-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
              {stayMismatch ? (
                <span className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> Stay duration differs from package duration — please verify.</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> {stayNightsTotal} Nights • {packageData.days} Days</span>
              )}
            </div>

            <div className="mx-auto w-full max-w-[820px] rounded-[22px] border border-stone-200 bg-[#f7f3ee] p-3 shadow-md">
              <div
                ref={previewRef}
                className="overflow-hidden rounded-[18px] bg-[#f9f5f0] text-stone-800"
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  maxWidth: '100%',
                  aspectRatio: '210 / 297',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                <PackageDocument data={packageData} />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-stone-900">Share actions</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={downloadImage} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-500">
                <Download className="h-4 w-4" /> Download PNG
              </button>
              <button type="button" onClick={copyImage} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-500">
                <Copy className="h-4 w-4" /> Copy image
              </button>
              <button type="button" onClick={copyShareText} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-500">
                <Share2 className="h-4 w-4" /> Copy share text
              </button>
              <button type="button" onClick={shareViaWhatsApp} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-500">
                <Share2 className="h-4 w-4" /> WhatsApp
              </button>
              <button type="button" onClick={emailPackage} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-500 sm:col-span-2">
                <Mail className="h-4 w-4" /> Email
              </button>
            </div>

            {generatedImageUrl && (
              <a href={generatedImageUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700">
                Open image
              </a>
            )}
          </div>

          {status && (
            <div className="rounded-[20px] border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
              {status}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

interface PackageDocumentProps {
  data: PackageCreatorData;
}

const PackageDocument: React.FC<PackageDocumentProps> = ({ data }) => {
  const validStays = data.stays.filter((stay) => stay.city || stay.hotel || stay.nights > 0);
  const validIncludes = data.inclusions.filter((item) => item.value.trim());
  const validExclusions = data.exclusions.filter((item) => item.value.trim());
  const validItinerary = data.itinerary.filter((day) => day.title || day.description || day.city || day.date);
  const shareText = generateShare(data);

  return (
    <div className="w-full min-h-[1123px] bg-[#f9f5f0] px-4 py-4 text-stone-800 sm:px-6 sm:py-6">
      <div className="mx-auto h-full w-full overflow-hidden rounded-[16px] border border-[#eae1d4] bg-[#fdfaf7]">
        <header className="border-b border-[#eae1d4] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={COMPANY_CONFIG.logo} alt="Travel4life logo" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-stone-500">TRAVEL4LIFE</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-stone-500">{data.template}</p>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 sm:px-8 sm:py-8">
          {data.coverImage && (
            <div className="mb-7 overflow-hidden rounded-[12px] border border-[#eae1d4] bg-stone-200">
              <img src={data.coverImage} alt={data.packageTitle} className="h-44 w-full object-cover" />
            </div>
          )}

          <div className="mb-7 flex items-start justify-between gap-4 border-b border-[#eae1d4] pb-5">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-stone-500">Package proposal</p>
              <h1 className="max-w-[520px] text-3xl font-black tracking-[-0.05em] text-stone-900 sm:text-4xl">{data.packageTitle.toUpperCase()}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                <span>{data.days} DAYS</span>
                <span>•</span>
                <span>{data.nights} NIGHTS</span>
                {data.packageReference && (
                  <>
                    <span>•</span>
                    <span>{data.packageReference}</span>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-full border border-[#eae1d4] bg-[#f3ede5] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-700">
              {data.outputFormat === 'multi-page' ? 'MULTI-PAGE' : 'SINGLE IMAGE'}
            </div>
          </div>

          <section className="mb-8 grid gap-4 border-b border-[#eae1d4] pb-6 sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500">Destinations</p>
              <p className="mt-2 text-base font-semibold text-stone-900">{validStays.length ? validStays.map((stay) => stay.city).join(' • ') : 'Curated destinations'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500">Hotels</p>
              <p className="mt-2 text-base font-semibold text-stone-900">{validStays.length ? validStays.map((stay) => stay.hotel).slice(0, 2).join(' • ') : 'Selected properties'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500">Duration</p>
              <p className="mt-2 text-base font-semibold text-stone-900">{data.days} Days / {data.nights} Nights</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500">From</p>
              <p className="mt-2 text-base font-semibold text-stone-900">{formatAmount(data.adultPrice, data.currency)}</p>
            </div>
          </section>

          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-500">Stay details</h2>
              <div className="space-y-3">
                {validStays.map((stay) => (
                  <div key={stay.id} className="rounded-[14px] border border-[#eae1d4] bg-[#f5efe9] px-4 py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-lg font-semibold text-stone-900">{stay.city}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{stay.nights} Nights</span>
                    </div>
                    <p className="mt-1 text-sm text-stone-700">{stay.hotel}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
                      {stay.category && <span>{stay.category}</span>}
                      {stay.mealPlan && <span>{stay.mealPlan}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-500">Itinerary</h2>
              <div className="space-y-4">
                {validItinerary.map((day) => (
                  <div key={day.id} className="rounded-[14px] border border-[#eae1d4] bg-white p-4">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">{day.title || `DAY ${String(day.day).padStart(2, '0')}`}</p>
                      {day.date && <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-600">{day.date}</span>}
                    </div>
                    {day.city && <p className="mb-2 text-sm font-semibold text-stone-700">{day.city}</p>}
                    {day.description && <p className="text-sm leading-6 text-stone-700">{day.description}</p>}
                    {day.activities && day.activities.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-stone-600">
                        {day.activities.map((activity, activityIndex) => (
                          <li key={`${day.id}-activity-${activityIndex}`} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-stone-400"></span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-500">Package includes</h2>
                <ul className="space-y-2 text-sm text-stone-700">
                  {validIncludes.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                      <span>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-500">Package excludes</h2>
                <ul className="space-y-2 text-sm text-stone-700">
                  {validExclusions.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-stone-400"></span>
                      <span>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-[14px] border border-[#eae1d4] bg-[#f5efe9] p-4">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-500">Pricing</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">Adult</p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">{formatAmount(data.adultPrice, data.currency)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">Child</p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">{formatAmount(data.childPrice, data.currency)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500">Infant</p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">{data.infantPrice ? formatAmount(data.infantPrice, data.currency) : '—'}</p>
                </div>
              </div>
            </section>

            {data.additionalInformation && (
              <section>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-500">Important information</h2>
                <div className="rounded-[14px] border border-[#eae1d4] bg-white p-4 text-sm leading-7 text-stone-700 whitespace-pre-wrap">
                  {data.additionalInformation}
                </div>
              </section>
            )}
          </div>
        </main>

        <footer className="border-t border-[#eae1d4] bg-[#f3ede5] px-6 py-5 text-center sm:px-8">
          <div className="mb-3 flex justify-center">
            <img src={COMPANY_CONFIG.logo} alt="Travel4life logo" className="h-8 w-8 object-contain" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-700">TRAVEL4LIFE</p>
          <div className="mt-3 space-y-1 text-sm text-stone-600">
            <p>{COMPANY_CONFIG.websiteDisplay}</p>
            <p>{COMPANY_CONFIG.whatsapp}</p>
            <p>{COMPANY_CONFIG.email}</p>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-stone-500">Premium travel proposal</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-stone-400">{shareText}</p>
        </footer>
      </div>
    </div>
  );
};

const generateShare = (data: PackageCreatorData): string => {
  return buildShareText(data);
};

export { PackageDocument };
