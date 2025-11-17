import React, { useState } from 'react';
import { Play, Pause, CheckCircle, Camera, FileText, CreditCard, Ligature as Signature, Clock, ArrowRight, X, Calendar } from 'lucide-react';
import { Job } from '../../types';
import { ProductSelection } from './ProductSelection';
import { EnhancedMeasurementScreen } from './EnhancedMeasurementScreen';
import { QuotationScreen } from './QuotationScreen';
import { PaymentScreen } from './PaymentScreen';
import { SignatureCapture } from './SignatureCapture';
import { InvoiceScreen } from './InvoiceScreen';
import { InstallationJobScreen } from './InstallationJobScreen';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { EmailService } from '../../services/EmailService';

interface JobWorkflowProps {
  job: Job;
  onUpdateJob: (updates: Partial<Job>) => void;
  onClose: () => void;
}

export function JobWorkflow({ job, onUpdateJob, onClose }: JobWorkflowProps) {
  const { user } = useAuth();
  const { customers, addNotification, addJob } = useData();
  const [currentStep, setCurrentStep] = useState<'start' | 'products' | 'measurements' | 'quotation' | 'payment' | 'signature' | 'invoice' | 'complete' | 'convert-to-installation' | 'installation-workflow'>('start');
  const [jobStartTime, setJobStartTime] = useState<string | null>(null);
  const [showConversionSuccess, setShowConversionSuccess] = useState(false);

  const sendCompletionEmail = async () => {
    try {
      const customer = customers.find(c => c.id === job.customerId);
      if (!customer) {
        console.warn('Customer not found for job completion email');
        return;
      }

      await EmailService.sendJobCompletionEmail({
        customerName: customer.name,
        customerEmail: customer.email,
        jobTitle: job.title,
        jobId: job.id,
        completionDate: new Date().toISOString()
      });

      // Create notification
      await addNotification({
        userId: job.employeeId || '',
        type: 'job_completed',
        title: 'Job Completed',
        message: `Job "${job.title}" completed and customer notified`,
        read: false
      });
    } catch (error) {
      console.error('Failed to send completion email:', error);
    }
  };

  const handleStartJob = () => {
    const startTime = new Date().toISOString();
    setJobStartTime(startTime);

    const historyEntry = {
      id: `history-${Date.now()}`,
      timestamp: startTime,
      action: 'job_started',
      description: `${job.jobType} job started`,
      userId: user?.id || 'current-user-id',
      userName: user?.name || 'Current User'
    };

    onUpdateJob({
      status: 'in-progress',
      startTime,
      jobHistory: [...job.jobHistory, historyEntry]
    });

    // For installation jobs, go directly to installation workflow
    // For measurement jobs, start with product selection
    if (job.jobType === 'installation') {
      setCurrentStep('installation-workflow');
    } else {
      setCurrentStep('products');
    }
  };

  const handleConvertToInstallation = async () => {
    // Create a NEW installation job as a copy of the measurement job
    // Keep the original measurement job intact and completed

    try {
      // First, mark the measurement job as completed
      onUpdateJob({
        status: 'completed',
        completedDate: new Date().toISOString(),
        jobHistory: [...job.jobHistory, {
          id: `history-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'measurement_completed',
          description: 'Measurement job completed - Creating installation job',
          userId: user?.id || '',
          userName: user?.name || ''
        }]
      });

      // Calculate a default installation date (7 days from measurement date)
      const measurementDate = new Date(job.scheduledDate);
      const defaultInstallationDate = new Date(measurementDate);
      defaultInstallationDate.setDate(defaultInstallationDate.getDate() + 7);
      const installationDateString = defaultInstallationDate.toISOString().split('T')[0];

      // Create new installation job with all measurement data
      const newInstallationJob = {
        title: `Installation - ${job.title}`,
        description: `Installation job created from measurement job #${job.id}. Schedule pending confirmation.`,
        jobType: 'installation' as const,
        customerId: job.customerId,
        businessId: job.businessId,
        employeeId: null, // Unassigned, business will assign
        scheduledDate: installationDateString, // Set to 7 days after measurement
        scheduledTime: '09:00',
        status: 'tbd' as const, // Use TBD status to indicate scheduling is pending
        // Copy all measurement data
        measurements: job.measurements,
        selectedProducts: job.selectedProducts,
        quotation: job.quotation,
        deposit: job.deposit,
        depositPaid: job.depositPaid,
        images: job.images,
        documents: job.documents,
        checklist: [
          { id: '1', text: 'Confirm order with customer', completed: false },
          { id: '2', text: 'Take installation photos', completed: false },
          { id: '3', text: 'Get customer signature', completed: false },
          { id: '4', text: 'Collect final payment', completed: false },
          { id: '5', text: 'Send invoice', completed: false }
        ],
        parentJobId: job.id, // Link to parent measurement job
        jobHistory: [{
          id: `history-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'installation_job_created',
          description: `Created from measurement job #${job.id}. Initial schedule set to ${installationDateString} (7 days after measurement). Awaiting business confirmation.`,
          userId: user?.id || '',
          userName: user?.name || '',
          data: { parentJobId: job.id, suggestedDate: installationDateString }
        }]
      };

      await addJob(newInstallationJob);

      setShowConversionSuccess(true);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Error creating installation job:', error);
      alert('Failed to create installation job. Please try again.');
    }
  };

  const handleStepComplete = (stepData: any) => {
    const historyEntry = {
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `${currentStep}_completed`,
      description: `${currentStep} step completed`,
      userId: 'current-user-id',
      userName: 'Current User',
      data: stepData
    };

    onUpdateJob({
      jobHistory: [...job.jobHistory, historyEntry],
      ...stepData
    });

    // Move to next step
    switch (currentStep) {
      case 'products':
        // Only go to measurements for measurement jobs
        if (job.jobType === 'measurement') {
          setCurrentStep('measurements');
        } else {
          setCurrentStep('quotation');
        }
        break;
      case 'measurements':
        // For measurement jobs, go directly to invoice
        setCurrentStep('invoice');
        break;
      case 'invoice':
        // After invoice, show conversion option for measurement jobs
        if (job.jobType === 'measurement') {
          setCurrentStep('convert-to-installation');
        } else {
          setCurrentStep('complete');
        }
        break;
      case 'quotation':
        setCurrentStep('payment');
        break;
      case 'payment':
        if (job.jobType === 'measurement') {
          // Show conversion option for measurement jobs
          setCurrentStep('convert-to-installation');
        } else {
          setCurrentStep('signature');
        }
        break;
      case 'signature':
        onUpdateJob({
          status: 'completed',
          completedDate: new Date().toISOString()
        });
        setCurrentStep('complete');
        // Send completion email
        sendCompletionEmail();
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'start':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to Start {job.jobType === 'measurement' ? 'Measurement' : 'Installation'}
            </h2>
            <p className="text-gray-600 mb-6">
              Job ID: {job.id} | Customer: {job.customerId}
            </p>
            <button
              onClick={handleStartJob}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Play className="w-5 h-5 mr-2 inline" />
              Start Job
            </button>
          </div>
        );

      case 'products':
        return (
          <ProductSelection
            job={job}
            onComplete={handleStepComplete}
          />
        );

      case 'measurements':
        return (
          <EnhancedMeasurementScreen
            job={job}
            onComplete={(data) => {
              // Save measurements to current job
              handleStepComplete({ measurements: data.measurements });

              // If auto-convert is enabled, create installation job
              if (data.convertToInstallation) {
                setCurrentStep('convert-to-installation');
              }
            }}
          />
        );

      case 'quotation':
        return (
          <QuotationScreen
            job={job}
            onComplete={(data) => {
              if (data.status === 'tbd') {
                // Save the quotation and close the workflow
                onUpdateJob({
                  quotation: data.quotation,
                  status: 'tbd',
                  jobHistory: [...job.jobHistory, {
                    id: `history-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    action: 'quotation_tbd',
                    description: 'Customer still deciding on quotation',
                    userId: 'current-user-id',
                    userName: 'Current User'
                  }]
                });
                onClose();
              } else {
                handleStepComplete(data);
              }
            }}
            onCancel={() => {
              // TBD button - save and return to jobs screen
              onUpdateJob({
                status: 'tbd',
                jobHistory: [...job.jobHistory, {
                  id: `history-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  action: 'quotation_tbd',
                  description: 'Customer still deciding on quotation',
                  userId: 'current-user-id',
                  userName: 'Current User'
                }]
              });
              onClose();
            }}
          />
        );

      case 'invoice':
        return (
          <InvoiceScreen
            job={job}
            onComplete={handleStepComplete}
          />
        );

      case 'payment':
        return (
          <PaymentScreen
            job={job}
            onComplete={handleStepComplete}
          />
        );

      case 'signature':
        return (
          <SignatureCapture
            job={job}
            onComplete={handleStepComplete}
          />
        );

      case 'installation-workflow':
        return (
          <InstallationJobScreen
            job={job}
            onComplete={(data) => {
              onUpdateJob({
                ...data,
                status: 'completed',
                completedDate: new Date().toISOString(),
                jobHistory: [...job.jobHistory, {
                  id: `history-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  action: 'installation_completed',
                  description: 'Installation job completed',
                  userId: user?.id || '',
                  userName: user?.name || '',
                  data
                }]
              });
              setCurrentStep('complete');
              sendCompletionEmail();
            }}
          />
        );

      case 'convert-to-installation':
        const measurementDate = new Date(job.scheduledDate);
        const suggestedInstallDate = new Date(measurementDate);
        suggestedInstallDate.setDate(suggestedInstallDate.getDate() + 7);
        const suggestedDateString = suggestedInstallDate.toLocaleDateString();

        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Measurement Complete! Create Installation Job?
            </h2>
            <p className="text-gray-600 mb-2">
              The measurement has been completed successfully.
            </p>
            <p className="text-gray-600 mb-6">
              A new installation job will be created with all measurement data.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next:</h3>
              <ul className="text-sm text-gray-700 space-y-1 text-left">
                <li>• Measurement job stays completed ✓</li>
                <li>• NEW installation job created automatically</li>
                <li>• Installation job has ALL measurements & photos</li>
                <li>• Suggested date: {suggestedDateString} (7 days from measurement)</li>
                <li>• Status: TBD - needs business confirmation</li>
                <li>• Business user can reassign & reschedule as needed</li>
              </ul>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  // Just complete measurement without converting
                  onUpdateJob({
                    status: 'completed',
                    completedDate: new Date().toISOString()
                  });
                  setCurrentStep('complete');
                  sendCompletionEmail();
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Complete as Measurement Only
              </button>
              <button
                onClick={handleConvertToInstallation}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Create Installation Job
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {showConversionSuccess ? 'Installation Job Created!' : `${job.jobType === 'measurement' ? 'Measurement' : 'Installation'} Complete!`}
            </h2>
            <p className="text-gray-600 mb-2">
              {showConversionSuccess
                ? 'A new installation job has been created with all measurement data.'
                : 'Job has been completed successfully.'}
            </p>
            {showConversionSuccess && (
              <p className="text-blue-600 font-semibold mb-4">
                ✓ Installation job is waiting for business to assign and schedule!
              </p>
            )}
            <button
              onClick={onClose}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepProgress = () => {
    const steps = ['start', 'products', 'measurements', 'quotation', 'payment'];
    if (job.jobType === 'installation') {
      steps.push('signature');
    }
    steps.push('complete');

    const currentIndex = steps.indexOf(currentStep);
    return (currentIndex / (steps.length - 1)) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {job.jobType === 'measurement' ? 'Measurement' : 'Installation'} Workflow
              </h2>
              <p className="text-gray-600">Job ID: {job.id}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Step: {currentStep.replace('-', ' ')} | Started: {jobStartTime ? new Date(jobStartTime).toLocaleTimeString() : 'Not started'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}