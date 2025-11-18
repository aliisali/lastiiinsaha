import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, Send, Download } from 'lucide-react';
import { Job } from '../../../types';
import { supabase } from '../../../lib/supabase';

interface InvoiceStepProps {
  job: Job;
  installationData: any;
  onComplete: (data: any) => void;
}

export function InvoiceStep({ job, installationData, onComplete }: InvoiceStepProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadInvoiceTemplates();
  }, []);

  const loadInvoiceTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('business_id', job.businessId)
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        setTemplates(data);
        setSelectedTemplate(data[0].id);
      } else {
        setTemplates([{
          id: 'default',
          name: 'Default Invoice Template',
          content: 'Standard invoice format'
        }]);
        setSelectedTemplate('default');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([{
        id: 'default',
        name: 'Default Invoice Template',
        content: 'Standard invoice format'
      }]);
      setSelectedTemplate('default');
    }
  };

  const generateInvoice = () => {
    const selectedProducts = job.selectedProducts || [];

    // Calculate subtotal from selected products
    const calculatedSubtotal = selectedProducts.reduce((sum, product) => {
      const price = parseFloat(String(product.price || 0));
      const quantity = product.quantity || 1;
      return sum + (price * quantity);
    }, 0);

    // Use the calculated subtotal or fall back to the job quotation
    const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : parseFloat(String(job.quotation || '0'));
    const deposit = parseFloat(String(job.deposit || '0'));
    const balance = subtotal - deposit;

    return {
      invoiceNumber: `INV-${job.id}-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      customer: null,
      items: selectedProducts,
      measurements: job.measurements || [],
      subtotal: subtotal,
      deposit: deposit,
      balance: balance,
      total: subtotal,
      paymentMethod: installationData.paymentMethod,
      paidInFull: true
    };
  };

  const handleSendInvoice = async () => {
    if (!selectedTemplate) {
      alert('Please select an invoice template');
      return;
    }

    setSending(true);

    try {
      const invoice = generateInvoice();

      await new Promise(resolve => setTimeout(resolve, 1500));

      onComplete({
        invoiceSent: true,
        invoiceSentAt: new Date().toISOString(),
        invoiceNumber: invoice.invoiceNumber,
        invoiceTemplate: selectedTemplate
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const invoice = generateInvoice();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Send Invoice</h3>
          <p className="text-gray-600">Generate and send final invoice to customer</p>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
            <p className="text-gray-600">#{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">Date: {invoice.date}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">Business Name</p>
            <p className="text-sm text-gray-600">Business Address</p>
            <p className="text-sm text-gray-600">Business Phone</p>
          </div>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Bill To:</p>
          <p className="font-semibold text-gray-900">Customer Name</p>
          <p className="text-sm text-gray-600">Customer Address</p>
          <p className="text-sm text-gray-600">Customer Phone</p>
          <p className="text-sm text-gray-600">Customer Email</p>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-semibold text-gray-700">Description</th>
              <th className="text-right py-2 text-sm font-semibold text-gray-700">Qty</th>
              <th className="text-right py-2 text-sm font-semibold text-gray-700">Price</th>
              <th className="text-right py-2 text-sm font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 text-gray-900">{item.productName || item.name}</td>
                <td className="text-right text-gray-900">{item.quantity || 1}</td>
                <td className="text-right text-gray-900">${parseFloat(item.price || 0).toFixed(2)}</td>
                <td className="text-right text-gray-900">${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-900">Installation Service</td>
              <td className="text-right text-gray-900">1</td>
              <td className="text-right text-gray-900">Included</td>
              <td className="text-right text-gray-900">$0.00</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Deposit Paid:</span>
              <span className="font-semibold">-${invoice.deposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Balance Paid:</span>
              <span className="font-semibold">-${invoice.balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-gray-300">
              <span className="font-bold text-gray-900">Total Paid:</span>
              <span className="font-bold text-green-600 text-xl">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
          <p className="text-green-800 font-semibold">✓ PAID IN FULL</p>
          <p className="text-sm text-green-700">Payment Method: {installationData.paymentMethod.toUpperCase().replace('_', ' ')}</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Invoice Template
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleSendInvoice}
          disabled={sending}
          className="py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-5 h-5 mr-3" />
          {sending ? 'Sending...' : 'Send Invoice to Customer'}
        </button>

        <button
          onClick={() => window.print()}
          className="py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg flex items-center justify-center"
        >
          <Download className="w-5 h-5 mr-3" />
          Download PDF
        </button>
      </div>
    </div>
  );
}
