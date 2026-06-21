import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Star, Award, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';

interface ReferralStats {
  referring_host_id: string;
  referring_host_name: string;
  total_referrals: number;
  total_revenue: number;
  conversion_rate: number;
  avg_booking_value: number;
}

export const ReferralAnalytics: React.FC = () => {
  const [referralStats, setReferralStats] = useState<ReferralStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchReferralStats();
  }, [dateRange]);

  const fetchReferralStats = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch referral bookings with host details
      const { data: referralBookings, error } = await supabase
        .from('bookings')
        .select(`
          referring_host_id,
          amount,
          status,
          created_at,
          referring_host:referring_host_id(
            id,
            name
          )
        `)
        .not('referring_host_id', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Group and calculate stats by referring host
      const statsMap = new Map<string, ReferralStats>();

      referralBookings?.forEach(booking => {
        if (!booking.referring_host_id || !booking.referring_host) return;

        const hostId = booking.referring_host_id;
        const hostName = booking.referring_host.name;

        if (!statsMap.has(hostId)) {
          statsMap.set(hostId, {
            referring_host_id: hostId,
            referring_host_name: hostName,
            total_referrals: 0,
            total_revenue: 0,
            conversion_rate: 0,
            avg_booking_value: 0
          });
        }

        const stats = statsMap.get(hostId)!;
        stats.total_referrals++;
        
        if (booking.status === 'confirmed') {
          stats.total_revenue += Number(booking.amount || 0);
        }
      });

      // Calculate averages and conversion rates
      const finalStats = Array.from(statsMap.values()).map(stats => ({
        ...stats,
        avg_booking_value: stats.total_referrals > 0 ? stats.total_revenue / stats.total_referrals : 0,
        conversion_rate: 85 // Placeholder - would need to track clicks vs bookings
      }));

      // Sort by total revenue
      finalStats.sort((a, b) => b.total_revenue - a.total_revenue);

      setReferralStats(finalStats);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      setReferralStats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-7 h-7 mr-3 text-purple-600" />
            Host Referral Analytics
          </h2>
          <p className="text-gray-600 mt-1">Track promotional effectiveness and referral performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button variant="primary" onClick={fetchReferralStats} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Referrers</p>
              <p className="text-2xl font-bold text-gray-900">{referralStats.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referral Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(referralStats.reduce((sum, stat) => sum + stat.total_revenue, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">
                {referralStats.reduce((sum, stat) => sum + stat.total_referrals, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-gray-900">
                {referralStats.length > 0 
                  ? Math.round(referralStats.reduce((sum, stat) => sum + stat.conversion_rate, 0) / referralStats.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Performance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Host Performance</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading referral analytics...</p>
          </div>
        ) : referralStats.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Referral Data</h3>
            <p className="text-gray-600">No referral bookings found for the selected period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referring Host
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Booking Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referralStats.map((stat) => (
                  <tr key={stat.referring_host_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {stat.referring_host_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {stat.referring_host_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Host ID: {stat.referring_host_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stat.total_referrals}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(stat.total_revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(stat.avg_booking_value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={stat.conversion_rate >= 80 ? 'success' : stat.conversion_rate >= 60 ? 'warning' : 'secondary'}
                        size="sm"
                      >
                        {stat.conversion_rate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {stat.total_revenue >= 1000 ? (
                          <Badge variant="success" size="sm">Top Performer</Badge>
                        ) : stat.total_revenue >= 500 ? (
                          <Badge variant="warning" size="sm">Good</Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">Getting Started</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-purple-600" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Top Referring Host</h4>
            {referralStats.length > 0 ? (
              <div>
                <p className="text-lg font-bold text-purple-600">{referralStats[0].referring_host_name}</p>
                <p className="text-sm text-gray-600">
                  {referralStats[0].total_referrals} referrals • {formatCurrency(referralStats[0].total_revenue)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Referral Program Impact</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Total hosts participating: <span className="font-semibold">{referralStats.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                Revenue from referrals: <span className="font-semibold text-green-600">
                  {formatCurrency(referralStats.reduce((sum, stat) => sum + stat.total_revenue, 0))}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};