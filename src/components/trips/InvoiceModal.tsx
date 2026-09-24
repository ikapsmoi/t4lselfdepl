import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Trip } from '../../types';
import { Modal } from '../ui/Modal';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  currencySymbol: string;
}

interface InvoiceForm {
  fullName: string;
  email: string;
  address: string;
  phone: string;
  gstCompany: string;
  people: number;
}

interface CompanyDetails {
  name: string;
  website: string;
  gst: string;
  address: string;
  phone: string;
  email: string;
  support: string;
  cardUrl: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  ifsc: string;
  bankLocation: string;
}

const fallbackCompanyDetails: CompanyDetails = {
  name: 'Travel4life Global',
  website: 'travel4life.net',
  gst: '07AIGPK7468L1ZN',
  address: 'D36, R.K. Puram, Sector-6, Delhi 110022',
  phone: '+91-9511446642',
  email: 'info@travel4life.net',
  support: 'travel4lifesales@gmail.com',
  cardUrl: 'https://razorpay.me/@travel4life',
  bankName: 'HDFC Bank',
  accountName: 'Travel4life Global',
  accountNumber: '50200116350847',
  accountType: 'Current',
  ifsc: 'HDFC0007564',
  bankLocation: 'Mangal Bazaar',
};

const initialForm: InvoiceForm = {
  fullName: '',
  email: '',
  address: '',
  phone: '',
  gstCompany: '',
  people: 1,
};

const formatMoney = (value: number, currencySymbol: string) =>
  `${currencySymbol}${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (date: Date) => date.toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const parseCompanyDetails = (text: string): CompanyDetails => ({
  ...fallbackCompanyDetails,
  name: text.match(/^travel4life global\s*$/im)?.[0]?.trim() || fallbackCompanyDetails.name,
  website: text.match(/^(travel4life\.net)\s*$/im)?.[1] || fallbackCompanyDetails.website,
  gst: text.match(/^GST:\s*(.+)$/im)?.[1]?.trim() || fallbackCompanyDetails.gst,
  address: text.match(/^(D36,.+)$/im)?.[1]?.trim() || fallbackCompanyDetails.address,
  phone: text.match(/Customer Support Number:\s*(.+)$/im)?.[1]?.trim() || fallbackCompanyDetails.phone,
  email: text.match(/^Email:\s*(.+)$/im)?.[1]?.trim() || fallbackCompanyDetails.email,
  support: text.match(/^Support:\s*(.+)$/im)?.[1]?.trim() || fallbackCompanyDetails.support,
});

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, trip, currencySymbol }) => {
  const [form, setForm] = useState<InvoiceForm>(initialForm);
  const [company, setCompany] = useState<CompanyDetails>(fallbackCompanyDetails);
  const [companyLoading, setCompanyLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCompanyLoading(true);
    fetch('/travel4life%20global---invoice%20all%20details.txt')
      .then(response => response.ok ? response.text() : '')
      .then(text => {
        if (text) setCompany(parseCompanyDetails(text));
      })
      .catch(() => setCompany(fallbackCompanyDetails))
      .finally(() => setCompanyLoading(false));
  }, [isOpen]);

  const totals = useMemo(() => {
    const subtotal = Math.max(0, Number(trip.price) || 0) * Math.max(1, Number(form.people) || 1);
    const gst = subtotal * 0.05;
    const gstInclusive = subtotal + gst;
    const tcs = gstInclusive * 0.05;
    return {
      subtotal,
      gst,
      gstInclusive,
      tcs,
      total: gstInclusive + tcs,
    };
  }, [form.people, trip.price]);

  const invoiceDates = useMemo(() => {
    const issued = new Date();
    const due = new Date(issued);
    due.setDate(due.getDate() + 14);
    return { issued: formatDate(issued), due: formatDate(due) };
  }, [isOpen]);

  const invoiceNumber = useMemo(() => {
    const date = new Date();
    return `T4L-${date.toISOString().slice(0, 10).replaceAll('-', '')}-${trip.id.slice(0, 6).toUpperCase()}`;
  }, [trip.id, isOpen]);

  const updateField = (field: keyof InvoiceForm, value: string) => {
    setForm(previous => ({
      ...previous,
      [field]: field === 'people' ? Math.max(1, Number(value) || 1) : value,
    }));
  };

  const buildInvoiceSvg = () => {
    const text = (value: string) => escapeHtml(value);
    const amountLine = (label: string, value: string, y: number, bold = false) =>
      `<text x="90" y="${y}" class="${bold ? 'bold' : ''}">${text(label)}</text><text x="1310" y="${y}" text-anchor="end" class="${bold ? 'bold' : ''}">${text(value)}</text>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1400" height="1900" viewBox="0 0 1400 1900">
