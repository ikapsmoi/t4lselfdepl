import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Modal } from '../ui/Modal'; // Ensure Modal is imported
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { INDIA_CATEGORIES } from '../../utils/constants';
import { Badge } from '../ui/Badge';
import { Plus, X, Upload, MapPin, Star, AlertTriangle } from 'lucide-react';
import { TRIP_TYPES, DIFFICULTY_LEVELS, CURRENCY_OPTIONS, getCurrencySymbol } from '../../utils/constants';
import { Trip } from '../../types';
import { useAnalytics } from '../../utils/analytics'; // Ensure useAnalytics is imported
import { useDashboard } from '../../hooks/useDashboard'; // Add this import


// --- Types ---
interface CityResult { city_id: string; city_name: string; state_name: string; country: string; lat: number; lon: number; }
interface CreateTripModalProps { isOpen: boolean; onClose: () => void; onTripSaved?: () => void; initialTrip?: Trip | null; }
interface CityWithNights { city: CityResult; nights: number; }

// --- Component ---
export const CreateTripModal: React.FC<CreateTripModalProps> = ({ isOpen, onClose, onTripSaved = () => {}, initialTrip = null }) => {
  const { user } = useAuth();
  const { hostTripCreated } = useAnalytics();
  const { refreshData } = useDashboard(user?.id || '', 'host');
  // now 4 steps: 1 Basic title & cities, 2 Trip details (type/difficulty/duration/size/description), 3 Dates & Media, 4 Review & Submit
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(() => ({
    title: initialTrip?.title || '',
    description: initialTrip?.description || initialTrip?.itinerary?.description || '',
    destination: initialTrip?.destination || initialTrip?.location || '',
    type: initialTrip?.type || '',
    difficulty: initialTrip?.difficulty || 'easy',
    duration: initialTrip?.duration?.toString() || initialTrip?.itinerary?.duration?.toString() || '',
    maxCapacity: initialTrip?.max_capacity?.toString() || '',
    price: initialTrip?.price?.toString() || '',
    currency: initialTrip?.currency || 'INR',
    startDate: initialTrip?.start_date || '',
    endDate: initialTrip?.end_date || '',
    tags: initialTrip?.tags || initialTrip?.itinerary?.tags || [],
    included: initialTrip?.included || initialTrip?.itinerary?.included || [],
    notIncluded: initialTrip?.not_included || initialTrip?.itinerary?.notIncluded || [],
    requirements: initialTrip?.requirements || initialTrip?.itinerary?.requirements || [],
    safetyMeasures: initialTrip?.safety_measures || initialTrip?.itinerary?.safetyMeasures || [],
  }));


  // City search states
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState<CityResult[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCities, setSelectedCities] = useState<CityWithNights[]>([]);
  const [currentNights, setCurrentNights] = useState('1');

  // flags and small helpers
  // indian special is now a tiny inline radio/checkbox next to title (no dedicated block)
  const [isIndianSpecial, setIsIndianSpecial] = useState(initialTrip?.type === 'indian_special');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [newIncluded, setNewIncluded] = useState('');
  const [newNotIncluded, setNewNotIncluded] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newSafetyMeasure, setNewSafetyMeasure] = useState('');
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [imageUrlsInForm, setImageUrlsInForm] = useState<string[]>(initialTrip?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);

  // validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // --- Effects (kept logic unchanged) ---
  useEffect(() => {
    // Determine if the current trip type is considered an "India Special"
    const isCurrentTypeIndiaSpecial = (type: string) => {
      const indiaCategoryValues = INDIA_CATEGORIES.map(cat => cat.value);
      return indiaCategoryValues.includes(type) || type === 'indian_special';
    };

    // If the "India" checkbox is checked, or the selected trip type is an India category,
    // force the currency to INR.
    if (isIndianSpecial || (formData.type && isCurrentTypeIndiaSpecial(formData.type))) {
      setFormData(prev => ({ ...prev, currency: 'INR' }));
    } else if (formData.currency === 'INR' && !isIndianSpecial && !isCurrentTypeIndiaSpecial(formData.type)) {
      // If it was INR but is no longer an India special, reset to default USD or allow selection
      setFormData(prev => ({ ...prev, currency: 'INR' }));
    }
  }, [isIndianSpecial, formData.type]);

  useEffect(() => {
    if (initialTrip) {
      setFormData({
        title: initialTrip.title || '',
        description: initialTrip.description || initialTrip.itinerary?.description || '',
        destination: initialTrip.destination || initialTrip.location || '',
        type: initialTrip.type || '',
        price: initialTrip.price?.toString() || '',
        maxCapacity: initialTrip.max_capacity?.toString() || '',
        startDate: initialTrip.start_date || '',
        endDate: initialTrip.end_date || '',
        difficulty: initialTrip.difficulty || 'easy',
        duration: initialTrip.duration?.toString() || initialTrip.itinerary?.duration?.toString() || '',
        currency: initialTrip.currency || 'INR',
        tags: initialTrip.tags || initialTrip.itinerary?.tags || [],
        included: initialTrip.included || initialTrip.itinerary?.included || [],
        notIncluded: initialTrip.not_included || initialTrip.itinerary?.notIncluded || [],
        requirements: initialTrip.requirements || initialTrip.itinerary?.requirements || [],
        safetyMeasures: initialTrip.safety_measures || initialTrip.itinerary?.safetyMeasures || []
      });
      setFormData(prev => ({ ...prev, groupDiscount: initialTrip.group_discount?.toString() || '0' }));

      // Set selected cities from itinerary
      if (initialTrip.itinerary?.cities) {
        const cities = initialTrip.itinerary.cities.map((city: any) => ({
          city: {
            city_id: city.city_id || `${city.city_name}-${city.state_name}`,
            city_name: city.city_name,
            state_name: city.state_name,
            country: city.country || 'India',
            lat: city.lat || 0,
            lon: city.lon || 0
          },
          nights: city.nights || 1
        }));
        setSelectedCities(cities);
      }
      
      // Set image preview URLs from existing images
      if (initialTrip.images && initialTrip.images.length > 0) {
        setImageUrlsInForm(initialTrip.images);
      }
      
      setIsIndianSpecial(initialTrip.type === 'indian_special');
    }
  }, [initialTrip]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cityQuery.length >= 2) {
        searchCities(cityQuery);
      } else {
        setCities([]);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [cityQuery]);

  const searchCities = async (query: string) => {
    setLoadingCities(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/city-search?q=${encodeURIComponent(query)}`, { headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } });
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities || []);
      } else {
        setCities([]);
      }
    } catch (e) {
      setCities([]);
    } finally { setLoadingCities(false); }
  };

  // --- handlers ---
  const handleCitySelect = (city: CityResult) => {
    const nights = parseInt(currentNights) || 1;
    if (selectedCities.some(sc => sc.city.city_id === city.city_id)) return;
    const updated = [...selectedCities, { city, nights }];
    setSelectedCities(updated);
    setFormData(prev => ({ ...prev, destination: updated.map(sc => `${sc.city.city_name}, ${sc.city.state_name}`).join(' → ') }));
    setCities([]); setCityQuery(''); setCurrentNights('1');
  };

  const handleRemoveCity = (cityId: string) => {
    const updated = selectedCities.filter(sc => sc.city.city_id !== cityId);
    setSelectedCities(updated);
    setFormData(prev => ({ ...prev, destination: updated.map(sc => `${sc.city.city_name}, ${sc.city.state_name}`).join(' → ') }));
  };
  const handleUpdateNights = (cityId: string, nights: number) => setSelectedCities(prev => prev.map(sc => sc.city.city_id === cityId ? { ...sc, nights } : sc));
  const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  // --- validation functions (kept same) ---
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Trip title is required';
    if (selectedCities.length === 0) errors.destination = 'Please select at least one city';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

const validateStep2 = (): boolean => {
  const errors: Record<string, string> = {};
  if (!formData.type || formData.type.trim() === '') errors.type = 'Trip type is required';
  if (!formData.difficulty) errors.difficulty = 'Difficulty level is required';
  // ... rest unchanged
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date(); today.setHours(0,0,0,0);
      if (startDate < today) errors.startDate = 'Start date cannot be in the past';
      if (endDate <= startDate) errors.endDate = 'End date must be after start date';
    }
    if (formData.tags.length === 0) errors.tags = 'Please add at least one tag';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: Record<string,string> = {};
    if (!agreedToTerms) errors.terms = 'You must agree to terms';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllSteps = () => validateStep1() && validateStep2() && validateStep3() && validateStep4();

  // image handlers (kept same)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) { alert('Maximum 5 images allowed'); return; }
    
    // Check total images (existing + new) don't exceed 5
    if (imageUrlsInForm.length + files.length > 5) {
      alert(`Maximum 5 images allowed. You currently have ${imageUrlsInForm.length} images.`);
      return;
    }
    
    const valid: File[] = [];
    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      valid.push(file);
      urls.push(URL.createObjectURL(file));
    }
    
    // Append new files and URLs instead of replacing
    setFilesToUpload(prev => [...prev, ...valid]);
    setImageUrlsInForm(prev => [...prev, ...urls]);
  };
  const handleRemoveImage = (index: number) => {
    const urlToRemove = imageUrlsInForm[index];
    
    // If it's a blob URL (newly added image), revoke it and remove from filesToUpload
    if (urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
      
      // Find and remove the corresponding file from filesToUpload
      const blobUrls = imageUrlsInForm.filter(url => url.startsWith('blob:'));
      const blobIndex = blobUrls.indexOf(urlToRemove);
      if (blobIndex !== -1) {
        setFilesToUpload(prev => prev.filter((_, i) => i !== blobIndex));
      }
    }
    
    // Remove the URL from imageUrlsInForm
    setImageUrlsInForm(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (tripId: string): Promise<string[]> => {
    if (filesToUpload.length === 0) return [];
    setUploadingImages(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Please sign in to upload images');
      const form = new FormData(); 
      filesToUpload.forEach(f => form.append('files', f)); 
      form.append('tripId', tripId);
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-trip-images`, { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` }, body: form });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Upload failed'); }
      const { image_urls } = await res.json(); return image_urls;
    } catch (err) { console.error(err); throw err; } finally { setUploadingImages(false); }
  };

  const addToArray = (field: string, value: string, setter: (v:string)=>void) => { if (value.trim()) { setFormData(prev => ({ ...prev, [field]: [...prev[field as keyof typeof prev] as string[], value.trim()] })); setter(''); } };
  const removeFromArray = (field: string, index: number) => setFormData(prev => ({ ...prev, [field]: (prev[field as keyof typeof prev] as string[]).filter((_,i)=>i!==index) }));

  // navigation
  const handleNext = () => {
    let ok = false;
    switch(step){
      case 1: ok = validateStep1(); break;
      case 2: ok = validateStep2(); break;
      case 3: ok = validateStep3(); break;
      default: ok = true;
    }
    if (ok && step < 4) { setStep(s => s+1); setValidationErrors({}); }
  };
  const handleBack = () => { if (step > 1) setStep(s => s-1); setValidationErrors({}); };
const handleIndianSpecialChange = (checked: boolean) => {
  setIsIndianSpecial(checked);

  if (checked) {
    // set a sensible default India subtype (first option) if none selected
    const defaultIndiaType = INDIA_CATEGORIES && INDIA_CATEGORIES.length > 0 ? INDIA_CATEGORIES[0].value : 'indian_special';
    setFormData(prev => ({ ...prev, type: prev.type || defaultIndiaType, currency: 'INR' }));
  } else {
    // clear subtype so user must pick a regular trip type
    setFormData(prev => ({ ...prev, type: '' }));
  }
};

  
  const handleSubmit = async () => {
    if (!user) return;
    // Validate all steps before submitting
    if (!validateAllSteps()) {
      alert('Please fill in all required fields before submitting.');
      return;
    }

    // final terms check (step4)
    if (!validateStep4()) {
      alert('Please agree to the terms before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first if any are selected (for updates we use initialTrip.id)
      let uploadedImageUrls: string[] = [];

      if (initialTrip) {
        if (filesToUpload.length > 0) {
          uploadedImageUrls = await uploadImages(initialTrip.id);
        }

        // Construct final image URLs: keep existing non-blob URLs + add newly uploaded URLs
        const existingImageUrls = imageUrlsInForm.filter(url => !url.startsWith('blob:'));
        const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

        // Update existing trip
        const updateData: any = {
          title: formData.title,
          category: isIndianSpecial ? 'indian_special' : (formData.type as any),
          location: formData.destination,
          itinerary: {
            ...formData,
            cities: selectedCities.map(sc => ({
              city_name: sc.city.city_name,
              state_name: sc.city.state_name,
              country: sc.city.country,
              nights: sc.nights
            }))
          },
          start_date: formData.startDate,
          end_date: formData.endDate,
          price_per_person: parseFloat(formData.price || '0'), // Ensure price is a number
          // Force currency to INR if it's an India special trip
          currency: (isIndianSpecial || (formData.type && INDIA_CATEGORIES.map(cat => cat.value).includes(formData.type)) || formData.type === 'indian_special')
            ? 'INR'
            : (formData.currency as any),
          group_size: parseInt(formData.maxCapacity || '0'),
          difficulty: formData.difficulty,
          updated_at: new Date().toISOString(),
          group_discount: parseFloat(formData.groupDiscount || '0'),
          images: finalImageUrls, 
        };

        const { error } = await supabase
          .from('trips')
          .update(updateData)
          .eq('id', initialTrip.id);

        if (error) {
          console.error('Error updating trip:', error);
          alert('Failed to update trip. Please try again.');
          return;
        }

        alert('Trip updated successfully!');
      } else {
        // Create new trip
        const tripData: any = {
          host_id: user.id,
          title: formData.title,
          category: isIndianSpecial ? 'indian_special' : (formData.type as any),
          location: formData.destination,
          itinerary: {
            description: formData.description,
            duration: formData.duration,
            difficulty: formData.difficulty,
            tags: formData.tags,
            included: formData.included,
            notIncluded: formData.notIncluded,
            requirements: formData.requirements,
            safetyMeasures: formData.safetyMeasures,
            cities: selectedCities.map(sc => ({
              city_name: sc.city.city_name,
              state_name: sc.city.state_name,
              country: sc.city.country,
              nights: sc.nights
            }))
          },
          start_date: formData.startDate,
          end_date: formData.endDate,
          price_per_person: parseFloat(formData.price || '0'),
          currency: formData.currency as any,
          group_size: parseInt(formData.maxCapacity || '0'),
          difficulty: formData.difficulty,
          group_discount: parseFloat(formData.groupDiscount || '0'),
        };

        const { data: newTrip, error } = await supabase
          .from('trips')
          .insert([tripData])
          .select()
          .single();

        if (error) {
          console.error('Error creating trip:', error);
          alert('Failed to create trip. Please try again.');
          return;
        }

        // Upload images after trip creation if any are selected
        if (filesToUpload.length > 0 && newTrip) {
          uploadedImageUrls = await uploadImages(newTrip.id);

          if (uploadedImageUrls.length > 0) {
            const { error: updateError } = await supabase
              .from('trips')
              .update({ images: uploadedImageUrls })
              .eq('id', newTrip.id);

            if (updateError) {
              console.error('Error updating trip with images:', updateError);
              // Don't fail the entire operation
            }
          }
        }

        // Track trip creation
        hostTripCreated(newTrip.id, isIndianSpecial ? 'indian_special' : formData.type, parseFloat(formData.price || '0'));

        alert('Trip created successfully!');
      }

      // Reset form (keeps consistent with original)
      setFormData({
        title: '',
        description: '',
        destination: '',
        type: '',
        difficulty: '',
        duration: '',
        maxCapacity: '',
        price: '',
        groupDiscount: '0',
        currency: 'INR',
        startDate: '',
        endDate: '',
        tags: [],
        included: [],
        notIncluded: [],
        requirements: [],
        safetyMeasures: [],
      });
      setSelectedCities([]);
      setCityQuery('');
      setIsIndianSpecial(false);
      setAgreedToTerms(true); // keep checked by default after reset
      setStep(1);

      // Clean up blob URLs
      imageUrlsInForm.filter(url => url.startsWith('blob:')).forEach(url => URL.revokeObjectURL(url));
      setFilesToUpload([]);
      setImageUrlsInForm([]);

      onClose();
      onTripSaved();
    } catch (error) {
      console.error('Error saving trip:', error);
      alert(`Failed to save trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------
  // --- RENDER ---
  // Key changes: 4-step flow, tiny inline Indian Specials control placed next to title (no dedicated block), moved Type/Difficulty/Duration/Size/Description to Step 2.
  // Inputs are compact (size="sm"), two-per-row where requested.
  // -----------------

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialTrip ? 'Edit Trip' : 'Create Trip'} maxWidth="max-w-2xl">
      <div className="space-y-3 max-h-[75vh] overflow-y-auto">
        {/* compact progress */}
        <div className="flex items-center justify-center gap-3 mb-2 text-xs">
          {[1,2,3,4].map(n => (
            <div key={n} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step>=n ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{n}</div>
              {n<4 && <div className={`w-8 h-0.5 mx-1 ${step>n? 'bg-yellow-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* top nav */}
        <div className="flex justify-between items-center pb-2 border-b mb-2 text-sm">
          <div>
            {step>1 ? (
              <Button variant="outline" size="sm" onClick={handleBack}>← Back</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            )}
          </div>
          <div className="text-sm text-gray-600">Step {step} of 4</div>
          <div>
            {step<4 ? (
              <Button size="sm" onClick={handleNext}>Continue</Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} loading={isSubmitting} disabled={!agreedToTerms || isSubmitting || uploadingImages}>{initialTrip ? 'Update' : 'Create'}</Button>
            )}
          </div>
        </div>

        {/* STEP 1: Title + Cities (Indian special inline) */}
        {step===1 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Basic Info</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input label="Trip Title" size="sm" placeholder="e.g., Epic Iceland Adventure" value={formData.title} onChange={(e)=>handleInputChange('title', e.target.value)} error={validationErrors.title} required />
                  </div>
                  {/* tiny inline control for Indian special - no dedicated block/line */}
                  <label className="inline-flex items-center text-xs cursor-pointer ml-2">
                    <input type="checkbox" checked={isIndianSpecial} onChange={(e)=>handleIndianSpecialChange(e.target.checked)} className="w-4 h-4" />
                    <span className="ml-2">India</span>
                  </label>
                </div>
              </div>

              {/* Destination compact */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Cities & Itinerary <span className="text-red-500">*</span></label>

                {selectedCities.length>0 && (
                  <div className="mb-2 grid grid-cols-1 gap-1 text-sm">
                    {selectedCities.map((c, idx) => (
                      <div key={c.city.city_id} className="flex items-center justify-between p-1 bg-blue-50 rounded">
                        <div className="truncate">{idx+1}. {c.city.city_name}, {c.city.state_name}</div>
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} max={30} value={c.nights} onChange={(e)=>handleUpdateNights(c.city.city_id, parseInt(e.target.value) || 1)} className="w-14 text-sm px-2 py-1 border rounded text-center" />
                          <button onClick={()=>handleRemoveCity(c.city.city_id)} className="text-red-500"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-gray-600">Total: {selectedCities.reduce((s,sc)=>s+sc.nights,0)} nights</div>
                  </div>
                )}

                <div className="border border-dashed rounded p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="sm:col-span-2 relative">
                      <input type="text" placeholder="Search for a city..." value={cityQuery} onChange={(e)=>setCityQuery(e.target.value)} className="w-full text-sm px-3 py-2 pl-8 border rounded focus:ring-2 focus:ring-yellow-400" />
                      <MapPin className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                      {(cities.length>0 || loadingCities) && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow max-h-48 overflow-auto text-sm">
                          {loadingCities ? <div className="p-2 text-center text-gray-500">Searching...</div> : cities.map(city => (
                            <button key={city.city_id} type="button" onClick={()=>handleCitySelect(city)} className="w-full text-left px-2 py-2 hover:bg-gray-50 border-b last:border-b-0"> 
                              <div className="font-medium">{city.city_name}</div>
                              <div className="text-xs text-gray-600">{city.state_name}, {city.country}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <input type="number" min={1} max={30} placeholder="Nights" value={currentNights} onChange={(e)=>setCurrentNights(e.target.value)} className="w-full text-sm px-2 py-2 border rounded" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Search & add cities, then set nights</p>
                </div>

                {validationErrors.destination && <p className="text-red-500 text-xs mt-1">{validationErrors.destination}</p>}
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: Trip Type, Difficulty, Duration, Max Group Size, Trip Description (user requested move) */}
        {step===2 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Trip Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
            {/* Trip Type: regular vs India-specific */}
{isIndianSpecial ? (
  <Select
    label="India Special Category *"
    size="sm"
    placeholder="Select India category"
    value={formData.type}
    onChange={(v) => handleInputChange('type', v)}
    options={INDIA_CATEGORIES.map(t => ({ value: t.value, label: t.label }))}
    error={validationErrors.type}
    required
  />
) : (
  <Select
    label="Trip Type *"
    size="sm"
    placeholder="Select"
    value={formData.type}
    onChange={(v) => handleInputChange('type', v)}
    options={TRIP_TYPES.map(t => ({ value: t.value, label: t.label }))}
    error={validationErrors.type}
    required
  />
)}

              </div>

              <div>
                <Select label="Difficulty *" size="sm" value={formData.difficulty} onChange={(v)=>handleInputChange('difficulty', v)} options={DIFFICULTY_LEVELS.map(l=>({value:l.value,label:l.label}))} error={validationErrors.difficulty} required />
              </div>

              <div>
                <Input label="Duration (days) *" size="sm" type="number" placeholder="7" value={formData.duration} onChange={(e)=>handleInputChange('duration', e.target.value)} error={validationErrors.duration} required />
              </div>

              <div>
                <Input label="Max Group Size *" size="sm" type="number" placeholder="12" value={formData.maxCapacity} onChange={(e)=>handleInputChange('maxCapacity', e.target.value)} error={validationErrors.maxCapacity} required />
              </div>

              <div>
                <Input label="Price per Person *" size="sm" type="number" placeholder="1500" value={formData.price} onChange={(e)=>handleInputChange('price', e.target.value)} error={validationErrors.price} required />
              </div>

              <div>
                <Select label="Currency *" size="sm" value={formData.currency} onChange={(v)=>handleInputChange('currency', v)} options={CURRENCY_OPTIONS.map(c=>({value:c.value,label:c.label}))} error={validationErrors.currency} required disabled={
                  isIndianSpecial || 
                  (formData.type && INDIA_CATEGORIES.map(cat => cat.value).includes(formData.type)) ||
                  formData.type === 'indian_special'
                } />
              </div>
              
              <div>
                <Input label="Group Discount (%)" size="sm" type="number" placeholder="10" value={formData.groupDiscount} onChange={(e)=>handleInputChange('groupDiscount', e.target.value)} error={validationErrors.groupDiscount} />
              </div>


              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Trip Description *</label>
                <textarea value={formData.description} onChange={(e)=>handleInputChange('description', e.target.value)} placeholder="Describe your trip..." rows={4} className={`w-full text-sm px-2 py-2 border rounded focus:ring-2 focus:ring-yellow-400 ${validationErrors.description ? 'border-red-500' : 'border-gray-300'}`} required />
                {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Dates & Media */}
        {step===3 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Dates & Media</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input label="Start Date" size="sm" type="date" value={formData.startDate} onChange={(e)=>handleInputChange('startDate', e.target.value)} error={validationErrors.startDate} required />
              <Input label="End Date" size="sm" type="date" value={formData.endDate} onChange={(e)=>handleInputChange('endDate', e.target.value)} error={validationErrors.endDate} required />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input size="sm" placeholder="Add a tag (e.g., hiking)" value={newTag} onChange={(e)=>setNewTag(e.target.value)} className="flex-1" />
                <Button size="sm" icon={Plus} onClick={()=>addToArray('tags', newTag, setNewTag)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((t,i)=> (<Badge key={i} className="text-xs px-2 py-0.5">{t}<button onClick={()=>removeFromArray('tags', i)} className="ml-1 text-gray-500"><X className="w-3 h-3" /></button></Badge>))}
              </div>
              {validationErrors.tags && <p className="text-red-500 text-xs mt-1">{validationErrors.tags}</p>}
            </div>

            {/* Photos compact */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Trip Photos (Optional)</label>
              <div className="border border-dashed rounded p-3 text-center">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload trip photos (max 10)</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <Button size="sm" variant="outline" onClick={()=>fileInputRef.current?.click()}>Choose Images</Button>
              </div>

              {imageUrlsInForm.length>0 && (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {imageUrlsInForm.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt={`Preview ${idx+1}`} className="w-full h-20 object-cover rounded border" />
                      <button onClick={()=>handleRemoveImage(idx)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:block"><X className="w-3 h-3" /></button>
                      <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">Image {idx + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step===4 && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Review & Submit</h3>
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><span className="text-gray-600">Title:</span> <span className="font-medium ml-1">{formData.title||'Not set'}</span></div>
                <div><span className="text-gray-600">Type:</span> <span className="font-medium ml-1">{isIndianSpecial ? 'Indian Special' : (formData.type||'Not set')}</span></div>
                <div><span className="text-gray-600">Duration:</span> <span className="font-medium ml-1">{formData.duration ? `${formData.duration} days` : 'Not set'}</span></div>
                <div><span className="text-gray-600">Price:</span> <span className="font-medium ml-1">{formData.price ? `${getCurrencySymbol(formData.currency)}${formData.price}` : 'Not set'}</span></div>
              </div>

              {selectedCities.length>0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Itinerary:</div>
                  <div className="space-y-1 text-sm">{selectedCities.map((c,idx)=> (<div key={c.city.city_id} className="flex justify-between"><span>{idx+1}. {c.city.city_name}</span><span className="text-blue-600">{c.nights} night{c.nights!==1?'s':''}</span></div>))}</div>
                </div>
              )}

              {isIndianSpecial && (
                <div className="mt-2 p-2 bg-orange-50 border rounded text-orange-800 text-sm flex items-center gap-2"><span className="text-xl">🇮🇳</span><div><div className="font-semibold">Indian Special</div><div className="text-xs">This trip will be featured in our India collection</div></div></div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">What's Included</label>
                <div className="flex gap-2 mb-2">
                  <Input size="sm" placeholder="e.g., Accommodation" value={newIncluded} onChange={(e)=>setNewIncluded(e.target.value)} className="flex-1" />
                  <Button size="sm" icon={Plus} onClick={()=>addToArray('included', newIncluded, setNewIncluded)}>Add</Button>
                </div>
                <div className="space-y-1 max-h-28 overflow-auto text-sm">{formData.included.map((item,i)=>(<div key={i} className="flex justify-between bg-green-50 p-1 rounded text-sm"><span>{item}</span><button onClick={()=>removeFromArray('included', i)} className="text-red-500"><X className="w-3 h-3" /></button></div>))}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">What's Not Included</label>
                <div className="flex gap-2 mb-2">
                  <Input size="sm" placeholder="e.g., International flights" value={newNotIncluded} onChange={(e)=>setNewNotIncluded(e.target.value)} className="flex-1" />
                  <Button size="sm" icon={Plus} onClick={()=>addToArray('notIncluded', newNotIncluded, setNewNotIncluded)}>Add</Button>
                </div>
                <div className="space-y-1 max-h-28 overflow-auto text-sm">{formData.notIncluded.map((it,i)=>(<div key={i} className="flex justify-between bg-red-50 p-1 rounded text-sm"><span>{it}</span><button onClick={()=>removeFromArray('notIncluded', i)} className="text-red-500"><X className="w-3 h-3" /></button></div>))}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Requirements</label>
                <div className="flex gap-2 mb-2"><Input size="sm" placeholder="e.g., Good fitness" value={newRequirement} onChange={(e)=>setNewRequirement(e.target.value)} className="flex-1" /><Button size="sm" icon={Plus} onClick={()=>addToArray('requirements', newRequirement, setNewRequirement)}>Add</Button></div>
                <div className="space-y-1 max-h-28 overflow-auto text-sm">{formData.requirements.map((r,i)=>(<div key={i} className="flex justify-between bg-orange-50 p-1 rounded text-sm"><span>{r}</span><button onClick={()=>removeFromArray('requirements', i)} className="text-red-500"><X className="w-3 h-3" /></button></div>))}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Safety Measures</label>
                <div className="flex gap-2 mb-2"><Input size="sm" placeholder="e.g., Professional guides" value={newSafetyMeasure} onChange={(e)=>setNewSafetyMeasure(e.target.value)} className="flex-1" /><Button size="sm" icon={Plus} onClick={()=>addToArray('safetyMeasures', newSafetyMeasure, setNewSafetyMeasure)}>Add</Button></div>
                <div className="space-y-1 max-h-28 overflow-auto text-sm">{formData.safetyMeasures.map((s,i)=>(<div key={i} className="flex justify-between bg-blue-50 p-1 rounded text-sm"><span>{s}</span><button onClick={()=>removeFromArray('safetyMeasures', i)} className="text-red-500"><X className="w-3 h-3" /></button></div>))}</div>
              </div>
            </div>

            <div className="bg-gray-50 border rounded p-2 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="font-semibold">Terms and Conditions</div>
                  <div className="text-xs text-gray-600 max-h-20 overflow-auto mt-1">By creating a trip, you agree to provide accurate info, respond within 24 hours, honor inclusions and follow community guidelines.</div>
                  <div className="flex items-center gap-2 mt-2"><input type="checkbox" id="agreeTerms" checked={agreedToTerms} onChange={(e)=>setAgreedToTerms(e.target.checked)} className="w-4 h-4" /><label htmlFor="agreeTerms" className="text-xs">I agree to the <a href="#terms" className="text-yellow-600 underline">Terms</a> and <a href="#privacy" className="text-yellow-600 underline ml-1">Privacy Policy</a></label></div>
                  {validationErrors.terms && <p className="text-red-500 text-xs mt-1">{validationErrors.terms}</p>}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* bottom nav */}
        <div className="flex justify-between items-center pt-2 border-t mt-4 sticky bottom-0 bg-white">
          <div>
            {step>1 ? <Button variant="outline" size="sm" onClick={handleBack}>Back</Button> : <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>}
          </div>
          <div>
            {step<4 ? <Button size="sm" onClick={handleNext}>Continue</Button> : <Button size="sm" onClick={handleSubmit} loading={isSubmitting || uploadingImages} disabled={!agreedToTerms || isSubmitting || uploadingImages}>{uploadingImages ? 'Uploading...' : (initialTrip ? 'Update Trip' : 'Create Trip')}</Button>}
          </div>
        </div>

      </div>
    </Modal>
  );
};