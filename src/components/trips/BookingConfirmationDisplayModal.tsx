import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle } from 'lucide-react';
import { Trip, Booking } from '../../types';
import { getCurrencySymbol } from '../../utils/constants';

interface BookingConfirmationDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null; // booking may be missing for autoregistered flows
  trip: Trip;
}

type PersistedSuccess = {
  bookingId: string;
  tripId?: string;
  timestamp?: string;
  autoRegistered?: boolean;
  amount?: number;
  depositAmount?: number;
  currency?: string;
};

export const BookingConfirmationDisplayModal: React.FC<BookingConfirmationDisplayModalProps> = ({
  isOpen,
  onClose,
  booking = null,
  trip
}) => {
  const [persisted, setPersisted] = React.useState<PersistedSuccess | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('travel4life:lastBookingSuccess');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.bookingId) {
          setPersisted(parsed);
          return;
        }
      }
    } catch (err) {
      // Ignore localStorage errors
    }
    setPersisted(null);
  }, [isOpen]);

  // Safely compute booking id (from prop or persisted fallback)
  const bookingId = booking?.id || persisted?.bookingId || '';
  const shortBookingRef = bookingId ? bookingId.slice(0, 8).toUpperCase() : '—';

  // Safely compute booking date: prefer booking.booking_date, then booking.created_at, then persisted timestamp
  const bookingDateRaw = booking?.booking_date || booking?.created_at || persisted?.timestamp || '';
  const parseSafeDate = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const bookingDateFormatted = parseSafeDate(bookingDateRaw);

  // Safely compute deposit/amount (prefer booking fields, then persisted)
  const amountRaw = (booking && (booking.amount ?? booking.total ?? booking.deposit)) ?? (persisted && (persisted.depositAmount ?? persisted.amount)) ?? 0;
  const depositAmount = Number(amountRaw) || 0;
  const currency = trip?.currency || persisted?.currency || 'USD';

  // Payment option determination (safe)
  const paymentOption = (booking && (booking.payment_status === 'fully_paid' ? 'full' : 'deposit')) || 'deposit';

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  // Safe badge variant mapping
  const status = booking?.status || 'confirmed';
  const badgeVariant =
    status === 'confirmed' ? 'success' :
    status === 'pending' ? 'warning' :
    status === 'cancelled' ? 'danger' :
    'secondary';

  // auto-registered flag from persisted payload (or fallback to null)
  const wasAutoRegistered = persisted?.autoRegistered ?? false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Confirmation"
      maxWidth="max-w-2xl"
    >
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600">
            Your adventure to {trip?.destination || 'your destination'} has been successfully booked.
          </p>
        </div>

        {/* If the user was auto-registered, show an account-created banner */}
        {wasAutoRegistered && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Account Created!</strong> We've created a TravelTag account for you with the password <strong>081087</strong>.
                You can change this password anytime from your profile settings after logging in.
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Trip:</span>
              <span className="font-medium">{trip?.title || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <span className="font-medium">{trip?.destination || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dates:</span>
              <span className="font-medium">
                {trip?.start_date ? formatDate(trip.start_date) : '—'} - {trip?.end_date ? formatDate(trip.end_date) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Date:</span>
              <span className="font-medium">{bookingDateFormatted || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant={badgeVariant}>
                {status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Reference:</span>
              <span className="font-medium font-mono">{shortBookingRef}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h4 className="text-lg font-bold text-yellow-900 mb-3 flex items-center justify-center">
            💳 Payment Required
          </h4>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-yellow-900 mb-2">
              {getCurrencySymbol(currency)}{depositAmount.toLocaleString()}
            </div>
            <p className="text-sm text-yellow-800">
              {paymentOption === 'deposit' ? 'Deposit Amount Due' : 'Total Amount Due'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              🔗 Pay Now via Razorpay:
            </p>
            <a
              href="https://razorpay.me/@travel4lifeglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Pay {getCurrencySymbol(currency)}{depositAmount.toLocaleString()} Now →
            </a>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Click above to complete your payment securely
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-semibold">
              ⚠️ IMPORTANT: After payment, please message your host with the payment reference number for confirmation.
            </p>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">What's Next?</h4>
          <ul className="text-sm text-green-800 space-y-1 text-left">
            <li>• Complete payment using the link above</li>
            <li>• Message host with payment reference number</li>
            <li>• View trip details in your dashboard</li>
            <li>• Connect with your host and fellow travelers</li>
            <li>• Check email for booking confirmation</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              onClose();
              window.location.hash = 'traveler-dashboard';
            }}
            className="flex-1"
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  );
};
