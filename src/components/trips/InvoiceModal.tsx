import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
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

  const buildInvoiceHtml = () => {
    const logoUrl = `${window.location.origin}/travel4life.png`;
    const line = (label: string, value: string) => `<div class="row"><span>${label}</span><strong>${value}</strong></div>`;

    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(invoiceNumber)} - Travel4life</title>
<style>
body{margin:0;background:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif}.page{max-width:850px;margin:32px auto;padding:42px;background:#fff;box-shadow:0 8px 28px rgba(15,23,42,.12)}.header{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #0ea5e9;padding-bottom:24px}.logo{width:132px;height:72px;object-fit:contain;object-position:left}.muted{color:#64748b}.right{text-align:right}.title{font-size:28px;font-weight:700;margin:18px 0 6px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:28px 0}.box{padding:18px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px}.box h3{font-size:14px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px;color:#0369a1}.row{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid #e5e7eb}.row:last-child{border-bottom:0}.total{font-size:20px;background:#ecfdf5;border-color:#a7f3d0}.footer{margin-top:30px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6}@media print{body{background:#fff}.page{margin:0;box-shadow:none;max-width:none}}@media(max-width:650px){.page{margin:0;padding:22px}.header,.grid{display:block}.right{text-align:left;margin-top:16px}}
</style></head><body><main class="page">
<div class="header"><div><img class="logo" src="${logoUrl}" alt="Travel4life"><div><strong>${escapeHtml(company.name)}</strong><br>${escapeHtml(company.website)}<br>${escapeHtml(company.address)}<br>GST: ${escapeHtml(company.gst)}</div></div><div class="right"><div class="title">Invoice</div><div>Invoice no: ${escapeHtml(invoiceNumber)}</div><div>Issued: ${escapeHtml(invoiceDates.issued)}</div><div>Payment due: ${escapeHtml(invoiceDates.due)}</div></div></div>
<div class="grid"><section class="box"><h3>Billed to</h3><div>${escapeHtml(form.fullName)}<br>${escapeHtml(form.email)}<br>${escapeHtml(form.phone)}<br>${escapeHtml(form.address).replaceAll('\n', '<br>')}${form.gstCompany ? `<br>GST / Company: ${escapeHtml(form.gstCompany)}` : ''}</div></section><section class="box"><h3>Trip</h3><div><strong>${escapeHtml(trip.title)}</strong><br>${escapeHtml(trip.destination)}<br>${escapeHtml(trip.duration.toString())} days<br>${escapeHtml(trip.start_date)} to ${escapeHtml(trip.end_date)}<br>Travellers: ${form.people}</div></section></div>
<section class="box"><h3>Amount summary</h3>${line('Product price per person', formatMoney(Number(trip.price) || 0, currencySymbol))}${line(`Quantity (${form.people})`, formatMoney(totals.subtotal, currencySymbol))}${line('GST 5%', formatMoney(totals.gst, currencySymbol))}${line('Amount including GST', formatMoney(totals.gstInclusive, currencySymbol))}${line('TCS 5%', formatMoney(totals.tcs, currencySymbol))}<div class="row total"><span>Total amount due</span><strong>${formatMoney(totals.total, currencySymbol)}</strong></div></section>
<div class="grid"><section class="box"><h3>Payment details</h3>Pay by card: ${escapeHtml(company.cardUrl)}<br><br>Bank: ${escapeHtml(company.bankName)}<br>Account name: ${escapeHtml(company.accountName)}<br>Account number: ${escapeHtml(company.accountNumber)}<br>Account type: ${escapeHtml(company.accountType)}<br>IFSC: ${escapeHtml(company.ifsc)}<br>Location: ${escapeHtml(company.bankLocation)}</section><section class="box"><h3>Support</h3>Customer support: ${escapeHtml(company.phone)}<br>Email: ${escapeHtml(company.email)}<br>Sales support: ${escapeHtml(company.support)}<br><br>This invoice is generated from the current trip details and is not payment confirmation.</section></div>
<div class="footer">Payment is due by ${escapeHtml(invoiceDates.due)}. Prices and availability remain subject to the trip's booking terms. GST and TCS are calculated as shown above. Please retain this invoice for your records.</div>
</main></body></html>`;
  };

  const handleDownload = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.address.trim() || !form.phone.trim()) return;
    const blob = new Blob([buildInvoiceHtml()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.address.trim() || !form.phone.trim()) return;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.write(buildInvoiceHtml());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create trip invoice" maxWidth="max-w-3xl">
      <form onSubmit={event => { event.preventDefault(); handleDownload(); }} className="space-y-4">
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
          <button type="button" onClick={handlePrint} className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"><Printer className="h-4 w-4" /> Print / Save PDF</button>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"><Download className="h-4 w-4" /> Download Invoice</button>
        </div>
      </form>
    </Modal>
  );
};
