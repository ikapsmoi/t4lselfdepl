import React, { ChangeEvent, DragEvent, useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  AlertCircle, ArrowDownToLine, Check, CheckCheck, Clipboard, Clock3, FileImage, FileText,
  History, MessageCircle, Plus, Search, ShieldCheck, UploadCloud, UserRound, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  createVoucherMessage, DISPATCH_HISTORY_KEY, DispatchHistoryEntry, DispatchStatus,
  formatFileSize, MESSAGE_TEMPLATES, normalizePhoneNumber, safeFileName, validateVoucherFile,
  VOUCHER_MAX_FILE_SIZE, VOUCHER_MAX_FILES, VoucherCustomer, VoucherFile, webHandoffProvider,
} from '../../lib/voucherDispatch';

type CustomerDraft = Omit<VoucherCustomer, 'id' | 'status' | 'createdAt'>;
type QueueFilter = 'all' | 'ready' | 'sent' | 'failed' | 'skipped';

const emptyDraft: CustomerDraft = {
  name: '', phone: '', countryCode: '+91', bookingReference: '', packageName: '',
  destination: '', travelDates: '', email: '', agentName: '',
};

const readHistory = (): DispatchHistoryEntry[] => {
  try {
    const saved = window.localStorage.getItem(DISPATCH_HISTORY_KEY);
    return saved ? JSON.parse(saved) as DispatchHistoryEntry[] : [];
  } catch {
    return [];
  }
};

