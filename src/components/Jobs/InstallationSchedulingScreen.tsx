import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
import { Job } from '../../types';

interface InstallationSchedulingScreenProps {
  job: Job;
  onSchedule: (date: string, time: string) => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function InstallationSchedulingScreen({
  job,
  onSchedule,
  onSkip,
  onCancel
}: InstallationSchedulingScreenProps) {
  const [installationDate, setInstallationDate] = useState('');
  const [installationTime, setInstallationTime] = useState('09:00');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const measurementDate = new Date(job.scheduledDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(Math.max(measurementDate.getTime(), today.getTime()));
  const minDateString = minDate.toISOString().split('T')[0];

  const suggestedDate = new Date(measurementDate);
  suggestedDate.setDate(suggestedDate.getDate() + 7);
  const suggestedDateString = suggestedDate.toISOString().split('T')[0];

  const handleSchedule = () => {
    if (!installationDate) {
      alert('Please select an installation date');
      return;
    }

    const selectedDate = new Date(installationDate);

    if (selectedDate < today) {
      alert('Installation date cannot be in the past');
      return;
    }

    if (selectedDate < measurementDate) {
      alert('Installation date cannot be before the measurement date');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSchedule = () => {
    onSchedule(installationDate, installationTime);
  };

  if (showConfirmation) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Confirm Installation Schedule
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="text-left space-y-3">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                <span className="font-medium">Date:</span>
                <span className="ml-2">{new Date(installationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3 text-blue-600" />
                <span className="font-medium">Time:</span>
                <span className="ml-2">{installationTime}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            An installation job will be created with this schedule and sent to the business for assignment.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go Back
            </button>
            <button
              onClick={confirmSchedule}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirm Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Schedule Installation Appointment
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600">
          Deposit payment received! Now schedule the installation appointment for this customer.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Deposit Paid</h4>
            <p className="text-sm text-green-800">
              Deposit of ${job.deposit?.toFixed(2)} has been paid. The customer is ready for installation scheduling.
            </p>
          </div>
        </div>
      </div>

      {job.measurements && job.measurements.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-3">Measurement Summary</h4>
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Total Measurements:</span> {job.measurements.length}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Measurement Date:</span> {measurementDate.toLocaleDateString()}
            </p>
            {job.selectedProducts && job.selectedProducts.length > 0 && (
              <p className="text-sm text-blue-800">
                <span className="font-medium">Products Selected:</span> {job.selectedProducts.length}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Scheduling Guidelines</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Installation should be scheduled at least 7 days after measurement</li>
              <li>• Ensure adequate time for product preparation and delivery</li>
              <li>• Consider customer availability and preferences</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Installation Date *
            </label>
            <input
              type="date"
              value={installationDate}
              onChange={(e) => setInstallationDate(e.target.value)}
              min={minDateString}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Suggested: {suggestedDate.toLocaleDateString()} (7 days after measurement)
            </p>
            <button
              onClick={() => setInstallationDate(suggestedDateString)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
            >
              Use suggested date
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Installation Time *
            </label>
            <select
              value={installationTime}
              onChange={(e) => setInstallationTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="08:00">8:00 AM</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Skip - Schedule Later
          </button>
          <button
            onClick={handleSchedule}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            Schedule Installation
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          If you skip scheduling now, this job will appear in the Job Assignment Center where business users can schedule it later.
        </p>
      </div>
    </div>
  );
}
