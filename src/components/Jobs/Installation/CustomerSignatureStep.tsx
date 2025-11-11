import React, { useRef, useState, useEffect } from 'react';
import { CheckCircle, RotateCcw, PenTool } from 'lucide-react';
import { Job, Customer } from '../../../types';
import { supabase } from '../../../lib/supabase';

interface CustomerSignatureStepProps {
  job: Job;
  onComplete: (data: any) => void;
}

export function CustomerSignatureStep({ job, onComplete }: CustomerSignatureStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [satisfied, setSatisfied] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', job.customerId)
        .single();

      if (data) {
        setCustomer(data);
        setCustomerName(data.name || '');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleComplete = () => {
    if (!hasSignature) {
      alert('Please obtain customer signature');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (!satisfied) {
      alert('Please confirm customer is satisfied with the installation');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');

    onComplete({
      signature: signatureData,
      signedBy: customerName,
      signedAt: new Date().toISOString(),
      customerSatisfied: satisfied
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
          <PenTool className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Signature</h3>
          <p className="text-gray-600">Get customer confirmation of completed installation</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-800">
          <strong>Before getting signature:</strong> Ensure the customer is completely satisfied with the installation.
          Walk through the completed work and address any concerns.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter customer full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Signature *
          </label>
          <div className="relative border-2 border-gray-300 rounded-lg bg-white">
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-64 cursor-crosshair touch-none"
              style={{ touchAction: 'none' }}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-lg">Sign here</p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={clearSignature}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Signature
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={satisfied}
              onChange={(e) => setSatisfied(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded mt-0.5 mr-3"
            />
            <div>
              <p className="font-semibold text-blue-900">Customer Satisfaction Confirmation</p>
              <p className="text-sm text-blue-800 mt-1">
                The customer confirms they are satisfied with the installation and the work meets their expectations.
                All blinds have been installed correctly and are functioning properly.
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleComplete}
          disabled={!hasSignature || !customerName.trim() || !satisfied}
          className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <CheckCircle className="w-6 h-6 mr-3" />
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
