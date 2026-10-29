import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Trip } from '../../types';
import { Modal } from '../ui/Modal';

interface InvoiceModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PackageInvoiceDetails {
  id: string;
  title: string;
  destination: string;
  duration: number;
  startDate: string;
  endDate: string;
  adultPrice: number;
  childPrice: number;
  currencySymbol: string;
}

type InvoiceModalProps = InvoiceModalBaseProps & (
  | { trip: Trip; currencySymbol: string; packageDetails?: never }
  | { packageDetails: PackageInvoiceDetails; trip?: never; currencySymbol?: never }
);

interface InvoiceForm {
  fullName: string;
  email: string;
  address: string;
  phone: string;
  gstCompany: string;
  people: number;
  children: number;
  childAges: string[];
}

interface PaymentInstallment {
  name: string;
  date: string;
  amount: string;
}

interface ChildPricingTier {
  category: string;
  modifier: number;
}

const getChildPricingTier = (ageValue: string): ChildPricingTier => {
  if (!ageValue.trim()) return { category: 'Adult / Teen', modifier: 1 };

  const age = Number(ageValue);
  if (!Number.isInteger(age) || age < 0 || age > 17) return { category: 'Adult / Teen', modifier: 1 };
  if (age < 2) return { category: 'Infant', modifier: 0.2 };
  if (age < 6) return { category: 'Child Without Bed', modifier: 0.4 };
  if (age < 13) return { category: 'Child With Bed', modifier: 0.75 };
  return { category: 'Adult / Teen', modifier: 1 };
};

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
  children: 0,
  childAges: [],
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

