import React, { useState } from 'react';
import { Job } from '../../types';
import { OrderConfirmationStep } from './Installation/OrderConfirmationStep';
import { InstallationPhotosStep } from './Installation/InstallationPhotosStep';
import { CustomerSignatureStep } from './Installation/CustomerSignatureStep';
import { FinalPaymentStep } from './Installation/FinalPaymentStep';
import { InvoiceStep } from './Installation/InvoiceStep';
import { CheckCircle } from 'lucide-react';

interface InstallationJobScreenProps {
  job: Job;
  onComplete: (data: any) => void;
}

type InstallationStep =
  | 'confirm_order'
  | 'installation'
  | 'photos'
  | 'signature'
  | 'payment'
  | 'invoice'
  | 'complete';

export function InstallationJobScreen({ job, onComplete }: InstallationJobScreenProps) {
  const [currentStep, setCurrentStep] = useState<InstallationStep>('confirm_order');
  const [installationData, setInstallationData] = useState({
    orderConfirmed: false,
    orderConfirmedAt: '',
    installationStartedAt: '',
    photos: [] as string[],
    signature: '',
    signedAt: '',
    paymentMethod: '',
    paymentAmount: 0,
    paymentReference: '',
    paidAt: '',
    invoiceSent: false,
    invoiceSentAt: ''
  });

  const updateInstallationData = (data: Partial<typeof installationData>) => {
    setInstallationData(prev => ({ ...prev, ...data }));
  };

  const handleStepComplete = (stepData: any) => {
    updateInstallationData(stepData);

    switch (currentStep) {
      case 'confirm_order':
        setCurrentStep('photos');
        break;
      case 'photos':
        setCurrentStep('signature');
        break;
      case 'signature':
        setCurrentStep('payment');
        break;
      case 'payment':
        setCurrentStep('invoice');
        break;
      case 'invoice':
        setCurrentStep('complete');
        break;
    }
  };

  const handleFinishJob = () => {
    onComplete({
      ...installationData,
      completedAt: new Date().toISOString(),
      status: 'completed'
    });
  };

  const steps = [
    { id: 'confirm_order', label: 'Confirm Order', completed: installationData.orderConfirmed },
    { id: 'photos', label: 'Photos', completed: installationData.photos.length > 0 },
    { id: 'signature', label: 'Signature', completed: !!installationData.signature },
    { id: 'payment', label: 'Payment', completed: !!installationData.paymentMethod },
    { id: 'invoice', label: 'Invoice', completed: installationData.invoiceSent }
  ];

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Installation Complete!</h2>
          <p className="text-gray-600 mb-6">
            All installation steps have been completed and recorded in the job history.
          </p>
          <button
            onClick={handleFinishJob}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Finish Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Installation Job</h2>

        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600 font-medium text-center">
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 'confirm_order' && (
        <OrderConfirmationStep
          job={job}
          onConfirm={(data) => handleStepComplete(data)}
        />
      )}

      {currentStep === 'photos' && (
        <InstallationPhotosStep
          job={job}
          existingPhotos={installationData.photos}
          onComplete={(data) => handleStepComplete(data)}
        />
      )}

      {currentStep === 'signature' && (
        <CustomerSignatureStep
          job={job}
          onComplete={(data) => handleStepComplete(data)}
        />
      )}

      {currentStep === 'payment' && (
        <FinalPaymentStep
          job={job}
          onComplete={(data) => handleStepComplete(data)}
        />
      )}

      {currentStep === 'invoice' && (
        <InvoiceStep
          job={job}
          installationData={installationData}
          onComplete={(data) => handleStepComplete(data)}
        />
      )}
    </div>
  );
}
