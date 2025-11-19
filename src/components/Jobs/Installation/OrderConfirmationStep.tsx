import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, AlertCircle, DollarSign, Calendar, User } from 'lucide-react';
import { Job, Customer, Business } from '../../../types';
import { supabase } from '../../../lib/supabase';

interface OrderConfirmationStepProps {
  job: Job;
  onConfirm: (data: any) => void;
}

export function OrderConfirmationStep({ job, onConfirm }: OrderConfirmationStepProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [parentJob, setParentJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const promises = [
        supabase.from('customers').select('*').eq('id', job.customerId).maybeSingle(),
        supabase.from('businesses').select('*').eq('id', job.businessId).maybeSingle()
      ];

      if (job.parentJobData) {
        setParentJob(job.parentJobData);
      } else if (job.parentJobId) {
        promises.push(
          supabase.from('jobs').select('*').eq('id', job.parentJobId).maybeSingle()
        );
      }

      const results = await Promise.all(promises);
      const [customerRes, businessRes, parentJobRes] = results;

      if (customerRes.data) setCustomer(customerRes.data);
      if (businessRes.data) setBusiness(businessRes.data);
      if (parentJobRes && parentJobRes.data) setParentJob(parentJobRes.data as Job);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!confirmed) {
      alert('Please confirm that you have verified the order with the customer');
      return;
    }

    onConfirm({
      orderConfirmed: true,
      orderConfirmedAt: new Date().toISOString(),
      installationStartedAt: new Date().toISOString()
    });
  };

  const measurements = parentJob?.measurements || job.measurements || [];
  const products = parentJob?.selectedProducts || job.selectedProducts || [];

  const quotationAmount = parentJob?.quotation || job.quotation || 0;
  const depositAmount = parentJob?.deposit || job.deposit || 0;
  const depositPaid = parentJob?.depositPaid || job.depositPaid || false;
  const depositPaidAt = parentJob?.depositPaidAt || job.depositPaidAt;
  const depositPaymentMethod = parentJob?.depositPaymentMethod || job.depositPaymentMethod;
  const depositReference = parentJob?.depositCustomerReference || job.depositCustomerReference;
  const depositSkipped = parentJob?.depositPaymentSkipped || job.depositPaymentSkipped || false;
  const depositSkipReason = parentJob?.depositSkipReason || job.depositSkipReason;

  const remainingBalance = quotationAmount - depositAmount;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Confirm Order with Customer</h3>
          <p className="text-gray-600">Verify all order details before starting installation</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Before You Begin:</p>
          <p>Double-check all order details with the customer to ensure everything is correct before starting the installation.</p>
        </div>
      </div>

      <div className="space-y-6">
        {parentJob && (
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600 mr-3" />
              <h4 className="font-bold text-xl text-blue-900">Measurement Job Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Measurement Date</p>
                <p className="font-semibold text-gray-900">
                  {parentJob.scheduledDate ? new Date(parentJob.scheduledDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Job Reference</p>
                <p className="font-semibold text-gray-900">#{parentJob.id.slice(0, 8)}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="font-semibold text-green-600">
                  {parentJob.status === 'completed' ? 'Completed' : parentJob.status}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-lg text-gray-900 mb-4">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{customer?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900">{customer?.phone || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold text-gray-900">{customer?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-lg text-gray-900 mb-4">Products Ordered</h4>
            <div className="space-y-3">
              {products.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.productName || product.name}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{product.productName || product.name}</p>
                      <p className="text-sm text-gray-600">{product.description || ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${parseFloat(product.price || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Qty: {product.quantity || 1}</p>
                    <p className="text-sm font-semibold text-blue-600">Total: ${(parseFloat(product.price || 0) * (product.quantity || 1)).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {measurements.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-lg text-gray-900 mb-4">Measurements</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Area</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Width</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Depth</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((measurement: any, index: number) => (
                    <tr key={index} className={`border-b border-gray-100 ${measurement.productName ? 'bg-green-50' : ''}`}>
                      <td className="py-2 px-3 text-gray-900">{measurement.area || measurement.location || `Window ${index + 1}`}</td>
                      <td className="py-2 px-3 text-center text-gray-900">{measurement.width}cm</td>
                      <td className="py-2 px-3 text-center text-gray-900">{measurement.depth || measurement.height}cm</td>
                      <td className="py-2 px-3">
                        {measurement.productName ? (
                          <div className="flex items-center">
                            <Package className="w-4 h-4 text-green-600 mr-2" />
                            <span className="font-semibold text-green-900">{measurement.productName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {measurement.productPrice ? (
                          <span className="font-bold text-green-700">${measurement.productPrice.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-600 text-sm">{measurement.comments || measurement.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-green-600 mr-3" />
            <h4 className="font-bold text-xl text-gray-900">Payment Summary</h4>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Quotation Amount</span>
                <span className="text-2xl font-bold text-gray-900">${quotationAmount.toFixed(2)}</span>
              </div>
              {parentJob && (
                <p className="text-xs text-gray-500 mt-1">From measurement job dated {new Date(parentJob.scheduledDate).toLocaleDateString()}</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-gray-700 font-medium">Deposit Paid at Measurement</span>
                  {depositPaid && depositPaidAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Paid on {new Date(depositPaidAt).toLocaleDateString()} at {new Date(depositPaidAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {depositPaid ? (
                    <>
                      <span className="text-2xl font-bold text-green-600">${depositAmount.toFixed(2)}</span>
                      <div className="flex items-center justify-end mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-xs font-semibold text-green-600">PAID</span>
                      </div>
                    </>
                  ) : depositSkipped ? (
                    <>
                      <span className="text-lg font-semibold text-orange-600">Deferred</span>
                      {depositSkipReason && (
                        <p className="text-xs text-orange-600 mt-1">Reason: {depositSkipReason}</p>
                      )}
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-red-600">Not Paid</span>
                  )}
                </div>
              </div>
              {depositPaid && depositPaymentMethod && (
                <div className="flex items-center text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium">Payment Method:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {depositPaymentMethod === 'card' ? 'Card' : depositPaymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}
                  </span>
                  {depositReference && (
                    <span className="ml-3">
                      <span className="font-medium">Ref:</span> {depositReference}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-4 shadow-sm border-2 border-blue-300">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-blue-900 font-bold text-lg">Remaining Balance Due</span>
                  <p className="text-xs text-blue-700 mt-1">To be collected after installation</p>
                </div>
                <span className="text-3xl font-bold text-blue-600">${remainingBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded mt-0.5 mr-3"
            />
            <div>
              <p className="font-semibold text-blue-900">I confirm that:</p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• I have verified the order details with the customer</li>
                <li>• The customer confirms this is the correct order</li>
                <li>• All products and measurements match the order</li>
                <li>• The customer is ready for installation to begin</li>
              </ul>
            </div>
          </label>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!confirmed}
          className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <CheckCircle className="w-6 h-6 mr-3" />
          Confirm Order & Start Installation
        </button>
      </div>
    </div>
  );
}
