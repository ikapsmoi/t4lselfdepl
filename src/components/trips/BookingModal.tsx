import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { Trip } from '../../types';
import { CreditCard, Shield, Users, Calculator, MessageCircle, Mail, CheckCircle, Clock, Plus } from 'lucide-react';
import { TripAddons } from '../addons/TripAddons';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import { useBookings } from '../../hooks/useBookings';
import { useDashboard } from '../../hooks/useDashboard';
import { useTripAddons } from '../../hooks/useTripAddons';
import { useAnalytics } from '../../utils/analytics';
import { getCurrencySymbol } from '../../utils/constants';
import { supabase } from '../../lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, trip }) => {
  const { user, autoRegister } = useAuth();
  const { startBooking, completeBooking, discountApplied } = useAnalytics();
  const { sendMessage } = useMessages(user?.id || '');
  const { createBooking } = useBookings();
  const { refreshData } = useDashboard(user?.id || '', 'traveler');
  const { addons: tripAddons, loading: addonsLoading } = useTripAddons(trip.id);

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState('');
  const [travelersCount, setTravelersCount] = useState('1');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentOption, setPaymentOption] = useState('deposit');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonsTotal, setAddonsTotal] = useState(0);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(false);
  const [autoRegistered, setAutoRegistered] = useState(false);
  const [firstBookingDiscount, setFirstBookingDiscount] = useState(0);
  const [isFirstBooking, setIsFirstBooking] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [showFullConfirmationModal, setShowFullConfirmationModal] = useState(false);

  // internal control to avoid parent auto-closing the modal immediately after booking success
  const [internalOpen, setInternalOpen] = useState(isOpen);

  // read persisted last-success if component mounts and show it
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('travel4life:lastBookingSuccess');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.bookingId && parsed.tripId === trip.id) {
          console.log('Found persisted booking success, showing success UI', parsed);
          setBookingReference(parsed.bookingId);
          setShowSuccess(true);
          setAutoRegistered(parsed.autoRegistered || false);
          setInternalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error reading lastBookingSuccess from localStorage', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // keep internalOpen in sync with prop except when showing success UI
  React.useEffect(() => {
    if (!showSuccess) {
      setInternalOpen(isOpen);
    } else {
      // when success is showing, intentionally ignore parent changes to keep modal visible
      setInternalOpen(true);
    }
  }, [isOpen, showSuccess]);

  // When user actually closes the modal, reset relevant local state
  const handleClose = () => {
    setInternalOpen(false);
    // reset local UI-only pieces so next open is fresh
    setShowSuccess(false);
    setAutoRegistered(false);
    setBookingReference('');
    setStep(1);
    onClose(); // notify parent that modal was closed by the user
  };

  // Track booking start when modal opens
  React.useEffect(() => {
    if (isOpen) {
      startBooking(trip.id, trip.price);
      checkFirstBookingDiscount();
    }
  }, [isOpen, trip.id, trip.price, startBooking]);

  // Effect for auto-redirection after successful booking
  useEffect(() => {
    if (showSuccess && !hasRedirected) {
      const timer = setTimeout(() => {
        window.open('https://razorpay.me/@travel4lifeglobal', '_blank');
        setHasRedirected(true);
      }, 1000); // 1 second delay before redirecting
      return () => clearTimeout(timer);
    }
  }, [showSuccess, hasRedirected]);

  // Check if user is eligible for first booking discount
  const checkFirstBookingDiscount = async () => {
    if (!user) return;

    try {
      // Check if user is eligible for discount and hasn't used it
      if (user.discount_eligible_first_booking && !user.discount_used_at) {
        // Check if this would be their first confirmed booking
        const { data: existingBookings, error } = await supabase
          .from('bookings')
          .select('id')
          .eq('traveler_id', user.id)
          .eq('status', 'confirmed');

        if (error) {
          console.error('Error checking existing bookings:', error);
          return;
        }

        if (!existingBookings || existingBookings.length === 0) {
          setIsFirstBooking(true);
          // Calculate 10% discount on subtotal
          const currentTravelers = parseInt(travelersCount) || 1;
          const discount = (trip.price * currentTravelers) * 0.05;
          setFirstBookingDiscount(discount);
        } else {
          setIsFirstBooking(false);
          setFirstBookingDiscount(0);
        }
      } else {
        setIsFirstBooking(false);
        setFirstBookingDiscount(0);
      }
    } catch (error) {
      console.error('Error checking first booking discount:', error);
    }
  };

  const travelers = parseInt(travelersCount) || 1;
  const subtotal = trip.price * travelers;
  const groupDiscount = travelers >= 4 ? (subtotal * trip.group_discount / 100) : 0;
  const earlyBirdDiscount = trip.early_bird_discount ? (subtotal * trip.early_bird_discount / 100) : 0;
  const total = subtotal - groupDiscount - earlyBirdDiscount - firstBookingDiscount + addonsTotal;
  const depositAmount = paymentOption === 'deposit'
    ? (trip.deposit_required ? trip.deposit_required * travelers : total * 0.05)
    : total;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Robust booking handler with global dispatch + localStorage fallback + alert fallback
  const handleBooking = async () => {
    let currentUser = user;
    let bookingId: string | null = null;
    let justAutoRegistered = false; // local flag to capture immediate auto-registration

    console.log('🚀 Booking process started');
    console.log('Initial user state:', user ? { id: user.id, name: user.name, email: user.email } : 'No user logged in');
    console.log('Form data:', { name, email, travelers, total, depositAmount });

    // Auto-register if user is not signed in
    if (!currentUser) {
      console.log('👤 User not logged in, attempting auto-registration...');
      if (!email.trim() || !name.trim()) {
        console.error('❌ Auto-registration failed: Missing email or name');
        alert('Please fill in your name and email to continue with booking');
        return;
      }
      try {
        console.log('📝 Calling autoRegister with:', { email: email.trim(), name: name.trim() });
        const result = await autoRegister(email.trim(), name.trim());
        console.log('📝 autoRegister result:', result);
        if (result && result.success && result.user) {
          currentUser = result.user;
          justAutoRegistered = true; // set local flag immediately
          setAutoRegistered(true);   // still set state for UI
         setShowFullConfirmationModal(true);
          console.log('✅ Auto-registration successful. New user:', { id: currentUser.id, name: currentUser.name });
        } else {
          console.error('❌ Auto-registration failed. Result:', result);
          alert(`Failed to create account: ${result?.error || 'Unknown error'}. Please try signing up manually.`);
          return;
        }
      } catch (err) {
        console.error('Auto-registration error:', err);
        console.error('❌ Auto-registration exception caught:', err);
        alert('Failed to create account. Please try signing up manually.');
        return;
      }
    } else {
      console.log('✅ User already logged in:', { id: currentUser.id, name: currentUser.name });
    }

    // Validate host_id before proceeding
    if (!trip.host_id || trip.host_id.trim() === '') {
      console.error('❌ Host ID validation failed:', trip.host_id);
      alert('Unable to process booking at this time. Please try again later.');
      return;
    }

    console.log('✅ Host ID validated:', trip.host_id);

    setProcessingBooking(true);
    console.log('🔄 Processing booking set to true');

    try {
      console.log('💳 Attempting to create booking with:', {
        tripId: trip.id,
        userId: currentUser!.id,
        hostId: trip.host_id,
        travelers,
        total,
        depositAmount
      });

      const created = await createBooking(
        trip.id,
        currentUser!.id,
        trip.host_id,
        travelers,
        total,
        depositAmount,
        emergencyContact || 'Not provided',
        paymentMethod as 'stripe' | 'paypal' | 'bank',
        paymentOption,
        dietaryRestrictions,
        specialRequests
      );

      console.log('💳 createBooking response:', created);

      // Normalize common return shapes:
      bookingId =
        created?.id ||
        created?.data?.id ||
        created?.booking?.id ||
        (created?.data && typeof created.data === 'string' ? created.data : null) ||
        null;

      if (!bookingId) {
        console.warn('⚠️ createBooking returned unexpected shape:', created);
        // If server returned a data object that looks like the booking, try stringify fallback
        if (created && created.data && created.data.id) {
          bookingId = created.data.id;
          console.log('🔧 Fallback booking ID found:', bookingId);
        }
      }

      if (!bookingId) {
        console.error('❌ No booking ID found in response');
        throw new Error('Booking creation failed (invalid response from server).');
      }

      console.log('✅ Booking ID extracted:', bookingId);

      // Persist booking reference in state (for UI)
      setBookingReference(bookingId);
      console.log('📝 Booking reference set in state');

      // Persist to localStorage so remounts can recover UI — use justAutoRegistered local flag,
      // and include depositAmount and currency to help downstream UI
      try {
        const payload = {
          bookingId,
          tripId: trip.id,
          timestamp: new Date().toISOString(),
          autoRegistered: justAutoRegistered,
          depositAmount: Number(depositAmount) || 0,
          currency: trip.currency || 'USD'
        };
        console.log('💾 Persisting to localStorage:', payload);
        localStorage.setItem('travel4life:lastBookingSuccess', JSON.stringify(payload));
        console.log('✅ Successfully persisted to localStorage');
      } catch (err) {
        console.error('Error writing booking success to localStorage', err);
      }

      // Immediately show success UI (use local bookingId to avoid race)
      console.log('🎉 Setting showSuccess to true');
      if (justAutoRegistered) {
        // For auto-registered users, show the full confirmation modal
        setShowFullConfirmationModal(true);
        setShowSuccess(false);
        // Don't close BookingModal yet - let the confirmation modal open first
      } else {
        // For existing users, show the inline success message
        setShowSuccess(true);
      }

      console.log('✅ Success UI should now be visible');

      // Dispatch a global event so parent or other components can react (and show global UI if modal unmounts)
      try {
        const evDetail = {
          bookingId,
          tripId: trip.id,
          autoRegistered: justAutoRegistered,
          depositAmount: Number(depositAmount) || 0,
          currency: trip.currency || 'USD'
        };
        console.log('📡 Dispatching global booking success event:', evDetail);
        window.dispatchEvent(new CustomEvent('bookingSuccess', { detail: evDetail }));
        console.log('✅ Global event dispatched');
      } catch (err) {
        console.error('Error dispatching global event:', err);
      }

      // Track successful booking in analytics
      try {
        completeBooking(trip.id, total, paymentMethod);
        console.log('📊 Analytics tracking completed');
      } catch (err) {
        console.error('completeBooking error:', err);
      }

      // Apply first booking discount if applicable (non-blocking)
      if (isFirstBooking && firstBookingDiscount > 0 && currentUser) {
        supabase
          .from('profiles')
          .update({
            discount_used_at: new Date().toISOString()
          })
          .eq('id', currentUser.id)
          .then(() => {
            discountApplied(currentUser.id, bookingId!, firstBookingDiscount);
          })
          .catch(error => {
            console.error('Error updating discount status:', error);
          });
      }

      // Refresh dashboard data (non-blocking)
      refreshData().catch(error => {
        console.error('Error refreshing dashboard data:', error);
      });

    } catch (error) {
      console.error('❌ Booking error caught:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to complete your booking. Please try again.';
      console.error('❌ Error message to show user:', errorMessage);
      alert(errorMessage);
    } finally {
      console.log('🏁 Setting processingBooking to false');
      setProcessingBooking(false);
    }
  };

  const handleInquiry = async () => {
    // Validate host_id before sending message
    if (!trip.host_id || trip.host_id.trim() === '') {
      alert('Unable to contact host at this time. Please try again later.');
      return;
    }

    setSendingInquiry(true);
    try {
      const inquiryMessage = `Hi! I'm interested in your trip "${trip.title}". Here are my details:

Name: ${name}
Email: ${email}
Mobile: ${mobile}
Number of travelers: ${travelersCount}

${specialRequests ? `Special requests: ${specialRequests}` : ''}

Please let me know if you have any questions or need additional information.`;

      // Send message to host
      await sendMessage(trip.host_id, inquiryMessage, trip.id);

      // Send email notification (in a real app, this would be handled by an edge function)
      const subject = `New Trip Inquiry - ${trip.title}`;
      const body = `You have received a new inquiry for your trip "${trip.title}".

Traveler Details:
Name: ${name}
Email: ${email}
Mobile: ${mobile}
Number of travelers: ${travelersCount}

Message: ${inquiryMessage}

Please respond to this inquiry through your TravelTag dashboard.`;

      const mailtoLink = `mailto:${trip.host?.email || 'host@traveltag.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');

      handleClose();
    } catch (error) {
      console.error('Error sending inquiry:', error);
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <>
    <Modal isOpen={internalOpen && !showFullConfirmationModal} onClose={handleClose} title="Book Your Adventure" maxWidth="max-w-3xl" disableClose={processingBooking}>
      {showSuccess ? (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-4">
              Your adventure to {trip.destination} has been successfully booked.
            </p>

            {/* Auto-registration success message */}
            {autoRegistered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Account Created!</strong> We've created a TravelTag account for you with the password <strong>081087</strong>.
                    You can change this password anytime from your profile settings.
                  </div>
                </div>
              </div>
            )}

            {bookingReference && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Booking Reference:</strong> {bookingReference.slice(0, 8).toUpperCase()}
                </p>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-bold text-yellow-900 mb-3 flex items-center justify-center">
                💳 Payment Required
              </h4>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-yellow-900 mb-2">
                  {getCurrencySymbol(trip.currency || 'USD')}{depositAmount.toLocaleString()}
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
                  Pay {getCurrencySymbol(trip.currency || 'USD')}{depositAmount.toLocaleString()} Now →
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
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Close
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
            >
              View Full Confirmation
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleClose();
                window.location.hash = 'traveler-dashboard';
              }}
              className="flex-1"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Navigation Buttons at Top */}
          <div className="flex justify-between pb-4 border-b">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                ← Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button onClick={handleNext}>
                Continue →
              </Button>
            ) : step < 4 ? (
              <Button onClick={handleNext}>
                Review Booking →
              </Button>
            ) : (
              <div className="flex space-x-3">
                <Button
                  onClick={handleInquiry}
                  variant="outline"
                  loading={sendingInquiry}
                  icon={MessageCircle}
                >
                  Inquire Now
                </Button>
                <Button
                  onClick={handleBooking}
                  className="bg-green-600 hover:bg-green-700"
                  loading={processingBooking}
                >
                  Confirm Booking
                </Button>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${step > stepNum ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Trip Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{trip.title}</h3>
                <p className="text-sm text-gray-600">{trip.destination} • {trip.duration} days</p>
                <p className="text-sm text-gray-600">
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="Enter with Country Code"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />

                <Select
                  label="Number of Travelers"
                  value={travelersCount}
                  onChange={setTravelersCount}
                  options={Array.from({ length: Math.min(5, trip.max_capacity - trip.current_bookings) }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} ${i === 0 ? 'traveler' : 'travelers'}`
                  }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special accommodations or requests..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Payment Options */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>

                <div className="grid grid-cols-1 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentOption('deposit')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      paymentOption === 'deposit'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Pay Deposit Now</div>
                        <div className="text-sm text-gray-600">Secure your spot with {getCurrencySymbol(trip.currency || 'USD')}{(trip.deposit_required || (trip.price * 0.05)) * travelers}</div>
                      </div>
                      <Badge variant="success" size="sm">Recommended</Badge>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentOption('full')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      paymentOption === 'full'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">Pay in Full</div>
                      <div className="text-sm text-gray-600">Complete payment now</div>
                    </div>
                  </button>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'stripe'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium text-gray-900">Credit Card</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto mb-1 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        P
                      </div>
                      <div className="text-sm font-medium text-gray-900">PayPal</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto mb-1 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        B
                      </div>
                      <div className="text-sm font-medium text-gray-900">Bank Transfer</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              {addonsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading trip add-ons...</p>
                </div>
              ) : tripAddons.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Available Add-ons</h3>
                    <Button variant="outline" size="sm" onClick={() => setStep(4)}>
                      Skip Add-ons
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {tripAddons.map((addon) => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            const newSelected = isSelected
                              ? selectedAddons.filter(id => id !== addon.id)
                              : [...selectedAddons, addon.id];
                            setSelectedAddons(newSelected);

                            // Calculate total
                            const total = newSelected.reduce((sum, addonId) => {
                              const selectedAddon = tripAddons.find(a => a.id === addonId);
                              return sum + (selectedAddon ? selectedAddon.price : 0);
                            }, 0);
                            setAddonsTotal(total);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                              {addon.duration && (
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {addon.duration}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-green-600">{getCurrencySymbol(trip.currency || 'USD')}{addon.price}</span>
                              {isSelected && (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <Plus className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          {addon.description && (
                            <p className="text-sm text-gray-600 mb-3">{addon.description}</p>
                          )}

                          {addon.inclusions.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
                              <div className="flex flex-wrap gap-1">
                                {addon.inclusions.map((inclusion, index) => (
                                  <Badge key={index} variant="secondary" size="sm">
                                    {inclusion}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Add-ons Summary */}
                  {selectedAddons.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Selected Add-ons ({selectedAddons.length})</h4>
                      <div className="space-y-2 mb-4">
                        {selectedAddons.map(addonId => {
                          const addon = tripAddons.find(a => a.id === addonId);
                          return addon ? (
                            <div key={addonId} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{addon.name}</span>
                              <span className="text-green-600 font-semibold">{getCurrencySymbol(trip.currency || 'USD')}{addon.price}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                      <div className="border-t pt-3 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Total Add-ons:</span>
                        <span className="text-xl font-bold text-green-600">{getCurrencySymbol(trip.currency || 'USD')}{addonsTotal}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No add-ons available for this trip</p>
                  <Button variant="outline" size="sm" onClick={() => setStep(4)}>
                    Continue to Review
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Review Your Booking</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trip:</span>
                  <span className="font-medium">{trip.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Travelers:</span>
                  <span className="font-medium">{travelers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{getCurrencySymbol(trip.currency || 'USD')}{subtotal.toLocaleString()}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Add-ons:</span>
                    <span className="font-medium">{getCurrencySymbol(trip.currency || 'USD')}{addonsTotal.toLocaleString()}</span>
                  </div>
                )}
                {groupDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Group discount ({trip.group_discount}%):</span>
                    <span>-{getCurrencySymbol(trip.currency || 'USD')}{groupDiscount.toLocaleString()}</span>
                  </div>
                )}
                {earlyBirdDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Early bird discount ({trip.early_bird_discount}%):</span>
                    <span>-{getCurrencySymbol(trip.currency || 'USD')}{earlyBirdDiscount.toLocaleString()}</span>
                  </div>
                )}
                {firstBookingDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>First booking discount (10%):</span>
                    <span>-{getCurrencySymbol(trip.currency || 'USD')}{firstBookingDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{getCurrencySymbol(trip.currency || 'USD')}{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-yellow-600 font-medium">
                  <span>Amount due today:</span>
                  <span>{getCurrencySymbol(trip.currency || 'USD')}{depositAmount.toLocaleString()}</span>
                </div>
              </div>

              {isFirstBooking && firstBookingDiscount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">🎉</div>
                    <div className="text-sm text-green-800">
                      <strong>Welcome Discount Applied!</strong> You're saving {getCurrencySymbol(trip.currency || 'USD')}{firstBookingDiscount.toLocaleString()} on your first adventure with TravelTag!
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Protected by TravelTag:</strong> Your payment is secure and protected by our guarantee.
                    Full refund if trip is cancelled by host.
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="h-4" />
        </div>
      )}
    </Modal>

    {bookingReference && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Booking Reference- View Dashboard & click on ViewConfirmation to Pay for your Spot:</strong> {bookingReference.slice(0, 8).toUpperCase()}
                </p>
              </div>
            )}
      
    {/* Full Booking Confirmation Modal */}
    {showFullConfirmationModal && (
      <BookingConfirmationDisplayModal
        isOpen={showFullConfirmationModal}
        onClose={() => {
          setShowFullConfirmationModal(false);
          handleClose(); // Also close the booking modal
        }}
        booking={null} // Let the modal read from localStorage
        trip={trip}
      />
    )}
    </>
  );
};