const statusLabel = (status: DispatchStatus) => status.toUpperCase();
const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const VoucherDispatchCenter: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<VoucherCustomer[]>([]);
  const [vouchers, setVouchers] = useState<VoucherFile[]>([]);
  const [history, setHistory] = useState<DispatchHistoryEntry[]>(readHistory);
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft);
  const [selectedId, setSelectedId] = useState('');
  const [templateId, setTemplateId] = useState('complete');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<VoucherFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [addingCustomer, setAddingCustomer] = useState(false);

  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? null;
  const selectedVouchers = vouchers.filter((voucher) => voucher.customerId === selectedId);
  const phoneValidation = selectedCustomer
    ? normalizePhoneNumber(selectedCustomer.phone, selectedCustomer.countryCode)
    : { valid: false, normalized: '', message: 'Add a customer to prepare a dispatch.' };
  const readyCount = customers.filter((customer) =>
    normalizePhoneNumber(customer.phone, customer.countryCode).valid
    && vouchers.some((voucher) => voucher.customerId === customer.id)
    && customer.status !== 'sent' && customer.status !== 'failed' && customer.status !== 'skipped'
  ).length;
  const sentCount = customers.filter((customer) => customer.status === 'sent').length;
  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const customerVouchers = vouchers.filter((voucher) => voucher.customerId === customer.id);
      const isReady = normalizePhoneNumber(customer.phone, customer.countryCode).valid
        && customerVouchers.length > 0
        && customer.status !== 'sent' && customer.status !== 'failed' && customer.status !== 'skipped';
      const matchesFilter = filter === 'all'
        || (filter === 'ready' && isReady)
        || customer.status === filter;
      const matchesSearch = !normalizedSearch || [customer.name, customer.phone, customer.bookingReference, customer.packageName]
        .some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesFilter && matchesSearch;
    });
  }, [customers, filter, search, vouchers]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DISPATCH_HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
    } catch {
      setError('Dispatch history could not be saved in this browser.');
    }
  }, [history]);

  useEffect(() => {
    if (!preview) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(preview.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [preview]);

  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]');
    const previousRobots = robots?.getAttribute('content');
    document.title = 'Voucher Dispatch Center | Travel4Life';
    if (robots) robots.setAttribute('content', 'noindex, nofollow, noarchive');
    else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow, noarchive';
      document.head.appendChild(meta);
    }
    return () => {
      document.title = previousTitle;
      const currentRobots = document.querySelector('meta[name="robots"]');
      if (previousRobots !== null) currentRobots?.setAttribute('content', previousRobots);
      else currentRobots?.remove();
    };
  }, []);

  const addHistory = (customer: VoucherCustomer, status: DispatchStatus, note = '') => {
    const entry: DispatchHistoryEntry = {
      id: createId(), customerName: customer.name, phone: normalizePhoneNumber(customer.phone, customer.countryCode).normalized || customer.phone,
      packageName: customer.packageName, bookingReference: customer.bookingReference,
      voucherNames: vouchers.filter((voucher) => voucher.customerId === customer.id).map((voucher) => voucher.file.name),
      status, createdAt: new Date().toISOString(), user: user?.name || user?.email || 'Admin', note,
    };
    setHistory((current) => [entry, ...current].slice(0, 200));
  };

  const updateStatus = (customer: VoucherCustomer, status: DispatchStatus, note = '') => {
    setCustomers((current) => current.map((item) => item.id === customer.id ? { ...item, status } : item));
    addHistory(customer, status, note);
    setNotice(`${customer.name}: ${statusLabel(status).toLowerCase()} status recorded.`);
  };

  const handleFiles = async (files: FileList | File[]) => {
    setError('');
    const incoming = Array.from(files);
    const available = VOUCHER_MAX_FILES - vouchers.length;
    if (available <= 0) {
      setError(`Maximum ${VOUCHER_MAX_FILES} vouchers per dispatch session.`);
      return;
    }
    const accepted: VoucherFile[] = [];
    for (const file of incoming.slice(0, available)) {
      const duplicate = vouchers.some((voucher) => voucher.file.name === file.name
        && voucher.file.size === file.size && voucher.file.lastModified === file.lastModified)
        || accepted.some((voucher) => voucher.file.name === file.name
          && voucher.file.size === file.size && voucher.file.lastModified === file.lastModified);
      if (duplicate) {
        setError(`${file.name} is already in this dispatch.`);
        continue;
      }
      try {
        const validationError = await validateVoucherFile(file);
        if (validationError) {
          setError(`${file.name}: ${validationError}`);
          continue;
        }
        accepted.push({ id: createId(), file, customerId: selectedId, addedAt: new Date().toISOString() });
      } catch {
        setError(`${file.name}: The file could not be inspected.`);
      }
    }
    if (incoming.length > available) setError(`Only ${available} more voucher${available === 1 ? '' : 's'} can be added.`);
    if (accepted.length) {
      setVouchers((current) => [...current, ...accepted]);
      setNotice(`${accepted.length} voucher${accepted.length === 1 ? '' : 's'} added locally.`);
    }
  };

  const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void handleFiles(event.target.files);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    void handleFiles(event.dataTransfer.files);
  };

  const addCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('Enter a customer name.');
      return;
    }
    const customer: VoucherCustomer = {
      ...draft,
      id: createId(),
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      bookingReference: draft.bookingReference.trim(),
      packageName: draft.packageName.trim(),
      status: 'prepared',
      createdAt: new Date().toISOString(),
    };
    setCustomers((current) => [...current, customer]);
    addHistory(customer, 'prepared', 'Customer added to dispatch queue.');
    setSelectedId(customer.id);
    setDraft(emptyDraft);
    setAddingCustomer(false);
    setTemplateId('complete');
    setMessage(createVoucherMessage(customer, 'complete'));
    setError('');
    setNotice(`${customer.name} added to the queue.`);
  };

  const chooseCustomer = (customer: VoucherCustomer) => {
    setSelectedId(customer.id);
    setMessage(createVoucherMessage(customer, templateId));
    setError('');
  };

  const changeTemplate = (nextTemplate: string) => {
    setTemplateId(nextTemplate);
    if (selectedCustomer && nextTemplate !== 'custom') setMessage(createVoucherMessage(selectedCustomer, nextTemplate));
    if (nextTemplate === 'custom' && !message) setMessage('Hi {{customer_name}},\n\nYour travel documents are ready.');
  };

  const assignVoucher = (voucherId: string, customerId: string) => {
    setVouchers((current) => current.map((voucher) => voucher.id === voucherId ? { ...voucher, customerId } : voucher));
  };

  const removeVoucher = (voucherId: string) => {
    setVouchers((current) => current.filter((voucher) => voucher.id !== voucherId));
    if (preview?.id === voucherId) setPreview(null);
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied.`);
    } catch {
      setError(`Could not copy ${label.toLowerCase()}. Check browser clipboard permissions.`);
    }
  };

  const openWhatsApp = () => {
    if (!selectedCustomer || !phoneValidation.valid) {
      setError('Please enter a valid WhatsApp number before opening the chat.');
      return;
    }
    if (!selectedVouchers.length) {
      setError('Assign at least one voucher before opening WhatsApp.');
      return;
    }
    if (!message.trim()) {
      setError('Add a message before opening WhatsApp.');
      return;
    }
    const opened = webHandoffProvider.openWebHandoff(phoneValidation.normalized, message);
    if (opened) updateStatus(selectedCustomer, 'opened', 'WhatsApp handoff opened by operator.');
  };

  const downloadVoucher = (voucher: VoucherFile) => {
    const url = URL.createObjectURL(voucher.file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = safeFileName(voucher.file.name);
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadAll = async () => {
    if (!selectedCustomer || !selectedVouchers.length) {
      setError('Assign at least one voucher before downloading a bundle.');
      return;
    }
    try {
      const zip = new JSZip();
      const reference = safeFileName(selectedCustomer.bookingReference || 'Travel4Life');
      selectedVouchers.forEach((voucher, index) => {
        const originalName = safeFileName(voucher.file.name);
        zip.file(`${String(index + 1).padStart(2, '0')}-${reference}-${originalName}`, voucher.file);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${safeFileName(selectedCustomer.name)}-${reference}-Vouchers.zip`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Voucher ZIP downloaded to this device.');
    } catch {
      setError('The voucher ZIP could not be created. Download the files individually.');
    }
  };

  const prepareSelected = () => {
    const next = customers.find((customer) => selectedQueue.includes(customer.id)
      && normalizePhoneNumber(customer.phone, customer.countryCode).valid
      && vouchers.some((voucher) => voucher.customerId === customer.id)
      && customer.status !== 'sent');
    if (!next) {
      setError('Select a customer with a valid number and at least one assigned voucher.');
      return;
    }
    updateStatus(next, 'prepared', 'Prepared for controlled WhatsApp handoff.');
    chooseCustomer(next);
    setNotice(`${next.name} is ready. Open WhatsApp, review, and send manually.`);
  };

  const selectAll = () => {
    setSelectedQueue(filteredCustomers.map((customer) => customer.id));
  };

  const nextCustomer = () => {
    const next = customers.find((customer) => customer.id !== selectedId
      && customer.status !== 'sent' && customer.status !== 'skipped'
      && normalizePhoneNumber(customer.phone, customer.countryCode).valid
      && vouchers.some((voucher) => voucher.customerId === customer.id));
    if (next) chooseCustomer(next);
    else setNotice('No more ready customers in the queue.');
  };

  const currentStatus = selectedCustomer
    ? selectedCustomer.status === 'prepared' && phoneValidation.valid && selectedVouchers.length ? 'ready' : selectedCustomer.status
    : '';

  return (
    <div className="min-h-screen bg-[#f5f7f4] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Travel4Life · Operations</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Voucher Dispatch Center</h1>
            <p className="mt-2 text-sm text-slate-600">Organize travel documents and prepare customer WhatsApp handoffs.</p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
            <ShieldCheck className="h-4 w-4 shrink-0" /> Local processing · Nothing is uploaded
          </div>
        </header>

        <section aria-label="Dispatch summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Customers', customers.length, 'text-slate-900'],
            ['Vouchers', vouchers.length, 'text-slate-900'],
            ['Ready', readyCount, 'text-emerald-700'],
            ['Sent', sentCount, 'text-sky-700'],
          ].map(([label, value, color]) => (
            <div key={label} className="border-l-2 border-emerald-600 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        {(notice || error) && (
          <div role={error ? 'alert' : 'status'} className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
            <span className="flex items-start gap-2">{error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <Check className="mt-0.5 h-4 w-4 shrink-0" />}{error || notice}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => { setError(''); setNotice(''); }}><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(280px,0.85fr)_minmax(300px,0.95fr)_minmax(360px,1.2fr)]">
          <section className="space-y-4" aria-label="Voucher upload and customer creation">
            <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Upload vouchers</h2>
                  <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG, JPEG, WEBP · {formatFileSize(VOUCHER_MAX_FILE_SIZE)} max each</p>
                </div>
                <span className="text-xs font-medium text-slate-500">{vouchers.length}/{VOUCHER_MAX_FILES}</span>
              </div>
              <div
                onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex min-h-40 flex-col items-center justify-center border-2 border-dashed px-4 py-6 text-center transition-colors ${dragOver ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}
              >
                <UploadCloud className="h-8 w-8 text-emerald-700" />
                <p className="mt-2 text-sm font-semibold">Drop vouchers here</p>
                <p className="mt-1 text-xs text-slate-500">or browse from this computer</p>
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                  <Plus className="h-4 w-4" /> Browse files
                  <input className="sr-only" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" onChange={onFileInput} />
                </label>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Files stay in this page's browser memory and are cleared when you leave or refresh. Only dispatch history metadata is saved in this browser.</p>
            </div>

            <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Customers</h2>
                  <p className="mt-1 text-xs text-slate-500">Create a recipient bundle, then assign vouchers.</p>
                </div>
                <button type="button" onClick={() => setAddingCustomer((current) => !current)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              {addingCustomer && (
                <form onSubmit={addCustomer} className="space-y-3 border-t border-slate-100 pt-4">
                  <label className="block text-xs font-semibold text-slate-600">Customer name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} maxLength={100} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="Rahul Sharma" /></label>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <label className="text-xs font-semibold text-slate-600">Country code<select value={draft.countryCode} onChange={(event) => setDraft({ ...draft, countryCode: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-normal text-slate-900"><option>+91</option><option>+1</option><option>+44</option><option>+61</option><option>+971</option></select></label>
                    <label className="text-xs font-semibold text-slate-600">WhatsApp number<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} maxLength={24} inputMode="tel" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="9876543210" /></label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-600">Package name<input value={draft.packageName} onChange={(event) => setDraft({ ...draft, packageName: event.target.value })} maxLength={140} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" placeholder="Tomorrowland Belgium 2027" /></label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs font-semibold text-slate-600">Booking reference<input value={draft.bookingReference} onChange={(event) => setDraft({ ...draft, bookingReference: event.target.value })} maxLength={60} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" /></label>
                    <label className="text-xs font-semibold text-slate-600">Destination<input value={draft.destination} onChange={(event) => setDraft({ ...draft, destination: event.target.value })} maxLength={100} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" /></label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs font-semibold text-slate-600">Travel dates<input value={draft.travelDates} onChange={(event) => setDraft({ ...draft, travelDates: event.target.value })} maxLength={80} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" placeholder="12-18 July 2027" /></label>
                    <label className="text-xs font-semibold text-slate-600">Agent name<input value={draft.agentName} onChange={(event) => setDraft({ ...draft, agentName: event.target.value })} maxLength={80} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" /></label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-600">Email (optional)<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} maxLength={160} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" /></label>
                  <div className="flex gap-2 pt-1">
                    <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Add to queue</button>
                    <button type="button" onClick={() => setAddingCustomer(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
                  </div>
                </form>
              )}
              {!addingCustomer && customers.length === 0 && <p className="border-t border-slate-100 py-5 text-sm text-slate-500">No customers in this dispatch yet.</p>}
              {!addingCustomer && customers.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  {customers.map((customer) => {
                    const count = vouchers.filter((voucher) => voucher.customerId === customer.id).length;
                    const number = normalizePhoneNumber(customer.phone, customer.countryCode);
                    return (
                      <button key={customer.id} type="button" onClick={() => chooseCustomer(customer)} className={`w-full border px-3 py-3 text-left transition-colors ${selectedId === customer.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-400'}`}>
                        <span className="flex items-start justify-between gap-2"><span className="font-semibold">{customer.name}</span><span className={`shrink-0 text-[10px] font-bold uppercase ${customer.status === 'sent' ? 'text-sky-700' : 'text-emerald-700'}`}>{customer.status}</span></span>
                        <span className="mt-1 block text-xs text-slate-600">{number.normalized || customer.phone || 'No number'} · {count} document{count === 1 ? '' : 's'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Dispatch queue">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold">Dispatch queue</h2><p className="mt-1 text-xs text-slate-500">Select a customer to review their bundle.</p></div>
              <button type="button" onClick={selectAll} className="text-xs font-semibold text-emerald-800 hover:underline">Select all</button>
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-md border border-slate-300 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 py-2 text-sm outline-none" placeholder="Search name, phone, booking..." />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter customers">
              {(['all', 'ready', 'sent', 'failed', 'skipped'] as QueueFilter[]).map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>
              ))}
            </div>
            <div className="mt-4 flex max-h-[520px] flex-col gap-2 overflow-y-auto">
              {filteredCustomers.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No matching customers.</p>}
              {filteredCustomers.map((customer) => {
                const customerVouchers = vouchers.filter((voucher) => voucher.customerId === customer.id);
                const validPhone = normalizePhoneNumber(customer.phone, customer.countryCode).valid;
                const ready = validPhone && customerVouchers.length > 0 && customer.status !== 'sent' && customer.status !== 'failed' && customer.status !== 'skipped';
                const displayStatus = customer.status === 'prepared' ? (ready ? 'ready' : 'incomplete') : customer.status;
                return (
                  <div key={customer.id} className={`border p-3 ${selectedId === customer.id ? 'border-emerald-600 bg-emerald-50/60' : 'border-slate-200'}`}>
                    <div className="flex gap-2">
                      <input type="checkbox" aria-label={`Select ${customer.name}`} checked={selectedQueue.includes(customer.id)} onChange={(event) => setSelectedQueue((current) => event.target.checked ? [...current, customer.id] : current.filter((id) => id !== customer.id))} className="mt-1 accent-emerald-700" />
                      <button type="button" onClick={() => chooseCustomer(customer)} className="min-w-0 flex-1 text-left">
                        <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{customer.name}</span><span className={`text-[10px] font-bold uppercase ${displayStatus === 'ready' ? 'text-emerald-700' : displayStatus === 'sent' ? 'text-sky-700' : 'text-slate-500'}`}>{displayStatus}</span></span>
                        <span className="mt-1 block truncate text-xs text-slate-600">{customer.packageName || 'Package not specified'} · {customerVouchers.length} document{customerVouchers.length === 1 ? '' : 's'}</span>
                        <span className="mt-1 block text-xs text-slate-500">{normalizePhoneNumber(customer.phone, customer.countryCode).normalized || customer.phone || 'Phone missing'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={prepareSelected} disabled={!selectedQueue.length} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              <CheckCheck className="h-4 w-4" /> Prepare selected
            </button>
          </section>

          <section className="space-y-4" aria-label="Selected customer dispatch">
            {selectedCustomer ? (
              <>
                <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Ready to send</p>
                      <h2 className="mt-1 break-words text-xl font-bold">{selectedCustomer.name}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MessageCircle className="h-4 w-4" />{phoneValidation.normalized || selectedCustomer.phone || 'Phone needed'}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${currentStatus === 'ready' ? 'bg-emerald-100 text-emerald-800' : currentStatus === 'sent' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}`}>{currentStatus}</span>
                  </div>
                  <p className={`mt-2 text-xs ${phoneValidation.valid ? 'text-emerald-700' : 'text-amber-700'}`}>{phoneValidation.valid ? '✓' : '⚠'} {phoneValidation.message}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm">
                    <div><dt className="text-xs text-slate-500">Package</dt><dd className="mt-0.5 break-words font-medium">{selectedCustomer.packageName || 'Not provided'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Booking</dt><dd className="mt-0.5 break-words font-medium">{selectedCustomer.bookingReference || 'Not provided'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Travel dates</dt><dd className="mt-0.5 break-words font-medium">{selectedCustomer.travelDates || 'Not provided'}</dd></div>
                    <div><dt className="text-xs text-slate-500">Documents</dt><dd className="mt-0.5 font-medium">{selectedVouchers.length}</dd></div>
                  </dl>
                </div>

                <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Voucher bundle</h3><span className="text-xs text-slate-500">{selectedVouchers.length} file{selectedVouchers.length === 1 ? '' : 's'}</span></div>
                  {vouchers.length === 0 && <p className="border border-dashed border-slate-300 p-4 text-sm text-slate-500">Upload vouchers to begin assigning documents.</p>}
                  {vouchers.length > 0 && <div className="max-h-64 space-y-2 overflow-y-auto">
                    {vouchers.map((voucher) => {
                      const isImage = voucher.file.type.startsWith('image/');
                      const Icon = isImage ? FileImage : FileText;
                      return <div key={voucher.id} className="flex min-w-0 items-center gap-2 border border-slate-200 px-2.5 py-2">
                        <Icon className="h-4 w-4 shrink-0 text-emerald-700" />
                        <button type="button" onClick={() => setPreview(voucher)} className="min-w-0 flex-1 truncate text-left text-xs font-medium hover:underline" title={voucher.file.name}>{voucher.file.name}<span className="ml-1.5 font-normal text-slate-500">{formatFileSize(voucher.file.size)}</span></button>
                        <select aria-label={`Assign ${voucher.file.name}`} value={voucher.customerId} onChange={(event) => assignVoucher(voucher.id, event.target.value)} className="max-w-[118px] rounded border border-slate-300 bg-white px-1.5 py-1 text-xs"><option value="">Unassigned</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select>
                        <button type="button" onClick={() => downloadVoucher(voucher)} title="Download voucher" aria-label={`Download ${voucher.file.name}`} className="p-1 text-slate-500 hover:text-slate-900"><ArrowDownToLine className="h-4 w-4" /></button>
                        <button type="button" onClick={() => removeVoucher(voucher.id)} title="Remove voucher" aria-label={`Remove ${voucher.file.name}`} className="p-1 text-slate-500 hover:text-rose-700"><X className="h-4 w-4" /></button>
                      </div>;
                    })}
                  </div>}
                  <button type="button" onClick={() => void downloadAll()} disabled={!selectedVouchers.length} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><ArrowDownToLine className="h-4 w-4" /> Download all vouchers (.zip)</button>
                </div>

                <div className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Message</h3><select aria-label="Message template" value={templateId} onChange={(event) => changeTemplate(event.target.value)} className="max-w-[190px] rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs">{MESSAGE_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}</select></div>
                  <p className="mt-2 text-xs text-slate-500">Edit before opening WhatsApp. The message is not sent automatically.</p>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={11} maxLength={4000} className="mt-3 w-full resize-y rounded-md border border-slate-300 p-3 text-sm leading-5 outline-none focus:border-emerald-600" aria-label="Editable WhatsApp message" />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => void copyText(message, 'Message')} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50"><Clipboard className="h-4 w-4" /> Copy message</button>
                    <button type="button" onClick={() => void copyText(phoneValidation.normalized || selectedCustomer.phone, 'Phone number')} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50"><Clipboard className="h-4 w-4" /> Copy number</button>
                  </div>
                  <button type="button" onClick={openWhatsApp} disabled={!phoneValidation.valid || !selectedVouchers.length} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#177b55] px-4 py-3 text-sm font-bold text-white hover:bg-[#116544] disabled:cursor-not-allowed disabled:bg-slate-300"><MessageCircle className="h-4 w-4" /> Open WhatsApp</button>
                  <p className="mt-2 text-center text-xs leading-5 text-slate-500">In WhatsApp, attach the downloaded documents and send them yourself. Return here to confirm.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" disabled={!phoneValidation.valid || !selectedVouchers.length} onClick={() => updateStatus(selectedCustomer, 'sent', 'Manually confirmed as sent by operator.')} className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-700 px-3 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-4 w-4" /> Mark as sent</button>
                    <button type="button" onClick={nextCustomer} className="rounded-md border border-slate-300 px-3 py-2.5 text-sm font-semibold hover:bg-slate-50">Next customer</button>
                    <button type="button" onClick={() => updateStatus(selectedCustomer, 'failed', 'Operator marked dispatch as failed.')} className="rounded-md px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Mark failed</button>
                    <button type="button" onClick={() => updateStatus(selectedCustomer, 'skipped', 'Operator skipped this dispatch.')} className="rounded-md px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Skip customer</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-slate-300 bg-white p-8 text-center">
                <UserRound className="h-9 w-9 text-slate-400" /><h2 className="mt-3 font-semibold">Select a customer</h2><p className="mt-1 max-w-xs text-sm text-slate-500">Create a customer and assign vouchers to prepare a secure manual handoff.</p>
              </div>
            )}

            <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Dispatch history">
              <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-emerald-700" /> Dispatch history</h3><div className="flex items-center gap-3"><span className="text-xs text-slate-500">This browser only</span>{history.length > 0 && <button type="button" onClick={() => { if (window.confirm('Clear all locally saved dispatch history from this browser?')) setHistory([]); }} className="text-xs font-semibold text-rose-700 hover:underline">Clear</button>}</div></div>
              {history.length === 0 ? <p className="mt-3 text-sm text-slate-500">Status changes will appear here.</p> : <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
                {history.slice(0, 30).map((entry) => <div key={entry.id} className="flex items-start justify-between gap-3 border-t border-slate-100 pt-2 text-xs"><div className="min-w-0"><p className="truncate font-semibold">{entry.customerName} · {statusLabel(entry.status)}</p><p className="mt-0.5 truncate text-slate-500">{entry.bookingReference || entry.packageName || entry.phone} · {entry.voucherNames.length} file(s)</p><p className="mt-0.5 text-slate-400">{new Date(entry.createdAt).toLocaleString()} · {entry.user}</p></div><Clock3 className="h-4 w-4 shrink-0 text-slate-400" /></div>)}
              </div>}
            </section>
          </section>
        </div>

        <footer className="border-t border-slate-200 py-4 text-xs leading-5 text-slate-500">
          WhatsApp Web handoff only. Travel4Life does not access WhatsApp sessions or send messages/files automatically. Dispatch history (including customer contact metadata) is stored locally in this browser and is not shared across devices.
        </footer>
      </div>

      {preview && previewUrl && <div role="dialog" aria-modal="true" aria-label={`Preview ${preview.file.name}`} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4" onClick={() => setPreview(null)}>
        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{preview.file.name}</p><p className="text-xs text-slate-500">{formatFileSize(preview.file.size)}</p></div><button type="button" onClick={() => setPreview(null)} aria-label="Close preview" className="rounded p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
          {preview.file.type === 'application/pdf' ? <iframe title={`Preview ${preview.file.name}`} src={previewUrl} className="h-[75vh] w-full" /> : <img src={previewUrl} alt={preview.file.name} className="max-h-[75vh] w-full object-contain p-4" />}
        </div>
      </div>}
    </div>
  );
};