import { supabase } from '../lib/supabase';

export interface JobAnalytics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byEmployee: Array<{ employeeId: string; employeeName: string; count: number }>;
  completionRate: number;
  avgCompletionTime: number;
  recentJobs: any[];
}

export interface RevenueAnalytics {
  totalRevenue: number;
  depositCollected: number;
  finalPaymentCollected: number;
  pendingPayments: number;
  revenueByMonth: Array<{ month: string; amount: number }>;
  revenueByJobType: Record<string, number>;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerSatisfaction: number;
  topCustomers: Array<{ customerId: string; customerName: string; totalJobs: number; totalSpent: number }>;
}

export interface PerformanceAnalytics {
  employeePerformance: Array<{
    employeeId: string;
    employeeName: string;
    jobsCompleted: number;
    avgCompletionTime: number;
    customerRating: number;
  }>;
  busyHours: Array<{ hour: string; jobCount: number }>;
  busyDays: Array<{ day: string; jobCount: number }>;
}

export class AnalyticsService {
  static async getJobAnalytics(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<JobAnalytics> {
    try {
      let query = supabase
        .from('jobs')
        .select('*, employee:users(id, name)')
        .eq('business_id', businessId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: jobs, error } = await query;

      if (error) throw error;

      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};
      const employeeMap: Record<string, { name: string; count: number }> = {};

      let completedCount = 0;
      let totalCompletionTime = 0;

      jobs?.forEach((job) => {
        byStatus[job.status] = (byStatus[job.status] || 0) + 1;
        byType[job.job_type] = (byType[job.job_type] || 0) + 1;

        if (job.employee_id) {
          if (!employeeMap[job.employee_id]) {
            employeeMap[job.employee_id] = {
              name: job.employee?.name || 'Unknown',
              count: 0
            };
          }
          employeeMap[job.employee_id].count++;
        }

        if (job.status === 'completed' || job.status === 'finished') {
          completedCount++;
          if (job.completed_date && job.created_at) {
            const completionTime =
              new Date(job.completed_date).getTime() -
              new Date(job.created_at).getTime();
            totalCompletionTime += completionTime;
          }
        }
      });

      const byEmployee = Object.entries(employeeMap).map(([employeeId, data]) => ({
        employeeId,
        employeeName: data.name,
        count: data.count
      }));

      const completionRate = jobs?.length ? (completedCount / jobs.length) * 100 : 0;
      const avgCompletionTime = completedCount
        ? totalCompletionTime / completedCount / (1000 * 60 * 60 * 24)
        : 0;

      const recentJobs = jobs?.slice(0, 10) || [];

      return {
        total: jobs?.length || 0,
        byStatus,
        byType,
        byEmployee,
        completionRate,
        avgCompletionTime,
        recentJobs
      };
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      throw error;
    }
  }

