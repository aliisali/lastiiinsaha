import React, { useState } from 'react';
import { CheckCircle, CreditCard, DollarSign, Banknote } from 'lucide-react';
import { Job } from '../../../types';

interface FinalPaymentStepProps {
  job: Job;
  onComplete: (data: any) => void;
}

export function FinalPaymentStep({ job, onComplete }: FinalPaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash' | 'bank_transfer'>('cash');
  const [bankReference, setBankReference] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);

  const quotation = typeof job.quotation === 'number' ? job.quotation : parseFloat(String(job.quotation || '0'));
  const deposit = typeof job.deposit === 'number' ? job.deposit : parseFloat(String(job.deposit || '0'));
  const balanceDue = quotation - deposit;

  const handlePayment = async () => {
    if (paymentMethod === 'online') {
      alert('Online payment gateway integration pending. Please use cash or bank transfer.');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !bankReference.trim()) {
      alert('Please enter bank transfer reference number');
      return;
    }

    if (paymentMethod === 'cash' && !cashReceived.trim()) {
      alert('Please confirm cash amount received');
      return;
    }

    setProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      onComplete({
        paymentMethod,
        paymentAmount: balanceDue,
        paymentReference: paymentMethod === 'bank_transfer' ? bankReference : paymentMethod === 'cash' ? `CASH-${Date.now()}` : '',
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : 0,
        paidAt: new Date().toISOString(),
        balancePaid: true
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
          <DollarSign className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Final Payment</h3>
          <p className="text-gray-600">Collect remaining balance from customer</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Quotation</p>
            <p className="text-2xl font-bold text-gray-900">${quotation.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Deposit Paid</p>
            <p className="text-2xl font-bold text-green-600">-${deposit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Balance Due</p>
            <p className="text-3xl font-bold text-blue-600">${balanceDue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-900">Select Payment Method</h4>

        <label className="flex items-start p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === 'cash'}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-5 h-5 text-blue-600 mt-0.5"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <Banknote className="w-5 h-5 text-green-600 mr-2" />
              <p className="font-semibold text-gray-900">Cash Payment</p>
            </div>
            <p className="text-sm text-gray-600 mt-1">Customer pays with cash on-site</p>
            
            {paymentMethod === 'cash' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cash Amount Received *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                {parseFloat(cashReceived) > balanceDue && (
                  <p className="text-sm text-orange-600 mt-2">
                    Change due: ${(parseFloat(cashReceived) - balanceDue).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>
        </label>

        <label className="flex items-start p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="bank_transfer"
            checked={paymentMethod === 'bank_transfer'}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-5 h-5 text-blue-600 mt-0.5"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
              <p className="font-semibold text-gray-900">Bank Transfer</p>
            </div>
            <p className="text-sm text-gray-600 mt-1">Customer transfers to bank account</p>

            {paymentMethod === 'bank_transfer' && (
              <div className="mt-4 space-y-3">
                <div className="bg-white border border-blue-200 rounded-lg p-3 text-sm space-y-1">
                  <p><strong>Bank:</strong> Example Bank</p>
                  <p><strong>Account Name:</strong> Business Name</p>
                  <p><strong>Account Number:</strong> 1234-5678-9012</p>
                  <p><strong>Amount:</strong> ${balanceDue.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Transfer Reference Number *
                  </label>
                  <input
                    type="text"
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter transfer reference number"
                  />
                </div>
              </div>
            )}
          </div>
        </label>

        <label className="flex items-start p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="online"
            checked={paymentMethod === 'online'}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-5 h-5 text-blue-600 mt-0.5"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
              <p className="font-semibold text-gray-900">Online Payment</p>
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Pay via credit/debit card or digital wallet</p>
          </div>
        </label>
      </div>

      <button
        onClick={handlePayment}
        disabled={processing || (paymentMethod === 'bank_transfer' && !bankReference.trim()) || (paymentMethod === 'cash' && !cashReceived.trim())}
        className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <CheckCircle className="w-6 h-6 mr-3" />
        {processing ? 'Processing...' : `Confirm Payment - $${balanceDue.toFixed(2)}`}
      </button>
    </div>
  );
}