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

interface CustomerPayment {
  date: string;
  amount: string;
  mode: string;
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
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [customerPaymentsError, setCustomerPaymentsError] = useState('');

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
    return `T4L-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${tripId.slice(0, 6).toUpperCase()}`;
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

  const updateCustomerPayment = (index: number, field: keyof CustomerPayment, value: string) => {
    setCustomerPayments(previous => previous.map((payment, currentIndex) =>
      currentIndex === index ? { ...payment, [field]: value } : payment
    ));
    setCustomerPaymentsError('');
  };

  const updatePaymentInstallment = (index: number, field: keyof PaymentInstallment, value: string) => {
    setPaymentPlan((previous) => previous.map((installment, currentIndex) =>
      currentIndex === index ? { ...installment, [field]: value } : installment
    ));
    setPaymentPlanError('');
  };

  const validateCustomerPayments = () => {
    if (customerPayments.length === 0) return '';

    if (customerPayments.some(({ date, amount, mode }) =>
      !date || !mode || !amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0
    )) {
      return 'Complete each received payment with a date, amount, and payment mode.';
    }

    const receivedTotal = Math.round(customerPayments.reduce((sum, payment) => sum + Number(payment.amount) * 100, 0));
    if (receivedTotal > Math.round(totals.total * 100)) {
      return `Received payments cannot exceed ${formatMoney(totals.total, currencySymbol)}.`;
    }

    return '';
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

  const buildInvoiceSvg = async () => {
    const text = (value: string) => escapeHtml(value);
    let logoDataUrl = '';
    try {
      const logoResponse = await fetch('/logo.png');
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.readAsDataURL(logoBlob);
        });
      }
    } catch {
      logoDataUrl = '';
    }

    const invoiceData = {
      invoiceNumber,
      customer: { fullName: form.fullName, email: form.email, phone: form.phone, address: form.address, gstCompany: form.gstCompany },
      package: { id: tripId, title: tripTitle },
      adults: totals.adults,
      children: totals.childPrices.map(({ age, category, modifier, price }) => ({ age: age === '' ? null : Number(age), category, modifier, price })),
      taxesExcluded: excludeTaxes,
      paymentPlan: paymentPlan.map(({ name, date, amount }) => ({ name, date, amount: Number(amount) })),
      totals: { subtotal: totals.subtotal, gst: totals.gst, tcs: totals.tcs, total: totals.total },
      customerPayments: customerPayments.map(({ date, amount, mode }) => ({ date, amount: Number(amount), mode })),
    };

    const wrapAddress = (value: string, maxChars = 36) => {
      const words = text(value).split(/\s+/);
      const lines: string[] = [];
      let line = '';
      words.forEach((word: string) => {
        if (`${line} ${word}`.trim().length > maxChars && line) {
          lines.push(line);
          line = word;
        } else {
          line = `${line} ${word}`.trim();
        }
      });
      if (line) lines.push(line);
      return lines.slice(0, 3);
    };
    const addressLines = wrapAddress(form.address);
    const planHeight = paymentPlan.length > 0 ? 170 + paymentPlan.length * 56 : 0;
    const receivedPaymentsHeight = customerPayments.length > 0 ? 170 + customerPayments.length * 48 : 0;
    const paymentHeight = planHeight + receivedPaymentsHeight;
    const invoiceHeight = 1980 + paymentHeight;
    const paymentPlanY = 1080 + receivedPaymentsHeight;
    const paymentPlanSection = paymentPlan.length > 0
      ? `<rect x="70" y="${paymentPlanY}" width="1260" height="${paymentHeight}" rx="8" fill="#fafaf9" stroke="#e7e5e4"/><text x="100" y="${paymentPlanY + 48}" class="section">Payment plan</text>${paymentPlan.map(({ name, date, amount }, index) => {
        const y = paymentPlanY + 96 + index * 56;
        return `<text x="100" y="${y}" class="body">${text(name)}</text><text x="770" y="${y}" class="body">${text(date)}</text><text x="1300" y="${y}" text-anchor="end" class="body strong">${text(formatMoney(Number(amount), currencySymbol))}</text>`;
      }).join('')}<line x1="100" y1="${paymentPlanY + 70}" x2="1300" y2="${paymentPlanY + 70}" class="divider"/>`
      : '';
    const chargeRows = isPackageInvoice
      ? [{ label: `Adult travellers × ${totals.adults}`, amount: adultPrice * totals.adults }, ...(totals.children > 0 ? [{ label: `Children × ${totals.children} · age-based pricing`, amount: totals.childSubtotal }] : [])]
      : [{ label: `Travel package × ${totals.adults}`, amount: adultPrice * totals.adults }];
    const chargeRowsMarkup = chargeRows.map((row, index) => {
      const y = 930 + index * 58;
      return `<text x="100" y="${y}" class="body">${text(row.label)}</text><text x="1300" y="${y}" text-anchor="end" class="body strong">${text(formatMoney(row.amount, currencySymbol))}</text><line x1="100" y1="${y + 24}" x2="1300" y2="${y + 24}" class="divider"/>`;
    }).join('');
    const taxY = 930 + chargeRows.length * 58;
    const taxRowsMarkup = excludeTaxes
      ? ''
      : `<text x="100" y="${taxY}" class="body mutedText">GST at 5%</text><text x="1300" y="${taxY}" text-anchor="end" class="body mutedText">${text(formatMoney(totals.gst, currencySymbol))}</text><text x="100" y="${taxY + 48}" class="body mutedText">TCS at 5%</text><text x="1300" y="${taxY + 48}" text-anchor="end" class="body mutedText">${text(formatMoney(totals.tcs, currencySymbol))}</text>`;
    const paymentsTotal = customerPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balanceDue = Math.max(0, totals.total - paymentsTotal);
    const paymentsSection = customerPayments.length > 0
      ? `<rect x="70" y="1080" width="1260" height="${receivedPaymentsHeight}" rx="8" fill="#fafaf9" stroke="#e7e5e4"/><text x="100" y="1128" class="section">Payments received</text>${customerPayments.map((payment, index) => {
          const y = 1176 + index * 48;
          return `<text x="100" y="${y}" class="body mutedText">${text(payment.date)} · ${text(payment.mode)}</text><text x="1300" y="${y}" text-anchor="end" class="body strong">-${text(formatMoney(Number(payment.amount), currencySymbol))}</text>`;
        }).join('')}<line x1="100" y1="1150" x2="1300" y2="1150" class="divider"/>`
      : '';
    const detailsY = 1080 + paymentHeight;
    const footerY = 1680 + paymentHeight;
    const logoMarkup = logoDataUrl ? `<image href="${logoDataUrl}" x="70" y="62" width="150" height="150" preserveAspectRatio="xMidYMid meet"/>` : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="${invoiceHeight}" viewBox="0 0 1400 ${invoiceHeight}">