<rect width="1400" height="1900" fill="#ffffff"/>
<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111827;font-size:25px}.muted{fill:#64748b;font-size:21px}.label{fill:#0369a1;font-size:19px;font-weight:bold;letter-spacing:2px}.bold{font-weight:bold}.line{stroke:#e5e7eb;stroke-width:2}.box{fill:#f8fafc;stroke:#e5e7eb;stroke-width:2}.total{fill:#ecfdf5;stroke:#a7f3d0;stroke-width:2}</style>
<rect x="0" y="0" width="1400" height="18" fill="#0ea5e9"/><text x="90" y="105" font-size="42" class="bold">TRAVEL4LIFE GLOBAL</text><text x="90" y="150" class="muted">${text(company.website)}</text><text x="90" y="185" class="muted">${text(company.address)}</text><text x="90" y="220" class="muted">GST: ${text(company.gst)}</text>
<text x="1310" y="105" text-anchor="end" font-size="48" class="bold">Invoice</text><text x="1310" y="150" text-anchor="end" class="muted">Invoice no: ${text(invoiceNumber)}</text><text x="1310" y="185" text-anchor="end" class="muted">Issued: ${text(invoiceDates.issued)}</text><text x="1310" y="220" text-anchor="end" class="muted">Due: ${text(invoiceDates.due)}</text>
<rect x="70" y="360" width="610" height="250" rx="14" class="box"/><rect x="720" y="360" width="610" height="250" rx="14" class="box"/><text x="100" y="410" class="label">BILLED TO</text><text x="100" y="455" class="bold">${text(form.fullName)}</text><text x="100" y="492" class="muted">${text(form.email)}</text><text x="100" y="529" class="muted">${text(form.phone)}</text><text x="100" y="566" class="muted">${text(form.address)}</text>${form.gstCompany ? `<text x="100" y="603" class="muted">GST / Company: ${text(form.gstCompany)}</text>` : ''}<text x="750" y="410" class="label">TRIP</text><text x="750" y="455" class="bold">${text(trip.title)}</text><text x="750" y="492" class="muted">${text(trip.destination)}</text><text x="750" y="529" class="muted">${text(trip.duration.toString())} days</text><text x="750" y="566" class="muted">${text(trip.start_date)} to ${text(trip.end_date)}</text><text x="750" y="603" class="muted">Travellers: ${form.people}</text>
<rect x="70" y="660" width="1260" height="470" rx="14" class="box"/><text x="100" y="715" class="label">AMOUNT SUMMARY</text>${amountLine('Product price per person', formatMoney(Number(trip.price) || 0, currencySymbol), 780)}${amountLine(`Quantity (${form.people})`, formatMoney(totals.subtotal, currencySymbol), 835)}${amountLine('GST 5%', formatMoney(totals.gst, currencySymbol), 890)}${amountLine('Amount including GST', formatMoney(totals.gstInclusive, currencySymbol), 945)}${amountLine('TCS 5%', formatMoney(totals.tcs, currencySymbol), 1000)}<rect x="90" y="1030" width="1220" height="70" rx="10" class="total"/>${amountLine('Total amount due', formatMoney(totals.total, currencySymbol), 1075, true)}
<rect x="70" y="1180" width="610" height="380" rx="14" class="box"/><rect x="720" y="1180" width="610" height="380" rx="14" class="box"/><text x="100" y="1230" class="label">PAYMENT DETAILS</text><text x="100" y="1275" class="muted">Pay by card: ${text(company.cardUrl)}</text><text x="100" y="1315" class="muted">Bank: ${text(company.bankName)}</text><text x="100" y="1355" class="muted">Account: ${text(company.accountName)}</text><text x="100" y="1395" class="muted">A/C: ${text(company.accountNumber)}</text><text x="100" y="1435" class="muted">IFSC: ${text(company.ifsc)}</text><text x="100" y="1475" class="muted">Type: ${text(company.accountType)}</text><text x="750" y="1230" class="label">SUPPORT</text><text x="750" y="1275" class="muted">${text(company.phone)}</text><text x="750" y="1315" class="muted">${text(company.email)}</text><text x="750" y="1355" class="muted">${text(company.support)}</text><text x="750" y="1435" class="muted">This invoice is not payment confirmation.</text>
<line x1="70" y1="1650" x2="1330" y2="1650" class="line"/><text x="70" y="1700" class="muted">Payment due by ${text(invoiceDates.due)}. GST and TCS are calculated as shown above.</text><text x="70" y="1740" class="muted">Prices and availability remain subject to the trip booking terms.</text>
</svg>`;
  };

  const hasRequiredDetails = () =>
    Boolean(form.fullName.trim() && form.email.trim() && form.address.trim() && form.phone.trim());

  const handleDownloadImage = async () => {
    if (!hasRequiredDetails()) return;

    const svgBlob = new Blob([buildInvoiceSvg()], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 1900;
      const context = canvas.getContext('2d');
      context?.drawImage(image, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) return;
        const imageUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${invoiceNumber}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(imageUrl);
      }, 'image/png');
      URL.revokeObjectURL(svgUrl);
    };
    image.onerror = () => URL.revokeObjectURL(svgUrl);
    image.src = svgUrl;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create trip invoice" maxWidth="max-w-3xl">
      <form onSubmit={event => { event.preventDefault(); handleDownloadImage(); }} className="space-y-4">
        <div className="rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">
          Enter the customer details and booking quantity. GST is calculated at 5%, then TCS at 5% on the GST-inclusive amount. Payment is due within 14 days.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Full Name *
            <input required value={form.fullName} onChange={event => updateField('fullName', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-medium text-gray-700">Email *
            <input required type="email" value={form.email} onChange={event => updateField('email', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-medium text-gray-700">Phone Number *
            <input required type="tel" value={form.phone} onChange={event => updateField('phone', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-medium text-gray-700">GST / Company
            <input value={form.gstCompany} onChange={event => updateField('gstCompany', event.target.value)} placeholder="Optional" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Address *
            <textarea required rows={2} value={form.address} onChange={event => updateField('address', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-medium text-gray-700">Number of people *
            <input required min={1} type="number" value={form.people} onChange={event => updateField('people', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><FileText className="h-4 w-4 text-sky-600" /> {trip.title}</div>
          <div className="grid grid-cols-2 gap-2 text-gray-600 md:grid-cols-5">
            <span>Unit: {formatMoney(Number(trip.price) || 0, currencySymbol)}</span>
            <span>Qty: {form.people}</span>
            <span>GST: {formatMoney(totals.gst, currencySymbol)}</span>
            <span>TCS: {formatMoney(totals.tcs, currencySymbol)}</span>
            <strong className="text-gray-900">Total: {formatMoney(totals.total, currencySymbol)}</strong>
          </div>
          <p className="mt-2 text-xs text-gray-500">Invoice date: {invoiceDates.issued} · Due date: {invoiceDates.due}{companyLoading ? ' · Loading company details...' : ''}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"><Download className="h-4 w-4" /> Download Invoice Image</button>
        </div>
      </form>
    </Modal>
  );
};
