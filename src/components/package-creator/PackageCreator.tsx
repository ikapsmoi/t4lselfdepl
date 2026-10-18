import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Mail,
  Plus,
  Printer,
  Save,
  Share2,
  Trash2,
  Upload,
  Wand2,
  Loader2,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
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
  type CurrencyCode,
  type InclusionItem,
  type ItineraryDay,
  type OutputFormat,
  type StayItem,
} from '../../lib/packageCreator';
import { resolveTripImage } from '../../utils/tripImages';
import { cleanTripTitle, stripSourceNotes } from '../../utils/formatters';
import { DEFAULT_TRIP_EXCLUSIONS, DEFAULT_TRIP_INCLUSIONS } from '../../utils/constants';
import { InvoiceModal } from '../trips/InvoiceModal';

type ValidationErrors = Partial<Record<string, string>>;

interface PackageTourRecord {
  id: string;
  title: string;
  location: string;
  category: string;
  price_per_person: number;
  currency?: string | null;
  start_date: string;
  end_date: string;
  images?: string[] | null;
  itinerary?: Record<string, unknown> | null;
}

const cloneData = (data: PackageCreatorData): PackageCreatorData => JSON.parse(JSON.stringify(data));

const asObject = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

const packageDataFromTour = (tour: PackageTourRecord): PackageCreatorData => {
  const itinerary = tour.itinerary || {};
  const itineraryDuration = Number(itinerary.duration);
  const cityNights = Array.isArray(itinerary.cities)
    ? itinerary.cities.reduce((total: number, city) => {
        if (!city || typeof city !== 'object') return total;
        const nights = Number((city as Record<string, unknown>).nights);
        return Number.isFinite(nights) && nights > 0 ? total + nights : total;
      }, 0)
    : 0;
  const dateDuration = Math.ceil(
    (new Date(tour.end_date).getTime() - new Date(tour.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const days = Number.isFinite(itineraryDuration) && itineraryDuration > 0
    ? Math.max(itineraryDuration, Math.max(dateDuration, 1))
    : cityNights > 0
      ? Math.max(cityNights + 1, Math.max(dateDuration, 1))
      : Math.max(dateDuration, 1);
  const nights = Math.max(days - 1, 0);
  const currency = CURRENCY_OPTIONS.includes(tour.currency as CurrencyCode)
    ? tour.currency as CurrencyCode
    : 'INR';
  const cityRecords = Array.isArray(itinerary.cities)
    ? itinerary.cities.map(asObject).filter((city): city is Record<string, unknown> => Boolean(city))
    : [];
  const locationNames = tour.location.split(/[,|→]+/).map((city) => city.trim()).filter(Boolean);
  const staySources = cityRecords.length > 0
    ? cityRecords
    : locationNames.map((city_name) => ({ city_name }));
  const stays: StayItem[] = staySources.map((city, index) => ({
    id: createId(),
    city: String(city.city_name || city.city || locationNames[index] || ''),
    hotel: String(city.hotel || city.hotel_name || city.accommodation || ''),
    nights: Number(city.nights) || Math.floor(nights / staySources.length) + (index < nights % staySources.length ? 1 : 0),
    category: String(city.category || city.hotel_category || ''),
    mealPlan: String(city.mealPlan || city.meal_plan || ''),
  })).filter((stay) => stay.city || stay.hotel);
  const itineraryDaysValue = itinerary.dayByDay || itinerary.day_by_day || itinerary.days || itinerary.dailyItinerary;
  const itineraryDays = Array.isArray(itineraryDaysValue)
    ? itineraryDaysValue.map(asObject).filter((day): day is Record<string, unknown> => Boolean(day))
    : [];
  const imageList = Array.isArray(tour.images) ? tour.images.filter((image): image is string => typeof image === 'string' && image.length > 0) : [];
  const defaultImage = tour.category === 'budget'
    ? '/optimized/pkg1.webp'
    : tour.category === 'indian_special'
      ? '/pkg2.png'
      : '';
  const resolvedImage = resolveTripImage(tour.title, tour.location, tour.category, imageList, defaultImage);
  const dayRecords: ItineraryDay[] = itineraryDays.map((day, index) => ({
    id: createId(),
    day: Number(day.day || day.day_number) || index + 1,
    title: String(day.title || day.name || `DAY ${String(index + 1).padStart(2, '0')}`),
    date: String(day.date || ''),
    city: String(day.city || day.city_name || ''),
    description: String(day.description || ''),
    activities: asStringArray(day.activities),
  }));
  const description = typeof itinerary.description === 'string' ? stripSourceNotes(itinerary.description) : '';
  const defaultData = getDemoPackageData();
  const festivalTemplate = tour.category.toLowerCase().includes('festival');
  const tripInclusions = asStringArray(itinerary.included);
  const tripExclusions = asStringArray(itinerary.notIncluded).length
    ? asStringArray(itinerary.notIncluded)
    : asStringArray(itinerary.not_included);

  return {
    ...defaultData,
    packageTitle: cleanTripTitle(tour.title),
    packageReference: `T4L-${tour.id.slice(0, 8).toUpperCase()}`,
    days,
    nights,
    currency,
    adultPrice: Number(tour.price_per_person) || 0,
    template: festivalTemplate ? 'TRAVEL4LIFE FESTIVAL' : defaultData.template,
    stays,
    inclusions: (tripInclusions.length ? tripInclusions : DEFAULT_TRIP_INCLUSIONS).map((value) => ({ id: createId(), value })),
    exclusions: (tripExclusions.length ? tripExclusions : DEFAULT_TRIP_EXCLUSIONS)
      .filter((value) => tour.category !== 'indian_special' || (value !== 'City tax if applicable.' && value !== 'Visa fees not included.'))
      .map((value) => ({ id: createId(), value })),
    additionalInformation: [description, defaultData.additionalInformation].filter(Boolean).join('\n\n'),
    itinerary: dayRecords,
    showItinerary: dayRecords.length > 0,
    coverImage: resolvedImage.src,
    galleryImages: imageList.filter((image) => image !== resolvedImage.src),
  };
};

const readImageAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const waitForDocumentAssets = async (element: HTMLElement): Promise<void> => {
  await document.fonts.ready;
  await Promise.all(Array.from(element.querySelectorAll('img')).map(async (image) => {
    if (!image.complete) {
      await new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }

    if (image.naturalWidth > 0) {
      await image.decode().catch(() => undefined);
    }
  }));
};

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

interface PackageCreatorProps {
  brandTheme?: boolean;
}

export const PackageCreator: React.FC<PackageCreatorProps> = ({ brandTheme = false }) => {
  const [packageData, setPackageData] = useState<PackageCreatorData>(() => cloneData(getDemoPackageData()));
  const [tours, setTours] = useState<PackageTourRecord[]>([]);
  const [selectedTourId, setSelectedTourId] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [toursLoading, setToursLoading] = useState(true);
  const [toursError, setToursError] = useState('');
  const [validation, setValidation] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const generatedImageDataRef = useRef<PackageCreatorData | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const selectedTour = useMemo(
    () => tours.find((tour) => tour.id === selectedTourId),
    [selectedTourId, tours]
  );
  const invoiceCurrencySymbol = useMemo(
    () => new Intl.NumberFormat('en', {
      style: 'currency',
      currency: packageData.currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0).find((part) => part.type === 'currency')?.value || packageData.currency,
    [packageData.currency]
  );

  useEffect(() => {
    let cancelled = false;

    const loadTours = async () => {
      if (!isSupabaseConfigured) {
        setToursLoading(false);
        setToursError('Connect the database to choose from saved tours.');
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('id, title, location, category, price_per_person, currency, start_date, end_date, images, itinerary')
        .eq('status', 'active')
        .order('title');

      if (cancelled) return;
      if (error) {
        console.error('Unable to load tours for package creator', error);
        setToursError('Unable to load tours from the database. Please try again later.');
      } else {
        setTours((data || []) as PackageTourRecord[]);
      }
      setToursLoading(false);
    };

    void loadTours();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (generatedImageUrl && generatedImageDataRef.current !== packageData) {
      setGeneratedImageUrl(null);
      setStatus('Package details changed. Generate the updated image before downloading.');
    }
  }, [generatedImageUrl, packageData]);

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

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    if (!files.length) return;

    try {
      const images = await Promise.all(files.map(readImageAsDataUrl));
      setPackageData((prev) => ({ ...prev, galleryImages: [...(prev.galleryImages || []), ...images] }));
      setStatus(`${images.length} package photo${images.length === 1 ? '' : 's'} added.`);
    } catch {
      setStatus('Unable to read one or more selected photos.');
    }
  };

  const removeGalleryImage = (index: number) => {
    setPackageData((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, imageIndex) => imageIndex !== index),
    }));
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

    if (!Number.isFinite(packageData.nights) || packageData.nights < 0) {
      errors.nights = 'Total package nights cannot be negative.';
    }

    if (!packageData.stays.length) {
      errors.stays = 'At least one stay is required.';
    }

    if (!packageData.adultPrice || Number(packageData.adultPrice) <= 0) {
      errors.adultPrice = 'Adult price is required.';
    }

    if (packageData.showItinerary !== false && !packageData.itinerary.length) {
      errors.itinerary = 'At least one itinerary day is required.';
    }

    return errors;
  };

  const handleSavePackage = () => {
    localStorage.setItem('travel4life:packageCreatorData', JSON.stringify(packageData));
    setStatus('Package draft saved locally.');
  };

  const downloadImage = () => {
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

  const createPackageImage = async (): Promise<string> => {
    const element = exportRef.current;
    if (!element) throw new Error('Package export is unavailable.');
    await waitForDocumentAssets(element);
    const pageWidth = 2480;
    const pageHeight = 3508;
    const sourceScale = Math.min(4, Math.max(3.2, (pageHeight / Math.max(1123, element.scrollHeight)) * 1.25));

    const sourceCanvas = await html2canvas(element, {
      backgroundColor: '#fff8f1',
      scale: sourceScale,
      width: 794,
      height: element.scrollHeight,
      windowWidth: 794,
      windowHeight: Math.max(1123, element.scrollHeight),
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = pageWidth;
    pageCanvas.height = pageHeight;
    const context = pageCanvas.getContext('2d');
    if (!context) throw new Error('Unable to create the A4 page.');

    context.fillStyle = '#fff8f1';
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    const scale = Math.min(pageCanvas.width / sourceCanvas.width, pageCanvas.height / sourceCanvas.height);
    const drawWidth = sourceCanvas.width * scale;
    const drawHeight = sourceCanvas.height * scale;
    context.drawImage(sourceCanvas, (pageCanvas.width - drawWidth) / 2, 0, drawWidth, drawHeight);

    return pageCanvas.toDataURL('image/png');
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
      setStatus('Generating A4 package image...');
      const url = await createPackageImage();
      generatedImageDataRef.current = packageData;
      setGeneratedImageUrl(url);
      setStatus('A4 package image generated successfully.');
    } catch (error) {
      console.error('Package image generation failed', error);
      setStatus('Unable to generate the package image. Your package information has not been lost.');
    }
  };

  const handleTourSelect = (tourId: string) => {
    setSelectedTourId(tourId);
    setGeneratedImageUrl(null);
    if (!tourId) {
      setStatus('');
      return;
    }

    const tour = tours.find((item) => item.id === tourId);
    if (!tour) return;

    const selectedPackageData = packageDataFromTour(tour);
    setPackageData(selectedPackageData);
    setValidation({});
    setStatus('Tour details loaded. Preparing your package image...');
    window.setTimeout(() => {
      void createPackageImage()
        .then((url) => {
          generatedImageDataRef.current = selectedPackageData;
          setGeneratedImageUrl(url);
          setStatus('Tour package image is ready to download. You can edit or add details below.');
        })
        .catch((error: unknown) => {
          console.error('Automatic package image generation failed', error);
          setStatus('Tour details loaded, but the image could not be prepared automatically. Use Generate package to try again.');
        });
    }, 0);
  };

  const handlePrintPdf = async () => {
    const errors = validatePackage();
    setValidation(errors);
    if (Object.keys(errors).length > 0) {
      setStatus('Please fix the highlighted validation errors before printing the package.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setStatus('Allow pop-ups to print or save the package as a PDF.');
      return;
    }

    try {
      setStatus('Preparing A4 PDF print...');
      const imageUrl = await createPackageImage();
      generatedImageDataRef.current = packageData;
      setGeneratedImageUrl(imageUrl);
      printWindow.document.title = `Travel4Life - ${packageData.packageTitle || 'Package'}`;
      printWindow.document.head.innerHTML = '<style>@page{size:A4 portrait;margin:0}html,body{width:210mm;height:297mm;margin:0;padding:0;background:#fff8f1}img{display:block;width:210mm;height:297mm;object-fit:contain}@media screen{body{display:grid;place-items:center;background:#fff1e7}img{width:min(210mm,100vw);height:auto;aspect-ratio:210/297;box-shadow:0 8px 30px #0002}}</style>';
      const image = printWindow.document.createElement('img');
      image.alt = 'A4 travel package proposal';
      image.src = imageUrl;
      image.onerror = () => {
        printWindow.close();
        setStatus('Unable to load the package image for printing.');
      };
      image.onload = () => {
        printWindow.focus();
        printWindow.print();
        setStatus('Print dialog opened. Choose Save as PDF to download the A4 document.');
      };
      printWindow.document.body.replaceChildren(image);
    } catch (error) {
      printWindow.close();
      console.error('Package PDF preparation failed', error);
      setStatus('Unable to prepare the package PDF. Your package information has not been lost.');
    }
  };

  const copyShareText = async () => {
    const text = generateShare();
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Share text copied to clipboard.');
    } catch {
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
    } catch {
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
    <div className={`max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 ${brandTheme ? 'package-creator--brand' : ''}`}>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">TRAVEL4LIFE</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Package Creator</h1>
          <p className="mt-2 text-sm text-stone-600">Create a client-ready travel package in minutes.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-900"
          >
            <FileText className="h-4 w-4" />
            Create Invoice
          </button>
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
          <section className="rounded-[24px] border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
            <label htmlFor="package-tour-select" className="mb-2 block text-lg font-semibold text-stone-900">Start from a saved tour</label>
            <p className="mb-3 text-sm text-stone-600">Select an active tour to prefill the package, then edit or add details before downloading.</p>
            <select
              id="package-tour-select"
              value={selectedTourId}
              onChange={(event) => handleTourSelect(event.target.value)}
              disabled={toursLoading || tours.length === 0}
              className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-3 text-stone-900 outline-none focus:border-stone-500 disabled:cursor-wait disabled:bg-stone-100"
            >
              <option value="">{toursLoading ? 'Loading tours...' : tours.length ? 'Choose a tour' : 'No active tours available'}</option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>{cleanTripTitle(tour.title)} — {cleanTripTitle(tour.location)}</option>
              ))}
            </select>
            {toursError && <p role="status" className="mt-2 text-sm text-amber-800">{toursError}</p>}
            {toursLoading && <p className="mt-2 inline-flex items-center gap-2 text-xs text-stone-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading saved tours</p>}
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Package basics</h2>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600">{selectedTourId ? 'Selected tour' : 'Demo data'}</span>
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
                  value={packageData.childPrice || ''}
                  onChange={(event) => updateField('childPrice', Number(event.target.value) || 0)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Infant price</label>
                <input
                  type="number"
                  min={0}
                  value={packageData.infantPrice || ''}
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-stone-900">Additional information</h2>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={packageData.showAdditionalInformation !== false}
                  onChange={(event) => updateField('showAdditionalInformation', event.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 accent-stone-900"
                />
                Show important information in package
              </label>
            </div>
            <textarea
              value={packageData.additionalInformation}
              onChange={(event) => updateField('additionalInformation', event.target.value)}
              rows={8}
              disabled={packageData.showAdditionalInformation === false}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-3 text-sm text-stone-900 outline-none focus:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50"
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

            <label className="mb-4 flex items-center gap-2 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={packageData.showItinerary !== false}
                onChange={(event) => updateField('showItinerary', event.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-stone-900"
              />
              Show day-by-day itinerary in the package
            </label>

            {packageData.showItinerary !== false && validation.itinerary && <p className="mb-3 text-xs text-red-600">{validation.itinerary}</p>}

            {packageData.showItinerary !== false && <div className="space-y-5">
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
            </div>}
          </section>

          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Package photos</h2>
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-3">
              <input type="file" accept="image/*" multiple className="hidden" id="gallery-upload" onChange={handleGalleryUpload} />
              <label htmlFor="gallery-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700">
                <Upload className="h-4 w-4" />
                Add photos
              </label>
              <div className="mt-3 space-y-2">
                {(packageData.galleryImages || []).map((image, index) => (
                  <div key={`${index}-${image.slice(0, 24)}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-2">
                    <img src={image} alt={`Package photo ${index + 1}`} className="h-14 w-20 rounded-lg object-cover" />
                    <span className="flex-1 text-xs text-stone-600">Photo {index + 1}</span>
                    <button type="button" onClick={() => removeGalleryImage(index)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:border-red-300" aria-label={`Remove photo ${index + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {!(packageData.galleryImages || []).length && <p className="text-xs text-stone-500">No package photos added.</p>}
              </div>
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
                <button type="button" onClick={downloadImage} disabled={!generatedImageUrl} className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50">
                  <Download className="h-3.5 w-3.5" />
                  Download PNG
                </button>
                <button type="button" onClick={handlePrintPdf} className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:border-stone-500">
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
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

            <div className="mx-auto w-full max-w-[820px] rounded-[22px] border border-orange-100 bg-white p-3 shadow-md">
              <div
                ref={previewRef}
                className="overflow-visible rounded-[18px] bg-[#f9f5f0] text-stone-800"
                style={{
                  width: '794px',
                  maxWidth: '100%',
                  minHeight: '1123px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                <PackageDocument data={packageData} />
              </div>
            </div>
            <div
              ref={exportRef}
              aria-hidden="true"
              style={{ position: 'absolute', left: '-10000px', top: 0, width: '794px', minHeight: '1123px' }}
            >
              <PackageDocument data={packageData} compact />
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-stone-900">Share actions</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={downloadImage} disabled={!generatedImageUrl} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50">
                <Download className="h-4 w-4" /> Download PNG
              </button>
              <button type="button" onClick={handlePrintPdf} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-500">
                <Printer className="h-4 w-4" /> Print / Save PDF
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
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        packageDetails={{
          id: packageData.packageReference || 'PACKAGE',
          title: packageData.packageTitle,
          destination: packageData.stays.map((stay) => stay.city).filter(Boolean).join(' / ') || 'To be confirmed',
          duration: packageData.days,
          startDate: selectedTour?.start_date || 'To be confirmed',
          endDate: selectedTour?.end_date || 'To be confirmed',
          adultPrice: packageData.adultPrice,
          childPrice: packageData.childPrice,
          currencySymbol: invoiceCurrencySymbol,
        }}
      />
    </div>
  );
};

interface PackageDocumentProps {
  data: PackageCreatorData;
  compact?: boolean;
}

const PackageDocument: React.FC<PackageDocumentProps> = ({ data, compact = false }) => {
  const validStays = data.stays.filter((stay) => stay.city || stay.hotel || stay.nights > 0);
  const validIncludes = data.inclusions.filter((item) => item.value.trim());
  const validExclusions = data.exclusions.filter((item) => item.value.trim());
  const validItinerary = data.itinerary.filter((day) => day.title || day.description || day.city || day.date);
  const galleryImages = (data.galleryImages || []).slice(0, 6);
  const additionalGalleryImageCount = (data.galleryImages || []).length - galleryImages.length;
  const informationLines = data.additionalInformation.split('\n');
  const shareText = generateShare(data);

  return (
    <div className={`w-full bg-white text-stone-800 ${compact ? 'px-3 py-3' : 'px-4 py-4 sm:px-6 sm:py-6'}`}>
      <div className="mx-auto h-full w-full overflow-hidden rounded-[18px] border border-orange-100 border-t-4 border-t-[#ff704f] bg-white shadow-[0_18px_50px_rgba(67,48,29,0.08)]">
        <header className={`border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-50 ${compact ? 'px-5 py-3' : 'px-6 py-5 sm:px-8'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={COMPANY_CONFIG.logo} alt="Travel4life logo" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-stone-500">TRAVEL4LIFE</p>
              </div>
            </div>
            <div className="text-right">
              <p className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-[9px] font-bold tracking-[0.16em] text-orange-800 shadow-sm">Cash | Card | Bank</p>
            </div>
          </div>
        </header>

        <main className={compact ? 'px-5 py-4' : 'px-6 py-6 sm:px-8 sm:py-8'}>
          {data.coverImage && (
            <div className={`overflow-hidden rounded-[12px] border border-orange-100 bg-orange-50 ${compact ? 'mb-3' : 'mb-7'}`}>
              <img src={data.coverImage} alt={data.packageTitle} className={`${compact ? 'h-24' : 'h-44'} w-full object-cover`} />
            </div>
          )}

          <div className={`flex items-start justify-between gap-4 border-b border-orange-100 ${compact ? 'mb-3 pb-3' : 'mb-7 pb-5'}`}>
            <div>
              <p className={`font-bold uppercase text-orange-700 ${compact ? 'mb-1 text-[9px]' : 'mb-2 text-[10px]'} tracking-[0.2em]`}>Package proposal</p>
              <h1 className={`max-w-[520px] font-black text-stone-900 ${compact ? 'text-xl' : 'text-3xl sm:text-4xl'} tracking-[-0.05em]`}>{data.packageTitle.toUpperCase()}</h1>
              <div className={`mt-2 flex flex-wrap items-center gap-2 font-semibold uppercase text-stone-500 ${compact ? 'text-[9px]' : 'mt-3 text-[11px]'} tracking-[0.15em]`}>
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
            {data.outputFormat === 'multi-page' && (
              <div className="rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-800 shadow-sm">MULTI-PAGE</div>
            )}
          </div>

          <section className={`grid grid-cols-4 rounded-xl border border-orange-100 bg-orange-50/70 shadow-sm ${compact ? 'mb-3 gap-2 p-3' : 'mb-8 gap-4 p-5'}`}>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-500">Destinations</p>
              <p className={`mt-1 font-semibold text-stone-900 ${compact ? 'text-xs' : 'text-base'}`}>{validStays.length ? validStays.map((stay) => stay.city).join(' • ') : 'Curated destinations'}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-500">Hotels</p>
              <p className={`mt-1 font-semibold text-stone-900 ${compact ? 'text-xs' : 'text-base'}`}>{validStays.length ? validStays.map((stay) => stay.hotel).slice(0, 2).join(' • ') : 'Selected properties'}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-500">Duration</p>
              <p className={`mt-1 font-semibold text-stone-900 ${compact ? 'text-xs' : 'text-base'}`}>{data.days} Days / {data.nights} Nights</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-500">From</p>
              <p className={`mt-1 font-semibold text-stone-900 ${compact ? 'text-xs' : 'text-base'}`}>{formatAmount(data.adultPrice, data.currency)}</p>
            </div>
          </section>

          <div className={compact ? 'space-y-3' : 'space-y-8'}>
            <section>
              <h2 className={`font-semibold uppercase text-stone-500 ${compact ? 'mb-2 text-[9px] tracking-[0.2em]' : 'mb-4 text-[11px] tracking-[0.32em]'}`}>Stay details</h2>
              <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
                {validStays.map((stay) => (
                  <div key={stay.id} className={`rounded-[10px] border border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm ${compact ? 'px-3 py-2' : 'rounded-[14px] px-4 py-3'}`}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className={`font-semibold text-stone-900 ${compact ? 'text-sm' : 'text-lg'}`}>{stay.city}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{stay.nights} Nights</span>
                    </div>
                    <p className={`mt-1 text-stone-700 ${compact ? 'text-xs' : 'text-sm'}`}>{stay.hotel}</p>
                    <div className={`mt-1 flex flex-wrap gap-3 font-medium uppercase text-stone-500 ${compact ? 'text-[9px] tracking-[0.12em]' : 'text-[11px] tracking-[0.18em]'}`}>
                      {stay.category && <span>{stay.category}</span>}
                      {stay.mealPlan && <span>{stay.mealPlan}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {data.showItinerary !== false && <section>
              <h2 className={`font-semibold uppercase text-stone-500 ${compact ? 'mb-2 text-[9px] tracking-[0.2em]' : 'mb-4 text-[11px] tracking-[0.32em]'}`}>Itinerary</h2>
              <div className={compact ? 'space-y-1.5' : 'space-y-4'}>
                {validItinerary.map((day) => (
                  <div key={day.id} className={`rounded-[10px] border border-orange-100 bg-white shadow-sm ${compact ? 'p-2' : 'rounded-[14px] p-4'}`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${compact ? 'mb-1 gap-1' : 'mb-2 gap-2'}`}>
                      <p className={`font-semibold uppercase text-stone-500 ${compact ? 'text-[9px] tracking-[0.15em]' : 'text-[10px] tracking-[0.24em]'}`}>{day.title || `DAY ${String(day.day).padStart(2, '0')}`}</p>
                      {day.date && <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-600">{day.date}</span>}
                    </div>
                    {day.city && <p className={`font-semibold text-stone-700 ${compact ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}>{day.city}</p>}
                    {day.description && <p className={`text-stone-700 ${compact ? 'text-[11px] leading-[1.35]' : 'text-sm leading-6'}`}>{day.description}</p>}
                    {day.activities && day.activities.length > 0 && (
                      <ul className={`text-stone-600 ${compact ? 'mt-1 space-y-0.5 text-[10px]' : 'mt-3 space-y-1 text-sm'}`}>
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
            </section>}

            <section className={`grid md:grid-cols-2 ${compact ? 'gap-3' : 'gap-6'}`}>
              <div>
                <h2 className={`font-semibold uppercase text-stone-500 ${compact ? 'mb-1 text-[9px] tracking-[0.2em]' : 'mb-4 text-[11px] tracking-[0.32em]'}`}>What's included</h2>
                <ul className={`text-stone-700 ${compact ? 'space-y-0.5 text-[10px]' : 'space-y-2 text-sm'}`}>
                  {validIncludes.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                      <span>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className={`font-semibold uppercase text-stone-500 ${compact ? 'mb-1 text-[9px] tracking-[0.2em]' : 'mb-4 text-[11px] tracking-[0.32em]'}`}>Not included</h2>
                <ul className={`text-stone-700 ${compact ? 'space-y-0.5 text-[10px]' : 'space-y-2 text-sm'}`}>
                  {validExclusions.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-stone-400"></span>
                      <span>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={`rounded-[10px] border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm ${compact ? 'p-2' : 'rounded-[14px] p-4'}`}>
              <h2 className={`font-semibold uppercase text-orange-800 ${compact ? 'mb-2 text-[9px] tracking-[0.2em]' : 'mb-4 text-[11px] tracking-[0.32em]'}`}>Pricing</h2>
              <div className={`grid sm:grid-cols-3 ${compact ? 'gap-2' : 'gap-3'}`}>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-500">Adult</p>
                  <p className={`mt-1 font-bold text-stone-900 ${compact ? 'text-base' : 'text-2xl'}`}>{formatAmount(data.adultPrice, data.currency)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-500">Child</p>
                  <p className={`mt-1 font-bold text-stone-900 ${compact ? 'text-base' : 'text-2xl'}`}>{data.childPrice > 0 ? formatAmount(data.childPrice, data.currency) : ''}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-stone-500">Infant</p>
                  <p className={`mt-1 font-bold text-stone-900 ${compact ? 'text-base' : 'text-2xl'}`}>{data.infantPrice > 0 ? formatAmount(data.infantPrice, data.currency) : ''}</p>
                </div>
              </div>
            </section>

            {data.showAdditionalInformation !== false && data.additionalInformation.trim() && (
              <section>
                <h2 className={`font-semibold uppercase text-stone-500 ${compact ? 'mb-1 text-[9px] tracking-[0.2em]' : 'mb-4 text-[11px] tracking-[0.32em]'}`}>Important information</h2>
                <div className={`rounded-[10px] border border-orange-100 bg-orange-50/40 text-stone-700 whitespace-pre-wrap shadow-sm ${compact ? 'p-2 text-[10px] leading-[1.45]' : 'rounded-[14px] p-4 text-sm leading-7'}`}>
                  {informationLines.map((line, index) => (
                    <React.Fragment key={`${index}-${line}`}>
                      {line.trim() === 'CANCELLATION POLICY'
                        ? <strong className="text-orange-800">{line}</strong>
                        : line}
                      {index < informationLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </section>
            )}

            <section className={`rounded-[10px] border border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm ${compact ? 'p-2' : 'p-4'}`}>
              <h2 className={`font-semibold uppercase text-orange-800 ${compact ? 'mb-2 text-[9px] tracking-[0.2em]' : 'mb-3 text-[11px] tracking-[0.32em]'}`}>Pay by card or bank transfer</h2>
              <a href={COMPANY_CONFIG.paymentUrl} target="_blank" rel="noreferrer" className="font-semibold text-orange-800 underline underline-offset-2">
                Pay by card or UPI
              </a>
              <p className="mt-1 break-all text-xs text-stone-600">{COMPANY_CONFIG.paymentUrl}</p>
              <div className={`mt-3 grid gap-x-4 gap-y-2 border-t border-orange-100 pt-3 sm:grid-cols-2 ${compact ? 'text-[9px]' : 'text-xs'}`}>
                <p><span className="font-semibold text-stone-500">Account name</span><br />{COMPANY_CONFIG.bankDetails.accountName}</p>
                <p><span className="font-semibold text-stone-500">Account number</span><br />{COMPANY_CONFIG.bankDetails.accountNumber}</p>
                <p><span className="font-semibold text-stone-500">IFSC</span><br />{COMPANY_CONFIG.bankDetails.ifsc}</p>
                <p><span className="font-semibold text-stone-500">Branch</span><br />{COMPANY_CONFIG.bankDetails.branch}</p>
              </div>
            </section>

            {galleryImages.length > 0 && (
              <section>
                <h2 className={`font-semibold uppercase text-stone-500 ${compact ? 'mb-1 text-[9px] tracking-[0.2em]' : 'mb-4 text-[11px] tracking-[0.32em]'}`}>Package photos</h2>
                <div className={`grid max-w-md grid-cols-3 ${compact ? 'gap-1.5' : 'gap-2'}`}>
                  {galleryImages.map((image, index) => (
                    <div key={`${index}-${image.slice(0, 24)}`} className="relative aspect-[4/3] overflow-hidden rounded-[8px] border border-orange-100 bg-white">
                      <img src={image} alt={`${data.packageTitle} photo ${index + 1}`} className="h-full w-full object-cover" />
                      {index === galleryImages.length - 1 && additionalGalleryImageCount > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 text-sm font-semibold text-white">
                          +{additionalGalleryImageCount} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <footer className={`border-t border-orange-100 bg-gradient-to-b from-orange-50 to-[#fff8f1] text-center ${compact ? 'px-5 py-3' : 'px-6 py-5 sm:px-8'}`}>
          <div className={`flex justify-center ${compact ? 'mb-1' : 'mb-3'}`}>
            <img src={COMPANY_CONFIG.logo} alt="Travel4life logo" className="h-8 w-8 object-contain" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-700">TRAVEL4LIFE</p>
          <div className={`space-y-1 text-stone-600 ${compact ? 'mt-1 text-[10px]' : 'mt-3 text-sm'}`}>
            <p>{COMPANY_CONFIG.websiteDisplay}</p>
            <p>{COMPANY_CONFIG.whatsapp}</p>
            <div className="flex flex-wrap justify-center gap-x-2">
              <span><strong>GST:</strong> <strong>{COMPANY_CONFIG.gst}</strong></span>
              <span aria-hidden="true">|</span>
              <span><strong>Corporate Office:</strong> {COMPANY_CONFIG.corporateOffice}</span>
              <span aria-hidden="true">|</span>
              <span><strong>Email:</strong> <strong>{COMPANY_CONFIG.email}</strong></span>
            </div>
          </div>
          <p className={`uppercase text-stone-500 ${compact ? 'mt-2 text-[8px] tracking-[0.15em]' : 'mt-4 text-[10px] tracking-[0.25em]'}`}>Premium travel proposal</p>
          {!compact && <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-stone-400">{shareText}</p>}
        </footer>
      </div>
    </div>
  );
};

const generateShare = (data: PackageCreatorData): string => {
  return buildShareText(data);
};

export { PackageDocument };
