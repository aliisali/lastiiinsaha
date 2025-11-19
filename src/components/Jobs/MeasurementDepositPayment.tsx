import React, { useState } from 'react';
import { CreditCard, Banknote, Building, ArrowRight, DollarSign, AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';
import { Job, SelectedProduct } from '../../types';

interface MeasurementDepositPaymentProps {
  job: Job;
  onComplete: (data: {
    deposit: number;
    depositPaid: boolean;
    depositPaidAt?: string;
    depositPaymentMethod: string;
    depositCustomerReference: string;
  }) => void;
  onSkip: (reason: string) => void;
}

export function MeasurementDepositPayment({ job, onComplete, onSkip }: MeasurementDepositPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank-transfer'>('card');
  const [depositAmount, setDepositAmount] = useState(
    job.deposit || (job.quotation ? job.quotation * 0.3 : 0)
  );
  const [customDepositAmount, setCustomDepositAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [customerReference] = useState(`DEP-${Date.now().toString().slice(-8)}`);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  // Calculate total from selected products if available
  const selectedProductsTotal = (job.selectedProducts || []).reduce((sum, p) => {
    const price = parseFloat(String(p.price || 0));
    const quantity = p.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  // Use products total if available, otherwise use quotation
  const totalAmount = selectedProductsTotal > 0 ? selectedProductsTotal : (job.quotation || 0);
  const defaultDeposit = totalAmount * 0.3;
  const remainingBalance = totalAmount - depositAmount;

  const handlePayment = async () => {
    setPaymentProcessing(true);

    try {
      if (paymentMethod === 'card') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPaymentComplete(true);
      } else {
        setPaymentComplete(true);
      }

      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = paymentMethod === 'card'
        ? 'Deposit payment processed successfully!'
        : `${paymentMethod === 'cash' ? 'Cash' : 'Bank transfer'} deposit recorded!`;
      document.body.appendChild(successDiv);

      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }

    setPaymentProcessing(false);
  };

  const handleComplete = () => {
    const finalDepositAmount = useCustomAmount && customDepositAmount
      ? parseFloat(customDepositAmount)
      : depositAmount;

    onComplete({
      deposit: finalDepositAmount,
      depositPaid: true,
      depositPaidAt: new Date().toISOString(),
      depositPaymentMethod: paymentMethod,
      depositCustomerReference: customerReference
    });
  };

  const handleSkipPayment = () => {
    if (!skipReason.trim()) {
      alert('Please provide a reason for deferring payment');
      return;
    }
    onSkip(skipReason);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Collect Deposit Payment
        </h3>
        <p className="text-gray-600">
          Secure the booking with a deposit payment before scheduling installation
        </p>
      </div>

      {/* Selected Products Display */}
      {job.selectedProducts && job.selectedProducts.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Selected Products ({job.selectedProducts.length})
          </h4>
          <div className="space-y-3">
            {job.selectedProducts.map((product: SelectedProduct) => {
              const price = parseFloat(String(product.price || 0));
              const quantity = product.quantity || 1;
              const lineTotal = price * quantity;
              return (
                <div key={product.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">Quantity: {quantity} × ${price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${lineTotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">Products Total:</span>
                <span className="font-bold text-blue-600 text-xl">${selectedProductsTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-blue-900 text-lg mb-1">Payment Summary</h4>
            <p className="text-sm text-blue-700">Job Total & Deposit Breakdown</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-700 mb-1">Total Job Value</p>
            <p className="text-3xl font-bold text-blue-900">${totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-3 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Recommended Deposit (30%)</span>
            <span className="text-xl font-bold text-green-600">${defaultDeposit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Remaining Balance</span>
            <span className="font-semibold text-gray-900">${(totalAmount - defaultDeposit).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomAmount}
              onChange={(e) => setUseCustomAmount(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Use custom deposit amount</span>
          </label>

          {useCustomAmount && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Deposit Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={customDepositAmount}
                  onChange={(e) => setCustomDepositAmount(e.target.value)}
                  placeholder={defaultDeposit.toFixed(2)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {customDepositAmount && parseFloat(customDepositAmount) > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Remaining: ${(totalAmount - parseFloat(customDepositAmount)).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {!paymentComplete && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Card Payment</p>
                    <p className="text-sm text-gray-600">Pay now with card</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Cash Payment</p>
                    <p className="text-sm text-gray-600">Pay with cash</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank-transfer')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === 'bank-transfer'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Building className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Bank Transfer</p>
                    <p className="text-sm text-gray-600">Transfer to account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Customer Reference Number
            </h4>
            <p className="text-yellow-800 text-sm mb-2">
              Provide this reference to the customer: <strong className="text-lg">{customerReference}</strong>
            </p>
            <p className="text-yellow-700 text-xs">
              The customer can use this reference for online payment or future reference
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePayment}
              disabled={paymentProcessing}
              className="flex-1 flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {paymentProcessing
                ? 'Processing Payment...'
                : `Process ${paymentMethod === 'card' ? 'Card' : paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'} Payment`
              }
            </button>

            <button
              onClick={() => setShowSkipConfirm(true)}
              className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center"
            >
              <Clock className="w-5 h-5 mr-2" />
              Defer Payment
            </button>
          </div>
        </>
      )}

      {paymentComplete && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">Deposit Payment Recorded!</h4>
          <p className="text-gray-600 mb-2">
            {paymentMethod === 'card'
              ? 'Payment processed successfully'
              : `${paymentMethod === 'cash' ? 'Cash' : 'Bank transfer'} deposit payment recorded`
            }
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              <strong>Amount Paid:</strong> ${(useCustomAmount && customDepositAmount ? parseFloat(customDepositAmount) : depositAmount).toFixed(2)}
            </p>
            <p className="text-sm text-green-800">
              <strong>Reference:</strong> {customerReference}
            </p>
            <p className="text-sm text-green-800">
              <strong>Remaining Balance:</strong> ${remainingBalance.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center mx-auto"
          >
            Continue to Installation Scheduling
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}

      {showSkipConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Defer Deposit Payment?</h3>
            <p className="text-gray-600 mb-4">
              If you defer the payment, the measurement job will be saved, but the installation job will NOT be created until the deposit is paid.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deferring Payment *
              </label>
              <textarea
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                rows={3}
                placeholder="e.g., Customer will pay online later, Customer requested invoice first, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSkipPayment}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
              >
                Defer Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