export const InvoiceModal: React.FC<InvoiceModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const packageDetails = props.packageDetails;
  const isPackageInvoice = Boolean(packageDetails);
  const trip = props.trip;
  const currencySymbol = packageDetails?.currencySymbol || props.currencySymbol || '$';
  const tripTitle = packageDetails?.title || trip?.title || '';
  const tripId = packageDetails?.id || trip?.id || '';
  const tripDestination = packageDetails?.destination || trip?.destination || '';
  const tripDuration = packageDetails?.duration ?? trip?.duration ?? 0;
  const tripStartDate = packageDetails?.startDate || trip?.start_date || '';
  const tripEndDate = packageDetails?.endDate || trip?.end_date || '';
  const adultPrice = Math.max(0, Number(packageDetails?.adultPrice ?? trip?.price) || 0);
  const [form, setForm] = useState<InvoiceForm>(initialForm);
  const [company, setCompany] = useState<CompanyDetails>(fallbackCompanyDetails);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [excludeTaxes, setExcludeTaxes] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<PaymentInstallment[]>([]);
  const [paymentPlanError, setPaymentPlanError] = useState('');

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
    const adults = Math.max(1, Number(form.people) || 1);
    const children = isPackageInvoice ? Math.max(0, Number(form.children) || 0) : 0;
    const childPrices = form.childAges.slice(0, children).map((age) => {
      const tier = getChildPricingTier(age);
      return { age, ...tier, price: adultPrice * tier.modifier };
    });
    const childSubtotal = childPrices.reduce((sum, child) => sum + child.price, 0);
    const subtotal = adultPrice * adults + childSubtotal;
    const gst = excludeTaxes ? 0 : subtotal * 0.05;
    const gstInclusive = subtotal + gst;
    const tcs = excludeTaxes ? 0 : gstInclusive * 0.05;
    return {
      subtotal,
      adults,
      children,
      childPrices,
      childSubtotal,
      gst,
      gstInclusive,
      tcs,
      total: excludeTaxes ? subtotal : gstInclusive + tcs,
    };
  }, [adultPrice, excludeTaxes, form.childAges, form.children, form.people, isPackageInvoice]);

  const invoiceDates = useMemo(() => {
    const issued = new Date();
    const due = new Date(issued);
    due.setDate(due.getDate() + 14);
    return { issued: formatDate(issued), due: formatDate(due) };
  }, [isOpen]);

  const invoiceNumber = useMemo(() => {
    const date = new Date();
    return `T4L-${date.toISOString().slice(0, 10).replaceAll('-', '')}-${tripId.slice(0, 6).toUpperCase()}`;
  }, [tripId, isOpen]);

  const updateField = (field: keyof InvoiceForm, value: string) => {
    const count = Math.floor(Math.max(0, Number(value) || 0));
    setForm(previous => ({
      ...previous,
      [field]: field === 'people'
        ? Math.max(1, count)
        : field === 'children'
          ? count
          : value,
      ...(field === 'children' && {
        childAges: [
          ...previous.childAges.slice(0, count),
          ...Array.from(
            { length: count - previous.childAges.length },
            () => ''
          ),
        ],
      }),
    }));
  };

  const updateChildAge = (index: number, age: string) => {
    setForm((previous) => ({
      ...previous,
      childAges: previous.childAges.map((currentAge, currentIndex) => currentIndex === index ? age : currentAge),
    }));
  };

  const updatePaymentInstallment = (index: number, field: keyof PaymentInstallment, value: string) => {
    setPaymentPlan((previous) => previous.map((installment, currentIndex) =>
      currentIndex === index ? { ...installment, [field]: value } : installment
    ));
    setPaymentPlanError('');
  };

  const validatePaymentPlan = () => {
    if (paymentPlan.length === 0) return '';

    if (paymentPlan.some(({ name, date, amount }) =>
      !name.trim() || !date || !amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0
    )) {
      return 'Complete each installment with a name, date, and positive amount.';
    }

    const plannedTotal = paymentPlan.reduce((sum, installment) => sum + Math.round(Number(installment.amount) * 100), 0);
    const invoiceTotal = Math.round(totals.total * 100);
    if (plannedTotal !== invoiceTotal) {
      return `Installment amounts must add up to ${formatMoney(totals.total, currencySymbol)}.`;
    }

    return '';
  };

  const buildInvoiceSvg = () => {
    const text = (value: string) => escapeHtml(value);
    const childBreakdownLines: string[] = [];
    let currentChildLine = '';
    totals.childPrices.forEach((child, index) => {
      const detail = `Child ${index + 1}: ${child.age === '' ? 'age not provided' : `age ${child.age}`} — ${child.category} (${formatMoney(child.price, currencySymbol)})`;
      if (currentChildLine && `${currentChildLine}; ${detail}`.length > 75) {
        childBreakdownLines.push(currentChildLine);
        currentChildLine = detail;
      } else {
        currentChildLine = currentChildLine ? `${currentChildLine}; ${detail}` : detail;
      }
    });
    if (currentChildLine) childBreakdownLines.push(currentChildLine);
    const summaryOffset = Math.max(0, childBreakdownLines.length - 1) * 24;
    const paymentPlanOffset = paymentPlan.length > 0 ? 220 + paymentPlan.length * 38 : 0;
    const invoiceHeight = 1900 + summaryOffset + paymentPlanOffset;
    const amountLine = (label: string, value: string, y: number, bold = false) =>
      `<text x="90" y="${y + summaryOffset}" class="${bold ? 'bold' : ''}">${text(label)}</text><text x="1310" y="${y + summaryOffset}" text-anchor="end" class="${bold ? 'bold' : ''}">${text(value)}</text>`;
    const invoiceData = {
      invoiceNumber,
      customer: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        gstCompany: form.gstCompany,
      },
      package: { id: tripId, title: tripTitle },
      adults: totals.adults,
      children: totals.childPrices.map(({ age, category, modifier, price }) => ({
        age: age === '' ? null : Number(age),
        category,
        modifier,
        price,
      })),
      taxesExcluded: excludeTaxes,
      paymentPlan: paymentPlan.map(({ name, date, amount }) => ({
        name,
        date,
        amount: Number(amount),
      })),
      totals: {
        subtotal: totals.subtotal,
        gst: totals.gst,
        tcs: totals.tcs,
        total: totals.total,
      },
    };
    const childLabel = packageDetails
      ? `Children (${totals.children}) · age-based pricing`
      : `Child price × ${totals.children}`;
    const amountSummary = isPackageInvoice
      ? `${amountLine(`Adult price × ${totals.adults}`, formatMoney(adultPrice * totals.adults, currencySymbol), 780)}${amountLine(childLabel, formatMoney(totals.childSubtotal, currencySymbol), 835)}${amountLine('Subtotal', formatMoney(totals.subtotal, currencySymbol), 890)}${(excludeTaxes ? '' : `${amountLine('GST 5%', formatMoney(totals.gst, currencySymbol), 945)}${amountLine('TCS 5%', formatMoney(totals.tcs, currencySymbol), 1000)}`)}`
      : `${amountLine('Product price per person', formatMoney(adultPrice, currencySymbol), 780)}${amountLine(`Quantity (${totals.adults})`, formatMoney(totals.subtotal, currencySymbol), 835)}${(excludeTaxes ? '' : `${amountLine('GST 5%', formatMoney(totals.gst, currencySymbol), 890)}${amountLine('Amount including GST', formatMoney(totals.gstInclusive, currencySymbol), 945)}${amountLine('TCS 5%', formatMoney(totals.tcs, currencySymbol), 1000)}`)}`;
    const travellerCount = totals.adults + totals.children;
    const childDetailsLine = isPackageInvoice && childBreakdownLines.length
      ? childBreakdownLines.map((line, index) => `<text x="750" y="${603 + index * 24}" font-size="14" class="muted">${text(line)}</text>`).join('')
      : `<text x="750" y="603" class="muted">Travellers: ${travellerCount}</text>`;
    const paymentPlanSection = paymentPlan.length > 0
      ? `<rect x="70" y="${1180 + summaryOffset}" width="1260" height="${180 + paymentPlan.length * 38}" rx="14" class="box"/><text x="100" y="${1230 + summaryOffset}" class="label">PAYMENT PLAN</text>${paymentPlan.map(({ name, date, amount }, index) => {
        const y = 1280 + summaryOffset + index * 38;
        return `<text x="100" y="${y}" class="muted">${text(name)} · ${text(date)}</text><text x="1300" y="${y}" text-anchor="end" class="muted">${text(formatMoney(Number(amount), currencySymbol))}</text>`;
      }).join('')}`
      : '';
    const invoiceMetadata = `<metadata>${text(JSON.stringify(invoiceData))}</metadata>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1400" height="${invoiceHeight}" viewBox="0 0 1400 ${invoiceHeight}">
${invoiceMetadata}
<rect width="1400" height="${invoiceHeight}" fill="#ffffff"/>
<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111827;font-size:25px}.muted{fill:#64748b;font-size:21px}.label{fill:#0369a1;font-size:19px;font-weight:bold;letter-spacing:2px}.bold{font-weight:bold}.line{stroke:#e5e7eb;stroke-width:2}.box{fill:#f8fafc;stroke:#e5e7eb;stroke-width:2}.total{fill:#ecfdf5;stroke:#a7f3d0;stroke-width:2}</style>
<rect x="0" y="0" width="1400" height="18" fill="#0ea5e9"/><text x="90" y="105" font-size="42" class="bold">TRAVEL4LIFE GLOBAL</text><text x="90" y="150" class="muted">${text(company.website)}</text><text x="90" y="185" class="muted">${text(company.address)}</text><text x="90" y="220" class="muted">GST: ${text(company.gst)}</text>
<text x="1310" y="105" text-anchor="end" font-size="48" class="bold">Invoice</text><text x="1310" y="150" text-anchor="end" class="muted">Invoice no: ${text(invoiceNumber)}</text><text x="1310" y="185" text-anchor="end" class="muted">Issued: ${text(invoiceDates.issued)}</text><text x="1310" y="220" text-anchor="end" class="muted">Due: ${text(invoiceDates.due)}</text>
<rect x="70" y="360" width="610" height="250" rx="14" class="box"/><rect x="720" y="360" width="610" height="${250 + summaryOffset}" rx="14" class="box"/><text x="100" y="410" class="label">BILLED TO</text><text x="100" y="455" class="bold">${text(form.fullName)}</text><text x="100" y="492" class="muted">${text(form.email)}</text><text x="100" y="529" class="muted">${text(form.phone)}</text><text x="100" y="566" class="muted">${text(form.address)}</text>${form.gstCompany ? `<text x="100" y="603" class="muted">GST / Company: ${text(form.gstCompany)}</text>` : ''}<text x="750" y="410" class="label">TRIP</text><text x="750" y="455" class="bold">${text(tripTitle)}</text><text x="750" y="492" class="muted">${text(tripDestination)}</text><text x="750" y="529" class="muted">${text(tripDuration.toString())} days</text><text x="750" y="566" class="muted">${text(tripStartDate)} to ${text(tripEndDate)}</text>${childDetailsLine}
<rect x="70" y="${660 + summaryOffset}" width="1260" height="470" rx="14" class="box"/><text x="100" y="${715 + summaryOffset}" class="label">AMOUNT SUMMARY</text>${amountSummary}<rect x="90" y="${1030 + summaryOffset}" width="1220" height="70" rx="10" class="total"/>${amountLine('Total amount due', formatMoney(totals.total, currencySymbol), 1075, true)}
${paymentPlanSection}<rect x="70" y="${1180 + summaryOffset + paymentPlanOffset}" width="610" height="380" rx="14" class="box"/><rect x="720" y="${1180 + summaryOffset + paymentPlanOffset}" width="610" height="380" rx="14" class="box"/><text x="100" y="${1230 + summaryOffset + paymentPlanOffset}" class="label">PAYMENT DETAILS</text><text x="100" y="${1275 + summaryOffset + paymentPlanOffset}" class="muted">Pay by card: ${text(company.cardUrl)}</text><text x="100" y="${1315 + summaryOffset + paymentPlanOffset}" class="muted">Bank: ${text(company.bankName)}</text><text x="100" y="${1355 + summaryOffset + paymentPlanOffset}" class="muted">Account: ${text(company.accountName)}</text><text x="100" y="${1395 + summaryOffset + paymentPlanOffset}" class="muted">A/C: ${text(company.accountNumber)}</text><text x="100" y="${1435 + summaryOffset + paymentPlanOffset}" class="muted">IFSC: ${text(company.ifsc)}</text><text x="100" y="${1475 + summaryOffset + paymentPlanOffset}" class="muted">Type: ${text(company.accountType)}</text><text x="750" y="${1230 + summaryOffset + paymentPlanOffset}" class="label">SUPPORT</text><text x="750" y="${1275 + summaryOffset + paymentPlanOffset}" class="muted">${text(company.phone)}</text><text x="750" y="${1315 + summaryOffset + paymentPlanOffset}" class="muted">${text(company.email)}</text><text x="750" y="${1355 + summaryOffset + paymentPlanOffset}" class="muted">${text(company.support)}</text><text x="750" y="${1435 + summaryOffset + paymentPlanOffset}" class="muted">This invoice is not payment confirmation.</text>
<line x1="70" y1="${1650 + summaryOffset + paymentPlanOffset}" x2="1330" y2="${1650 + summaryOffset + paymentPlanOffset}" class="line"/><text x="70" y="${1700 + summaryOffset + paymentPlanOffset}" class="muted">Payment due by ${text(invoiceDates.due)}. ${excludeTaxes ? 'GST and TCS are not included in this invoice.' : 'GST and TCS are calculated as shown above.'}</text><text x="70" y="${1740 + summaryOffset + paymentPlanOffset}" class="muted">Prices and availability remain subject to the trip booking terms.</text>
</svg>`;
  };

  const hasRequiredDetails = () =>
    Boolean(form.fullName.trim() && form.email.trim() && form.address.trim() && form.phone.trim());

  const handleDownloadImage = async () => {
    if (!hasRequiredDetails()) return;

    const planError = validatePaymentPlan();
    if (planError) {
      setPaymentPlanError(planError);
      return;
    }

    const svgBlob = new Blob([buildInvoiceSvg()], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || 1400;
      canvas.height = image.naturalHeight || 1900;
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
    <Modal isOpen={isOpen} onClose={onClose} title={packageDetails ? 'Create package invoice' : 'Create trip invoice'} maxWidth="max-w-3xl">
      <form onSubmit={event => { event.preventDefault(); handleDownloadImage(); }} className="space-y-4">
        <div className="rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">
          {isPackageInvoice
            ? `Enter the customer details and traveler counts. Child prices use the adult package price and age-based tiers. ${excludeTaxes ? 'Taxes are excluded; the total is based on the traveler prices only.' : 'GST is calculated at 5%, then TCS at 5% on the GST-inclusive amount.'} Payment is due within 14 days.`
            : `Enter the customer details and booking quantity. ${excludeTaxes ? 'Taxes are excluded; the total is the price per person multiplied by the number of people.' : 'GST is calculated at 5%, then TCS at 5% on the GST-inclusive amount.'} Payment is due within 14 days.`}
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
          <label className="text-sm font-medium text-gray-700">{packageDetails ? 'Number of adults *' : 'Number of people *'}
            <input required min={1} type="number" value={form.people} onChange={event => updateField('people', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          {isPackageInvoice && (
            <>
              <label className="text-sm font-medium text-gray-700">Number of children
                <input min={0} type="number" value={form.children} onChange={event => updateField('children', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
              </label>
              {form.childAges.slice(0, form.children).map((age, index) => {
                const tier = getChildPricingTier(age);
                const hasValidAge = age !== '' && Number.isInteger(Number(age)) && Number(age) >= 0 && Number(age) <= 17;
                return (
                  <label key={`child-age-${index}`} className="text-sm font-medium text-gray-700">
                    Child Age{form.children > 1 ? ` ${index + 1}` : ''}
                    <select
                      aria-label={`Child Age ${index + 1}`}
                      value={age}
                      onChange={(event) => updateChildAge(index, event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="">Age not provided (full adult rate)</option>
                      {Array.from({ length: 18 }, (_, childAge) => (
                        <option key={childAge} value={childAge}>{childAge} years</option>
                      ))}
                    </select>
                    <span className="mt-1 block text-xs text-gray-500">
                      {hasValidAge
                        ? `${tier.category} · ${Math.round(tier.modifier * 100)}% of adult price`
                        : 'Age missing · Adult / Teen · 100% of adult price'}
                    </span>
                  </label>
                );
              })}
            </>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={excludeTaxes}
            onChange={event => setExcludeTaxes(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          <span>
            Exclude taxes (GST and TCS)
            <span className="mt-0.5 block text-xs text-gray-500">Calculate the invoice total using the number of people and traveler prices only.</span>
          </span>
        </label>

        <section className="rounded-lg border border-gray-200 p-4" aria-labelledby="payment-plan-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 id="payment-plan-heading" className="text-sm font-semibold text-gray-900">Payment plan <span className="font-normal text-gray-500">(optional)</span></h3>
              <p className="mt-1 text-xs text-gray-500">Add installments with a name, due date, and amount. Amounts must add up to the invoice total.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPaymentPlan(previous => [...previous, { name: '', date: '', amount: '' }]);
                setPaymentPlanError('');
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add installment
            </button>
          </div>
          {paymentPlan.map((installment, index) => (
            <div key={`payment-installment-${index}`} className="mb-3 grid grid-cols-1 items-end gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="text-xs font-medium text-gray-700">
                Installment name
                <input
                  type="text"
                  value={installment.name}
                  onChange={event => updatePaymentInstallment(index, 'name', event.target.value)}
                  placeholder="e.g. Booking deposit"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Due date
                <input
                  type="date"
                  value={installment.date}
                  onChange={event => updatePaymentInstallment(index, 'date', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={installment.amount}
                  onChange={event => updatePaymentInstallment(index, 'amount', event.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setPaymentPlan(previous => previous.filter((_, currentIndex) => currentIndex !== index));
                  setPaymentPlanError('');
                }}
                aria-label={`Remove installment ${index + 1}`}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white"
              >
                Remove
              </button>
            </div>
          ))}
          {paymentPlanError && <p role="alert" className="mt-2 text-sm text-red-600">{paymentPlanError}</p>}
        </section>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><FileText className="h-4 w-4 text-sky-600" /> {tripTitle}</div>
          <div className="grid grid-cols-2 gap-2 text-gray-600 md:grid-cols-5">
            <span>{packageDetails ? `Adult: ${formatMoney(adultPrice, currencySymbol)} × ${totals.adults}` : `Unit: ${formatMoney(adultPrice, currencySymbol)}`}</span>
            {isPackageInvoice && <span>Children: {formatMoney(totals.childSubtotal, currencySymbol)}</span>}
            {!isPackageInvoice && <span>Qty: {form.people}</span>}
            {!excludeTaxes && <span>GST: {formatMoney(totals.gst, currencySymbol)}</span>}
            {!excludeTaxes && <span>TCS: {formatMoney(totals.tcs, currencySymbol)}</span>}
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