<metadata>${text(JSON.stringify(invoiceData))}</metadata>
<rect width="1400" height="${invoiceHeight}" fill="#ffffff"/>
<style>text{font-family:Arial,Helvetica,sans-serif;fill:#292524}.company{font-size:24px;font-weight:bold}.body{font-size:24px}.small{font-size:20px}.section{font-size:18px;font-weight:bold;letter-spacing:2px;fill:#c6533f;text-transform:uppercase}.strong{font-weight:bold}.mutedText{fill:#78716c}.lightText{fill:#ffffff}.label{font-size:18px;fill:#78716c;letter-spacing:1px}.divider{stroke:#e7e5e4;stroke-width:1}.value{font-size:23px}</style>
<rect width="1400" height="16" fill="#ff704f"/><rect x="70" y="238" width="1260" height="1" fill="#e7e5e4"/>
${logoMarkup}<text x="230" y="112" class="company">TRAVEL4LIFE</text><text x="230" y="150" class="small mutedText">${text(company.website)}</text><text x="230" y="184" class="small mutedText">GSTIN ${text(company.gst)}</text>
<text x="1330" y="108" text-anchor="end" font-size="54" font-weight="bold">INVOICE</text><text x="1330" y="155" text-anchor="end" class="small mutedText">${text(invoiceNumber)}</text>
<rect x="1040" y="176" width="290" height="42" rx="21" fill="#292524"/><text x="1185" y="204" text-anchor="middle" class="lightText small">ISSUE · ${text(invoiceDates.issued)}</text>
<rect x="70" y="282" width="610" height="230" rx="8" fill="#fafaf9"/><rect x="720" y="282" width="610" height="230" rx="8" fill="#fafaf9"/>
<text x="100" y="330" class="section">Bill to</text><text x="100" y="375" class="body strong">${text(form.fullName)}</text><text x="100" y="412" class="value">${text(form.email)}</text><text x="100" y="449" class="value">${text(form.phone)}</text>${addressLines.map((line, index) => `<text x="100" y="${486 + index * 28}" class="small mutedText">${line}</text>`).join('')}${form.gstCompany ? `<text x="100" y="544" class="small mutedText">GST / Company: ${text(form.gstCompany)}</text>` : ''}
<text x="750" y="330" class="section">Journey details</text><text x="750" y="375" class="body strong">${text(tripTitle)}</text><text x="750" y="412" class="value">${text(tripDestination)}</text><text x="750" y="449" class="value">${text(String(tripDuration))} days · ${totals.adults} adult${totals.adults === 1 ? '' : 's'}${totals.children ? ` · ${totals.children} child${totals.children === 1 ? '' : 'ren'}` : ''}</text><text x="750" y="486" class="small mutedText">${text(String(tripStartDate))} – ${text(String(tripEndDate))}</text>
<rect x="70" y="560" width="1260" height="190" rx="8" fill="#292524"/><text x="100" y="608" font-size="18" letter-spacing="2" fill="#fdba74">SERVICE SUMMARY</text><text x="100" y="658" class="lightText strong" font-size="27">${text(tripTitle)}</text><text x="100" y="704" class="mutedText" font-size="21">Booking reference ${text(tripId || 'PACKAGE')}</text><text x="1300" y="658" text-anchor="end" font-size="21" fill="#fdba74">DUE ${text(invoiceDates.due)}</text>
<text x="70" y="824" class="section">Charges</text><text x="1000" y="824" class="label" text-anchor="end">RATE</text><text x="1300" y="824" class="label" text-anchor="end">AMOUNT</text><line x1="70" y1="850" x2="1330" y2="850" class="divider"/>
${chargeRowsMarkup}${taxRowsMarkup}
<rect x="790" y="${taxY + 92}" width="540" height="115" rx="8" fill="#fff7ed"/><text x="820" y="${taxY + 139}" class="section">${customerPayments.length ? 'Balance due' : 'Total payable'}</text><text x="1300" y="${taxY + 178}" text-anchor="end" font-size="38" font-weight="bold" fill="#292524">${text(formatMoney(balanceDue, currencySymbol))}</text>
${paymentsSection}
${paymentPlanSection}
<rect x="70" y="${detailsY}" width="610" height="430" rx="8" fill="#fafaf9"/><rect x="720" y="${detailsY}" width="610" height="430" rx="8" fill="#fafaf9"/>
<text x="100" y="${detailsY + 48}" class="section">Payment details</text><text x="100" y="${detailsY + 100}" class="label">BANK ACCOUNT</text><text x="100" y="${detailsY + 138}" class="body strong">${text(company.bankName)}</text><text x="100" y="${detailsY + 178}" class="value">Account name · ${text(company.accountName)}</text><text x="100" y="${detailsY + 215}" class="value">Account number · ${text(company.accountNumber)}</text><text x="100" y="${detailsY + 252}" class="value">IFSC · ${text(company.ifsc)}</text><text x="100" y="${detailsY + 289}" class="value">${text(company.accountType)} account · ${text(company.bankLocation)}</text><text x="100" y="${detailsY + 334}" class="section">Secure online payment</text><text x="100" y="${detailsY + 372}" class="small mutedText">${text(company.cardUrl)}</text>
<text x="750" y="${detailsY + 48}" class="section">Support &amp; terms</text><text x="750" y="${detailsY + 100}" class="label">TRAVEL4LIFE CUSTOMER CARE</text><text x="750" y="${detailsY + 138}" class="value">${text(company.phone)}</text><text x="750" y="${detailsY + 178}" class="value">${text(company.email)}</text><text x="750" y="${detailsY + 215}" class="small mutedText">${text(company.support)}</text><text x="750" y="${detailsY + 270}" class="body strong">Important</text><text x="750" y="${detailsY + 307}" class="small mutedText">Payment due within 14 days.</text><text x="750" y="${detailsY + 338}" class="small mutedText">This invoice is not payment confirmation.</text><text x="750" y="${detailsY + 369}" class="small mutedText">Availability and final itinerary remain subject to booking terms.</text>
<line x1="70" y1="${footerY}" x2="1330" y2="${footerY}" class="divider"/><text x="70" y="${footerY + 48}" class="small mutedText">Travel4life Global · ${text(company.address)}</text><text x="1330" y="${footerY + 48}" text-anchor="end" class="small mutedText">Thank you for travelling with us.</text>
</svg>`;
  };

  const hasRequiredDetails = () =>
    Boolean(form.fullName.trim() && form.email.trim() && form.address.trim() && form.phone.trim());

  const handleDownloadImage = async () => {
    if (!hasRequiredDetails()) return;

    const paymentsError = validateCustomerPayments();
    if (paymentsError) {
      setCustomerPaymentsError(paymentsError);
      return;
    }

    const planError = validatePaymentPlan();
    if (planError) {
      setPaymentPlanError(planError);
      return;
    }

    const svgBlob = new Blob([await buildInvoiceSvg()], { type: 'image/svg+xml;charset=utf-8' });
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
    image.onerror = () => {
      console.error('Branded invoice SVG could not be rendered as an image.');
      URL.revokeObjectURL(svgUrl);
    };
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

        <section className="rounded-lg border border-gray-200 p-4" aria-labelledby="payments-received-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 id="payments-received-heading" className="text-sm font-semibold text-gray-900">Payments received <span className="font-normal text-gray-500">(optional)</span></h3>
              <p className="mt-1 text-xs text-gray-500">Record payments already made by the customer and reduce the invoice balance.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomerPayments(previous => [...previous, { date: '', amount: '', mode: '' }]);
                setCustomerPaymentsError('');
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add payment
            </button>
          </div>
          {customerPayments.map((payment, index) => (
            <div key={`customer-payment-${index}`} className="mb-3 grid grid-cols-1 items-end gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="text-xs font-medium text-gray-700">
                Payment date
                <input type="date" value={payment.date} onChange={event => updateCustomerPayment(index, 'date', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Amount
                <input type="number" min="0.01" step="0.01" value={payment.amount} onChange={event => updateCustomerPayment(index, 'amount', event.target.value)} placeholder="0.00" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Mode of payment
                <select value={payment.mode} onChange={event => updateCustomerPayment(index, 'mode', event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                  <option value="">Select mode</option>
                  <option value="Bank transfer">Bank transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit card">Credit card</option>
                  <option value="Debit card">Debit card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Razorpay">Razorpay</option>
                </select>
              </label>
              <button type="button" onClick={() => { setCustomerPayments(previous => previous.filter((_, currentIndex) => currentIndex !== index)); setCustomerPaymentsError(''); }} aria-label={`Remove payment ${index + 1}`} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white">Remove</button>
            </div>
          ))}
          {customerPaymentsError && <p role="alert" className="mt-2 text-sm text-red-600">{customerPaymentsError}</p>}
        </section>

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
            {customerPayments.length > 0 && (
              <span>Paid: {formatMoney(customerPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0), currencySymbol)}</span>
            )}
            <strong className="text-gray-900">
              {customerPayments.length > 0 ? 'Balance' : 'Total'}:{' '}
              {formatMoney(Math.max(0, totals.total - customerPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)), currencySymbol)}
            </strong>
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
