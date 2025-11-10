import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import AnalyticsService from '../../services/AnalyticsService';
import { useAuth } from '../../contexts/AuthContext';

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (user?.businessId) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (!user?.businessId) return;
      const { startDate, endDate } = getDateRange();
      const summary = await AnalyticsService.getDashboardSummary(user.businessId);
      setAnalytics(summary);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();

    if (dateRange === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (dateRange === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    } else if (dateRange === 'custom') {
      return {
        startDate: customStartDate,
        endDate: customEndDate
      };
    }

    return {
      startDate: startDate.toISOString(),
      endDate: today.toISOString()
    };
  };

  const handleExport = async () => {
    try {
      if (!user?.businessId) return;
      const { startDate, endDate } = getDateRange();
      const data = await AnalyticsService.exportAnalyticsData(
        user.businessId,
        startDate,
        endDate,
        'csv'
      );

      const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const blob = new Blob([dataString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString()}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const { jobs, revenue, customers } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>

            <button
              onClick={loadAnalytics}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>

            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={jobs.total.toString()}
            change="+12%"
            trend="up"
            icon={<Briefcase className="w-6 h-6" />}
            color="blue"
          />

          <StatCard
            title="Total Revenue"
            value={`$${revenue.totalRevenue.toFixed(0)}`}
            change="+8%"
            trend="up"
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
          />

          <StatCard
            title="Total Customers"
            value={customers.totalCustomers.toString()}
            change="+5%"
            trend="up"
            icon={<Users className="w-6 h-6" />}
            color="purple"
          />

          <StatCard
            title="Completion Rate"
            value={`${jobs.completionRate.toFixed(1)}%`}
            change="+3%"
            trend="up"
            icon={<CheckCircle className="w-6 h-6" />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Job Status Distribution
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(jobs.byStatus).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusBgColor(status)}`}
                        style={{
                          width: `${(count / jobs.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-600" />
                Job Type Distribution
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(jobs.byType).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getTypeBgColor(type)}`}
                        style={{
                          width: `${(count / jobs.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h3>

            <div className="space-y-4">
              <RevenueItem
                label="Deposits Collected"
                amount={revenue.depositCollected}
                color="green"
              />
              <RevenueItem
                label="Final Payments"
                amount={revenue.finalPaymentCollected}
                color="blue"
              />
              <RevenueItem
                label="Pending Payments"
                amount={revenue.pendingPayments}
                color="orange"
              />
              <div className="pt-4 border-t border-gray-200">
                <RevenueItem
                  label="Total Revenue"
                  amount={revenue.totalRevenue}
                  color="purple"
                  bold
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Employees</h3>

            <div className="space-y-3">
              {jobs.byEmployee.slice(0, 5).map((emp: any, index: number) => (
                <div
                  key={emp.employeeId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{emp.employeeName}</p>
                      <p className="text-xs text-gray-600">
                        {emp.count} {emp.count === 1 ? 'job' : 'jobs'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{
                          width: `${(emp.count / jobs.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Metrics</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              label="Avg. Completion Time"
              value={`${jobs.avgCompletionTime.toFixed(1)} days`}
              color="blue"
            />
            <MetricCard
              icon={<Users className="w-5 h-5" />}
              label="New Customers"
              value={customers.newCustomers.toString()}
              color="green"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Returning Customers"
              value={customers.returningCustomers.toString()}
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div className="flex items-center space-x-1 text-sm">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {change}
          </span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function RevenueItem({
  label,
  amount,
  color,
  bold = false
}: {
  label: string;
  amount: number;
  color: string;
  bold?: boolean;
}) {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-bold' : ''} text-gray-700`}>
        {label}
      </span>
      <span
        className={`text-sm ${bold ? 'font-bold text-lg' : ''} ${
          colorClasses[color as keyof typeof colorClasses]
        }`}
      >
        ${amount.toFixed(2)}
      </span>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    allocated: 'bg-blue-500',
    started: 'bg-green-500',
    'in-progress': 'bg-purple-500',
    finished: 'bg-gray-500',
    completed: 'bg-green-700',
    cancelled: 'bg-red-500'
  };
  return colors[status] || 'bg-gray-500';
}

function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    allocated: 'bg-blue-500',
    started: 'bg-green-500',
    'in-progress': 'bg-purple-500',
    finished: 'bg-gray-500',
    completed: 'bg-green-700',
    cancelled: 'bg-red-500'
  };
  return colors[status] || 'bg-gray-500';
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    measurement: 'bg-blue-500',
    installation: 'bg-green-500',
    task: 'bg-orange-500'
  };
  return colors[type] || 'bg-gray-500';
}

function getTypeBgColor(type: string): string {
  const colors: Record<string, string> = {
    measurement: 'bg-blue-500',
    installation: 'bg-green-500',
    task: 'bg-orange-500'
  };
  return colors[type] || 'bg-gray-500';
}
