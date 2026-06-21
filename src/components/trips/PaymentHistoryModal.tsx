import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  CreditCard, Calendar, DollarSign, CheckCircle, Clock, 
  AlertTriangle, RefreshCw, Download, Receipt 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Trip } from '../../types';
import { getCurrencySymbol } from '../../utils/constants';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  gateway: string;
  status: 'pending' | 'paid' | 'refunded';
  transaction_ref?: string;
  gateway_payment_id?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  trip
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentHistory();
    }
  }, [isOpen, trip.id]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      // First get the booking for this trip
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('trip_id', trip.id)
        .eq('traveler_id', trip.booking_id || ''); // Use booking_id if available

      if (bookingError) {
        console.error('Error fetching booking:', bookingError);
        setError('Failed to fetch booking information');
        return;
      }

      if (!bookings || bookings.length === 0) {
        setPayments([]);
        return;
      }

      // Get payments for the booking
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookings[0].id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        setError('Failed to fetch payment history');
        return;
      }

      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error in fetchPaymentHistory:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'refunded':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'refunded': return 'danger';
      default: return 'secondary';
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment History"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Trip Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{trip.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Destination:</span>
              <div className="font-medium">{trip.destination}</div>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <div className="font-medium">{trip.duration} days</div>
            </div>
            <div>
              <span className="text-gray-600">Trip Price:</span>
              <div className="font-medium">{getCurrencySymbol(trip.currency || 'USD')}{trip.price}</div>
            </div>
            <div>
              <span className="text-gray-600">Dates:</span>
              <div className="font-medium">
                {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{getCurrencySymbol(trip.currency || 'USD')}{totalPaid.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Paid</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{getCurrencySymbol(trip.currency || 'USD')}{totalPending.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Receipt className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{payments.length}</div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Payment Transactions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentHistory}
              loading={loading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading payment history...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchPaymentHistory}>
                Try Again
              </Button>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No payment records found</p>
              <p className="text-sm text-gray-400">Payment history will appear here once transactions are processed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {getCurrencySymbol(payment.currency)}{payment.amount.toLocaleString()}
                          </span>
                          <Badge variant={getStatusColor(payment.status)} size="sm">
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.gateway} • {formatDate(payment.created_at)}
                        </div>
                        {payment.transaction_ref && (
                          <div className="text-xs text-gray-500 font-mono">
                            Ref: {payment.transaction_ref}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {payment.gateway_payment_id && (
                        <div className="text-xs text-gray-500 font-mono mb-1">
                          ID: {payment.gateway_payment_id.slice(0, 12)}...
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Updated: {formatDate(payment.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {payments.length > 0 && (
            <Button 
              variant="primary" 
              icon={Download}
              onClick={() => {
                // Generate CSV export
                const csvContent = [
                  ['Date', 'Amount', 'Currency', 'Status', 'Gateway', 'Reference'],
                  ...payments.map(p => [
                    formatDate(p.created_at),
                    p.amount.toString(),
                    p.currency,
                    p.status,
                    p.gateway,
                    p.transaction_ref || ''
                  ])
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payment-history-${trip.title.replace(/\s+/g, '-')}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex-1"
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};