import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Calendar, 
  Download, RefreshCw, Filter, Eye, MousePointer, CreditCard 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface AnalyticsData {
  period: { start_date: string; end_date: string };
  total_events?: number;
  event_breakdown?: Record<string, number>;
  total_revenue?: number;
  total_bookings?: number;
  average_booking_value?: number;
  daily_revenue?: Record<string, number>;
  total_sessions?: number;
  conversion_funnel?: Record<string, { count: number; conversion_rate: number }>;
  events?: any[];
}

export const AnalyticsReports: React.FC = () => {
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'summary', label: 'Event Summary' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'conversion', label: 'Conversion Funnel' },
    { value: 'detailed', label: 'Detailed Events' }
  ];

  const fetchReport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
            report_type: reportType
          }),
        }
      );

      if (response.ok) {
        const reportData = await response.json();
        setData(reportData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch report');
      }
    } catch (error) {
      console.error('Report fetch error:', error);
      setError('Failed to fetch analytics report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportReport = () => {
    if (!data) return;
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.entries(data.event_breakdown || {})
        .map(([event, count]) => `${event},${count}`)
        .join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
            Analytics Reports
          </h2>
          <p className="text-gray-600 mt-1">Track user behavior and platform performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportReport} icon={Download} disabled={!data}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={fetchReport} icon={RefreshCw} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={setReportType}
            options={reportTypes}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button variant="primary" onClick={fetchReport} loading={loading} className="w-full">
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Report Content */}
      {data && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportType === 'summary' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold text-gray-900">{data.total_events?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Home Views</p>
                      <p className="text-2xl font-bold text-gray-900">{data.event_breakdown?.view_home?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <MousePointer className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Trip Views</p>
                      <p className="text-2xl font-bold text-gray-900">{data.event_breakdown?.view_trip?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <CreditCard className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{data.event_breakdown?.complete_booking?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(data.event_breakdown || {}).map(([event, count]) => (
                    <div key={event} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">{event.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Revenue Report */}
          {reportType === 'revenue' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.total_revenue || 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{data.total_bookings?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.average_booking_value || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
                <div className="space-y-2">
                  {Object.entries(data.daily_revenue || {}).map(([date, revenue]) => (
                    <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{formatDate(date)}</span>
                      <span className="text-green-600 font-semibold">{formatCurrency(revenue as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Conversion Funnel */}
          {reportType === 'conversion' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                {Object.entries(data.conversion_funnel || {}).map(([step, stepData]: [string, any]) => (
                  <div key={step} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 capitalize">{step.replace('_', ' ')}</span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stepData.conversion_rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900">{stepData.count.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{stepData.conversion_rate.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Events */}
          {reportType === 'detailed' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metadata
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(data.events || []).slice(0, 50).map((event: any) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">{event.event_name}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.user_id ? event.user_id.slice(0, 8) + '...' : 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <details className="cursor-pointer">
                            <summary>View details</summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-xs">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};