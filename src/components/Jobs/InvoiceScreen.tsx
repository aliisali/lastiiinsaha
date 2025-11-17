import React, { useState } from 'react';
import { Send, FileText, CheckCircle, Package, Ruler } from 'lucide-react';
import { Job, JobMeasurement, SelectedProduct } from '../../types';
import { useData } from '../../contexts/DataContext';

interface InvoiceScreenProps {
  job: Job;
  onComplete: (data: { invoiceSent: boolean; invoice: number }) => void;
}

export function InvoiceScreen({ job, onComplete }: InvoiceScreenProps) {
  const { customers } = useData();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const customer = customers.find(c => c.id === job.customerId);
  const totalAmount = (job.selectedProducts || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const handleSendInvoice = async () => {
    setSending(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSent(true);

      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      successDiv.textContent = 'Invoice Sent Successfully!';
      document.body.appendChild(successDiv);

      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);

    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }

    setSending(false);
  };

  const handleComplete = () => {
    onComplete({
      invoiceSent: true,
      invoice: totalAmount
    });
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Invoice Summary</h3>
        <p className="text-gray-600">Review and send invoice to customer</p>
      </div>

      {customer && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {customer.name}</p>
            <p><span className="font-medium">Email:</span> {customer.email}</p>
            <p><span className="font-medium">Phone:</span> {customer.phone}</p>
            <p><span className="font-medium">Address:</span> {customer.address}</p>
          </div>
        </div>
      )}

      {job.selectedProducts && job.selectedProducts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
            <h4 className="font-semibold text-blue-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Products ({job.selectedProducts.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-200">
            {job.selectedProducts.map((product: SelectedProduct) => (
              <div key={product.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{product.productName}</p>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(product.price * product.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">${product.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {job.measurements && job.measurements.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 px-4 py-3">
            <h4 className="font-semibold text-green-900 flex items-center">
              <Ruler className="w-5 h-5 mr-2" />
              Measurements ({job.measurements.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-200">
            {job.measurements.map((measurement: JobMeasurement) => (
              <div key={measurement.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{measurement.windowId}</p>
                    {measurement.location && (
                      <p className="text-sm text-gray-600">{measurement.location}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-900">{measurement.width} × {measurement.height} cm</p>
                  </div>
                </div>
                {measurement.photos && measurement.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {measurement.photos.slice(0, 3).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${measurement.windowId} - ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {measurement.photos.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-sm text-gray-600 font-medium">
                        +{measurement.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-600 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Invoice Amount</p>
            <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
          <FileText className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {!sent ? (
        <div className="flex justify-center">
          <button
            onClick={handleSendInvoice}
            disabled={sending}
            className="flex items-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
          >
            <Send className="w-6 h-6 mr-3" />
            {sending ? 'Sending Invoice...' : 'Send Invoice to Customer'}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900">Invoice Sent Successfully!</h4>
          <p className="text-gray-600">
            Invoice has been sent to {customer?.email}
          </p>
          <button
            onClick={handleComplete}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
