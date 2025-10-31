import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, MapPin, CreditCard, Clipboard, Wrench } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

export function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
  const { addJob, customers, addCustomer } = useData();
  const { user } = useAuth();
  const [jobType, setJobType] = useState<'measurement' | 'installation' | 'task'>('measurement');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerMobile: '',
    customerAddress: '',
    customerPostcode: '',
    taskName: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate required fields
    if (!formData.scheduledDate) {
      alert('Please select a scheduled date');
      return;
    }

    if (isNewCustomer) {
      if (!formData.customerName) {
        alert('Customer name is required');
        return;
      }
      if (!formData.customerEmail) {
        alert('Customer email is required');
        return;
      }
      if (!formData.customerMobile) {
        alert('Customer mobile number is required');
        return;
      }
      if (!formData.customerAddress) {
        alert('Customer address is required');
        return;
      }
    } else if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    // Validate task name for task type
    if (jobType === 'task' && !formData.taskName) {
      alert('Task name is required for general appointments');
      return;
    }

    setIsSubmitting(true);

    try {
      let customerId = selectedCustomerId;
      const businessId = user?.businessId;

      if (!businessId) {
        alert('Error: User does not have a business assigned. Please contact your administrator.');
        setIsSubmitting(false);
        return;
      }

      // Create new customer if needed
      if (isNewCustomer) {
        const customerData = {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          mobile: formData.customerMobile,
          address: formData.customerAddress,
          postcode: formData.customerPostcode,
          businessId
        };

        const newCustomer = await addCustomer(customerData) as any;

        if (!newCustomer || !newCustomer.id) {
          throw new Error('Failed to create customer - no ID returned');
        }

        customerId = newCustomer.id;
      }

      // Generate references
      const customerReference = `REF-${Date.now().toString().slice(-6)}`;
      const paymentReference = `PAY-${Date.now().toString().slice(-6)}`;

      // Determine job title
      let jobTitle = formData.title;
      if (!jobTitle) {
        if (jobType === 'task') {
          jobTitle = formData.taskName;
        } else {
          jobTitle = `${jobType === 'measurement' ? 'Measurement' : 'Installation'} Appointment`;
        }
      }

      // Create job
      const jobData = {
        title: jobTitle,
        description: formData.description || '',
        jobType,
        status: 'pending' as const,
        customerId,
        employeeId: null,
        businessId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        customerReference,
        paymentReference,
        confirmationEmailSent: false,
        images: [],
        documents: [],
        checklist: getDefaultChecklist(jobType),
        measurements: [],
        selectedProducts: [],
        jobHistory: [{
          id: `history-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'job_created',
          description: `${jobType} job created`,
          userId: user?.id || '',
          userName: user?.name || ''
        }],
        taskName: jobType === 'task' ? formData.taskName : undefined,
        taskCompleted: false,
        taskComments: ''
      };

      await addJob(jobData);

      // Send confirmation email
      await sendConfirmationEmail(customerId, jobData);

      onJobCreated();
      onClose();
      resetForm();

    } catch (error: any) {
      console.error('Error creating job:', error);
      alert(`Failed to create job: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultChecklist = (type: 'measurement' | 'installation' | 'task') => {
    if (type === 'measurement') {
      return [
        { id: '1', text: 'Customer consultation', completed: false },
        { id: '2', text: 'Window measurements', completed: false },
        { id: '3', text: 'Product selection', completed: false },
        { id: '4', text: 'Quotation preparation', completed: false },
        { id: '5', text: 'Customer approval', completed: false }
      ];
    } else if (type === 'installation') {
      return [
        { id: '1', text: 'Installation preparation', completed: false },
        { id: '2', text: 'Blinds installation', completed: false },
        { id: '3', text: 'Quality check', completed: false },
        { id: '4', text: 'Customer satisfaction', completed: false },
        { id: '5', text: 'Final payment', completed: false }
      ];
    } else {
      return [
        { id: '1', text: 'Arrive at location', completed: false },
        { id: '2', text: 'Complete task', completed: false },
        { id: '3', text: 'Document work', completed: false }
      ];
    }
  };

  const sendConfirmationEmail = async (customerId: string, jobData: any) => {
    console.log('Sending confirmation email for job:', jobData.id);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '09:00',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerMobile: '',
      customerAddress: '',
      customerPostcode: '',
      taskName: ''
    });
    setJobType('measurement');
    setIsNewCustomer(true);
    setSelectedCustomerId('');
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-auto max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Create New Job</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Appointment Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setJobType('measurement')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  jobType === 'measurement'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Measurement Job</h4>
                    <p className="text-sm text-gray-600">Site visit for measurements</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setJobType('installation')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  jobType === 'installation'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Installation Job</h4>
                    <p className="text-sm text-gray-600">Blinds installation</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setJobType('task')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  jobType === 'task'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clipboard className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Task / Other</h4>
                    <p className="text-sm text-gray-600">General appointment</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Task Name (only for tasks) */}
          {jobType === 'task' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.taskName}
                onChange={(e) => setFormData({...formData, taskName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Consultation, Repair, Follow-up"
              />
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Customer <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setIsNewCustomer(true)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isNewCustomer ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New Customer
              </button>
              <button
                type="button"
                onClick={() => setIsNewCustomer(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  !isNewCustomer ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Existing Customer
              </button>
            </div>

            {!isNewCustomer ? (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({...formData, customerMobile: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={formData.customerPostcode}
                    onChange={(e) => setFormData({...formData, customerPostcode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title {jobType !== 'task' && '(Optional)'}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={jobType === 'task' ? 'Custom title' : `${jobType === 'measurement' ? 'Measurement' : 'Installation'} appointment`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the job"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  required
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Job Type Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {jobType === 'measurement' && 'Measurement Appointment'}
              {jobType === 'installation' && 'Installation Appointment'}
              {jobType === 'task' && 'General Appointment'}
            </h4>
            <p className="text-blue-800 text-sm">
              {jobType === 'measurement' && 'Site visit, measurements, product selection, and quotation preparation.'}
              {jobType === 'installation' && 'Blinds installation, quality check, and final payment collection.'}
              {jobType === 'task' && 'Custom task or general appointment. You can name this appointment and add notes during execution.'}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : `Create ${jobType === 'task' ? 'Task' : jobType === 'measurement' ? 'Measurement' : 'Installation'} Job`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
