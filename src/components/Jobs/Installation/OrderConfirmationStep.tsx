import React, { useState } from 'react';
import { CheckCircle, Package, AlertCircle } from 'lucide-react';
import { Job } from '../../../types';

interface OrderConfirmationStepProps {
  job: Job;
  onConfirm: (data: any) => void;
}

export function OrderConfirmationStep({ job, onConfirm }: OrderConfirmationStepProps) {
  const [confirmed, setConfirmed] = useState(false);

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

  const measurements = job.measurements || [];
  const products = job.products || [];

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
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-lg text-gray-900 mb-4">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{job.customer?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900">{job.customer?.phone || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold text-gray-900">{job.customer?.address || 'N/A'}</p>
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
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.price}</p>
                    <p className="text-sm text-gray-600">Qty: {product.quantity || 1}</p>
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
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((measurement: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-900">{measurement.area || measurement.location || `Window ${index + 1}`}</td>
                      <td className="py-2 px-3 text-center text-gray-900">{measurement.width}cm</td>
                      <td className="py-2 px-3 text-center text-gray-900">{measurement.depth || measurement.height}cm</td>
                      <td className="py-2 px-3 text-gray-600 text-sm">{measurement.comments || measurement.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-lg text-gray-900 mb-4">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Quotation Amount</span>
              <span className="font-semibold text-gray-900">${job.quotation || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Deposit Paid</span>
              <span className="font-semibold text-green-600">
                {job.deposit_paid ? `$${job.deposit || '0.00'}` : 'Not Paid'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Balance Due</span>
              <span className="font-bold text-blue-600">
                ${(parseFloat(job.quotation || '0') - parseFloat(job.deposit || '0')).toFixed(2)}
              </span>
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
