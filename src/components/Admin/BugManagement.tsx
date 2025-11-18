import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Bug,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Image as ImageIcon,
  X,
  ChevronDown,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BugReport {
  id: string;
  user_type: 'admin' | 'business' | 'employee';
  reported_by?: string;
  business_id?: string;
  reported_date: string;
  title: string;
  description: string;
  expected_behaviour: string;
  actual_behaviour: string;
  screenshots: string[];
  module?: string;
  testing_person?: string;
  assigned_employee_id?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected' | 'reopened';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resolution_notes?: string;
  resolved_date?: string;
  created_at: string;
  updated_at: string;
}

export function BugManagement() {
  const { user } = useAuth();
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  const [newBug, setNewBug] = useState({
    user_type: 'admin' as 'admin' | 'business' | 'employee',
    title: '',
    description: '',
    expected_behaviour: '',
    actual_behaviour: '',
    module: '',
    testing_person: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    screenshots: [] as string[]
  });

  const modules = [
    'Business Management',
    'Product Management',
    'Job Management',
    'Calendar',
    'User Management',
    'Permission Management',
    'AR Camera',
    '3D Model Converter',
    'Email System',
    'Reports',
    'Dashboard',
    'Subscription',
    'Other'
  ];

  useEffect(() => {
    loadBugs();
    loadEmployees();
  }, []);

  const loadBugs = async () => {
    try {
      const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBugs(data || []);
    } catch (error) {
      console.error('Error loading bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('is_active', true)
        .in('role', ['admin', 'employee']);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('bugs')
        .insert([{
          user_type: newBug.user_type,
          reported_by: user?.id,
          business_id: user?.businessId || null,
          title: newBug.title,
          description: newBug.description,
          expected_behaviour: newBug.expected_behaviour,
          actual_behaviour: newBug.actual_behaviour,
          module: newBug.module,
          testing_person: newBug.testing_person,
          priority: newBug.priority,
          screenshots: newBug.screenshots,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setBugs([data, ...bugs]);
      setShowCreateModal(false);
      resetForm();
      alert('Bug reported successfully!');
    } catch (error) {
      console.error('Error creating bug:', error);
      alert('Failed to create bug report');
    }
  };

  const handleUpdateStatus = async (bugId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved') {
        updateData.resolved_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('bugs')
        .update(updateData)
        .eq('id', bugId);

      if (error) throw error;

      setBugs(bugs.map(bug =>
        bug.id === bugId ? { ...bug, ...updateData } : bug
      ));

      alert('Bug status updated successfully!');
    } catch (error) {
      console.error('Error updating bug:', error);
      alert('Failed to update bug status');
    }
  };

  const handleAssignEmployee = async (bugId: string, employeeId: string) => {
    try {
      const { error } = await supabase
        .from('bugs')
        .update({ assigned_employee_id: employeeId, updated_at: new Date().toISOString() })
        .eq('id', bugId);

      if (error) throw error;

      setBugs(bugs.map(bug =>
        bug.id === bugId ? { ...bug, assigned_employee_id: employeeId } : bug
      ));

      alert('Bug assigned successfully!');
    } catch (error) {
      console.error('Error assigning bug:', error);
      alert('Failed to assign bug');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBug(prev => ({
          ...prev,
          screenshots: [...prev.screenshots, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setNewBug(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setNewBug({
      user_type: 'admin',
      title: '',
      description: '',
      expected_behaviour: '',
      actual_behaviour: '',
      module: '',
      testing_person: '',
      priority: 'medium',
      screenshots: []
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'reopened': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <Bug className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reopened': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    const matchesUserType = userTypeFilter === 'all' || bug.user_type === userTypeFilter;
    const matchesModule = moduleFilter === 'all' || bug.module === moduleFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesUserType && matchesModule;
  });

  const stats = {
    total: bugs.length,
    pending: bugs.filter(b => b.status === 'pending').length,
    inProgress: bugs.filter(b => b.status === 'in-progress').length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
    critical: bugs.filter(b => b.priority === 'critical').length
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-gray-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bug Management System</h1>
          <p className="text-gray-600 mt-2">Track and resolve system bugs across all user roles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Report Bug
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bugs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <Bug className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.critical}</p>
            </div>
            <Flag className="w-10 h-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="reopened">Reopened</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All User Types</option>
            <option value="admin">Admin</option>
            <option value="business">Business</option>
            <option value="employee">Employee</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredBugs.length} of {bugs.length} bugs</span>
          <button
            onClick={loadBugs}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Bugs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading bugs...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBugs.map((bug) => (
            <div key={bug.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(bug.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{bug.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(bug.priority)}`}>
                      {bug.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(bug.status)}`}>
                      {bug.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {bug.user_type.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{bug.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {bug.module && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Filter className="w-4 h-4 mr-2" />
                        Module: {bug.module}
                      </div>
                    )}
                    {bug.testing_person && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        Tester: {bug.testing_person}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(bug.reported_date).toLocaleDateString()}
                    </div>
                    {bug.screenshots.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {bug.screenshots.length} screenshot(s)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedBug(bug);
                        setShowDetailsModal(true);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>

                    {bug.status !== 'resolved' && (
                      <>
                        <select
                          value={bug.status}
                          onChange={(e) => handleUpdateStatus(bug.id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                          <option value="reopened">Reopened</option>
                        </select>

                        <select
                          value={bug.assigned_employee_id || ''}
                          onChange={(e) => handleAssignEmployee(bug.id, e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Assign to...</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="text-sm text-gray-500 mb-2">Bug ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{bug.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredBugs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bugs found matching your criteria</p>
        </div>
      )}

      {/* Create Bug Modal - Implementation continues... */}
    </div>
  );
}