  static async getRevenueAnalytics(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RevenueAnalytics> {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('business_id', businessId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: jobs, error } = await query;

      if (error) throw error;

      let totalRevenue = 0;
      let depositCollected = 0;
      let finalPaymentCollected = 0;
      let pendingPayments = 0;

      const revenueByMonth: Record<string, number> = {};
      const revenueByJobType: Record<string, number> = {};

      jobs?.forEach((job) => {
        const deposit = parseFloat(job.deposit || 0);
        const quotation = parseFloat(job.quotation || 0);
        const invoice = parseFloat(job.invoice || 0);

        if (job.deposit_paid) {
          depositCollected += deposit;
          totalRevenue += deposit;
        }

        if (job.final_payment_paid) {
          const finalAmount = invoice || quotation - deposit;
          finalPaymentCollected += finalAmount;
          totalRevenue += finalAmount;
        }

        if (!job.deposit_paid) {
          pendingPayments += deposit;
        } else if (!job.final_payment_paid) {
          pendingPayments += (invoice || quotation) - deposit;
        }

        const month = new Date(job.created_at).toLocaleString('default', {
          month: 'short',
          year: 'numeric'
        });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (quotation || 0);

        revenueByJobType[job.job_type] =
          (revenueByJobType[job.job_type] || 0) + (quotation || 0);
      });

      const revenueByMonthArray = Object.entries(revenueByMonth).map(([month, amount]) => ({
        month,
        amount
      }));

      return {
        totalRevenue,
        depositCollected,
        finalPaymentCollected,
        pendingPayments,
        revenueByMonth: revenueByMonthArray,
        revenueByJobType
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  static async getCustomerAnalytics(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CustomerAnalytics> {
    try {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*, jobs(*)')
        .eq('business_id', businessId);

      if (customerError) throw customerError;

      let query = supabase
        .from('jobs')
        .select('customer_id, created_at, quotation')
        .eq('business_id', businessId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: jobs, error: jobsError } = await query;

      if (jobsError) throw jobsError;

      const newCustomers = customers?.filter((c) => {
        const createdDate = new Date(c.created_at);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return createdDate >= start && createdDate <= end;
      }).length || 0;

      const returningCustomers = customers?.filter(
        (c) => c.jobs && c.jobs.length > 1
      ).length || 0;

      const customerJobMap: Record<
        string,
        { name: string; jobCount: number; totalSpent: number }
      > = {};

      jobs?.forEach((job) => {
        const customerId = job.customer_id;
        if (!customerJobMap[customerId]) {
          const customer = customers?.find((c) => c.id === customerId);
          customerJobMap[customerId] = {
            name: customer?.name || 'Unknown',
            jobCount: 0,
            totalSpent: 0
          };
        }
        customerJobMap[customerId].jobCount++;
        customerJobMap[customerId].totalSpent += parseFloat(job.quotation || 0);
      });

      const topCustomers = Object.entries(customerJobMap)
        .map(([customerId, data]) => ({
          customerId,
          customerName: data.name,
          totalJobs: data.jobCount,
          totalSpent: data.totalSpent
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      return {
        totalCustomers: customers?.length || 0,
        newCustomers,
        returningCustomers,
        customerSatisfaction: 85,
        topCustomers
      };
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }
  }

  static async getPerformanceAnalytics(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PerformanceAnalytics> {
    try {
      let query = supabase
        .from('jobs')
        .select('*, employee:users(id, name)')
        .eq('business_id', businessId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: jobs, error } = await query;

      if (error) throw error;

      const employeeMap: Record<
        string,
        {
          name: string;
          completed: number;
          totalTime: number;
          rating: number;
        }
      > = {};

      const hourMap: Record<number, number> = {};
      const dayMap: Record<string, number> = {};

      jobs?.forEach((job) => {
        if (job.employee_id) {
          if (!employeeMap[job.employee_id]) {
            employeeMap[job.employee_id] = {
              name: job.employee?.name || 'Unknown',
              completed: 0,
              totalTime: 0,
              rating: 0
            };
          }

          if (job.status === 'completed' || job.status === 'finished') {
            employeeMap[job.employee_id].completed++;

            if (job.completed_date && job.created_at) {
              const time =
                new Date(job.completed_date).getTime() -
                new Date(job.created_at).getTime();
              employeeMap[job.employee_id].totalTime += time;
            }
          }
        }

        const hour = new Date(job.scheduled_date).getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;

        const day = new Date(job.scheduled_date).toLocaleDateString('en-US', {
          weekday: 'short'
        });
        dayMap[day] = (dayMap[day] || 0) + 1;
      });

      const employeePerformance = Object.entries(employeeMap).map(
        ([employeeId, data]) => ({
          employeeId,
          employeeName: data.name,
          jobsCompleted: data.completed,
          avgCompletionTime: data.completed
            ? data.totalTime / data.completed / (1000 * 60 * 60 * 24)
            : 0,
          customerRating: 4.5
        })
      );

      const busyHours = Object.entries(hourMap)
        .map(([hour, count]) => ({
          hour: `${hour}:00`,
          jobCount: count
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      const busyDays = Object.entries(dayMap).map(([day, count]) => ({
        day,
        jobCount: count
      }));

      return {
        employeePerformance,
        busyHours,
        busyDays
      };
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      throw error;
    }
  }

  static async getDashboardSummary(businessId: string) {
    try {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthStr = lastMonth.toISOString();

      const [jobAnalytics, revenueAnalytics, customerAnalytics] = await Promise.all([
        this.getJobAnalytics(businessId, lastMonthStr),
        this.getRevenueAnalytics(businessId, lastMonthStr),
        this.getCustomerAnalytics(businessId, lastMonthStr)
      ]);

      return {
        jobs: jobAnalytics,
        revenue: revenueAnalytics,
        customers: customerAnalytics
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  static async exportAnalyticsData(
    businessId: string,
    startDate: string,
    endDate: string,
    format: 'json' | 'csv' = 'json'
  ) {
    try {
      const [jobs, revenue, customers, performance] = await Promise.all([
        this.getJobAnalytics(businessId, startDate, endDate),
        this.getRevenueAnalytics(businessId, startDate, endDate),
        this.getCustomerAnalytics(businessId, startDate, endDate),
        this.getPerformanceAnalytics(businessId, startDate, endDate)
      ]);

      const data = {
        period: { startDate, endDate },
        jobs,
        revenue,
        customers,
        performance,
        exportedAt: new Date().toISOString()
      };

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      return data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  private static convertToCSV(data: any): string {
    const csvRows = [];

    csvRows.push('Analytics Report');
    csvRows.push(`Period,${data.period.startDate} to ${data.period.endDate}`);
    csvRows.push('');

    csvRows.push('Job Statistics');
    csvRows.push(`Total Jobs,${data.jobs.total}`);
    csvRows.push(`Completion Rate,${data.jobs.completionRate.toFixed(2)}%`);
    csvRows.push('');

    csvRows.push('Revenue Statistics');
    csvRows.push(`Total Revenue,$${data.revenue.totalRevenue.toFixed(2)}`);
    csvRows.push(`Deposits Collected,$${data.revenue.depositCollected.toFixed(2)}`);
    csvRows.push(`Final Payments,$${data.revenue.finalPaymentCollected.toFixed(2)}`);
    csvRows.push(`Pending Payments,$${data.revenue.pendingPayments.toFixed(2)}`);
    csvRows.push('');

    csvRows.push('Customer Statistics');
    csvRows.push(`Total Customers,${data.customers.totalCustomers}`);
    csvRows.push(`New Customers,${data.customers.newCustomers}`);
    csvRows.push(`Returning Customers,${data.customers.returningCustomers}`);

    return csvRows.join('\n');
  }
}

export default AnalyticsService;
