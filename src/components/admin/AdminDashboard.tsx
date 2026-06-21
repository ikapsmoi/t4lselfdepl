import React, { useState } from 'react';
import {
  Users, Plane, DollarSign, TrendingUp, AlertTriangle, Shield,
  Calendar, MessageCircle, Star, CreditCard, UserCheck, Globe, Image
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AnalyticsReports } from './AnalyticsReports';
import { GalleryManager } from './GalleryManager';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Users', value: '12,450', change: '+8.2%', icon: Users, color: 'text-blue-600' },
    { label: 'Active Trips', value: '245', change: '+12.1%', icon: Plane, color: 'text-green-600' },
    { label: 'Monthly Revenue', value: '$89,240', change: '+15.3%', icon: DollarSign, color: 'text-yellow-600' },
    { label: 'Avg Rating', value: '4.8', change: '+0.2%', icon: Star, color: 'text-purple-600' },
    { label: 'Host Applications', value: '23', change: '+5', icon: UserCheck, color: 'text-orange-600' },
    { label: 'Countries', value: '45', change: '+3', icon: Globe, color: 'text-indigo-600' },
  ];

  const recentActivity = [
    { 
      type: 'booking', 
      message: 'New booking for Iceland Adventure by Sarah Chen', 
      time: '2 min ago', 
      status: 'success',
      amount: '$2,499'
    },
    { 
      type: 'review', 
      message: 'New 5-star review for Morocco Desert Experience', 
      time: '15 min ago', 
      status: 'success',
      rating: 5
    },
    { 
      type: 'host', 
      message: 'New host application from Marcus Rodriguez', 
      time: '1 hour ago', 
      status: 'pending'
    },
    { 
      type: 'alert', 
      message: 'Payment verification required for booking #1234', 
      time: '2 hours ago', 
      status: 'warning'
    },
    { 
      type: 'trip', 
      message: 'New trip created: Patagonia Trekking Expedition', 
      time: '3 hours ago', 
      status: 'success'
    },
  ];

  const pendingActions = [
    { id: '1', type: 'Host Verification', description: 'Review Marcus Rodriguez application', priority: 'high' },
    { id: '2', type: 'Payment Issue', description: 'Resolve payment dispute for booking #1234', priority: 'high' },
    { id: '3', type: 'Trip Review', description: 'Review flagged trip content', priority: 'medium' },
    { id: '4', type: 'User Report', description: 'Investigate user behavior report', priority: 'low' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'trips', label: 'Trips', icon: Plane },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <Badge variant="success" size="sm">{stat.change}</Badge>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mr-3 mt-2 flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        {activity.amount && (
                          <Badge variant="success" size="sm">{activity.amount}</Badge>
                        )}
                        {activity.rating && (
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                            <span className="text-xs text-gray-600">{activity.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
              <div className="space-y-3">
                {pendingActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{action.type}</h4>
                        <Badge 
                          variant={action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'secondary'}
                          size="sm"
                        >
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors group">
                <Users className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Manage Users</div>
                <div className="text-xs text-gray-500">View all users</div>
              </button>
              <button className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors group">
                <Plane className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Manage Trips</div>
                <div className="text-xs text-gray-500">Review trips</div>
              </button>
              <button className="p-4 bg-yellow-50 rounded-lg text-left hover:bg-yellow-100 transition-colors group">
                <DollarSign className="w-8 h-8 text-yellow-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Payments</div>
                <div className="text-xs text-gray-500">Financial overview</div>
              </button>
              <button className="p-4 bg-red-50 rounded-lg text-left hover:bg-red-100 transition-colors group">
                <AlertTriangle className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Reports</div>
                <div className="text-xs text-gray-500">Safety reports</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsReports />
      )}

      {activeTab === 'gallery' && (
        <GalleryManager />
      )}

      {activeTab !== 'overview' && activeTab !== 'analytics' && activeTab !== 'gallery' && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {tabs.find(tab => tab.id === activeTab)?.label} Management
          </h3>
          <p className="text-gray-600 mb-4">
            This section would contain detailed management tools for {activeTab}.
          </p>
          <Button variant="outline">
            Coming Soon
          </Button>
        </div>
      )}
    </div>
  );
};