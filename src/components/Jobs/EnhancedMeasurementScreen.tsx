import React, { useState, useRef } from 'react';
import { Plus, Ruler, Save, ArrowRight, Trash2, Edit, X, Copy, Camera, Image, CheckCircle } from 'lucide-react';
import { Job, JobMeasurement } from '../../types';

interface EnhancedMeasurementScreenProps {
  job: Job;
  onComplete: (data: { measurements: JobMeasurement[]; convertToInstallation: boolean }) => void;
}

export function EnhancedMeasurementScreen({ job, onComplete }: EnhancedMeasurementScreenProps) {
  const [measurements, setMeasurements] = useState<JobMeasurement[]>(job.measurements || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [measurementPhotos, setMeasurementPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [convertToInstallation, setConvertToInstallation] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [newMeasurement, setNewMeasurement] = useState({
    windowId: '',
    width: '',
    height: '',
    notes: '',
    location: '',
    controlType: 'none' as 'chain-cord' | 'wand' | 'none',
    bracketType: 'top-fix' as 'top-fix' | 'face-fix'
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
      setMeasurementPhotos([...measurementPhotos, photoUrl]);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          uploadedUrls.push(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setMeasurementPhotos([...measurementPhotos, ...uploadedUrls]);
  };

  const removePhoto = (index: number) => {
    setMeasurementPhotos(measurementPhotos.filter((_, i) => i !== index));
  };

  const handleAddMeasurement = () => {
    if (!newMeasurement.windowId || !newMeasurement.width || !newMeasurement.height) {
      alert('Please fill in Window ID, Width, and Height');
      return;
    }

    const measurement: JobMeasurement = {
      id: `measurement-${Date.now()}`,
      windowId: newMeasurement.windowId,
      width: parseFloat(newMeasurement.width),
      height: parseFloat(newMeasurement.height),
      notes: newMeasurement.notes,
      location: newMeasurement.location,
      controlType: newMeasurement.controlType,
      bracketType: newMeasurement.bracketType,
      photos: measurementPhotos,
      createdAt: new Date().toISOString()
    };

    setMeasurements(prev => [...prev, measurement]);
    setNewMeasurement({
      windowId: '',
      width: '',
      height: '',
      notes: '',
      location: '',
      controlType: 'none',
      bracketType: 'top-fix'
    });
    setMeasurementPhotos([]);
  };

  const handleDuplicateMeasurement = (measurement: JobMeasurement) => {
    const duplicated: JobMeasurement = {
      ...measurement,
      id: `measurement-${Date.now()}`,
      windowId: `${measurement.windowId}-copy`,
      createdAt: new Date().toISOString()
    };
    setMeasurements(prev => [...prev, duplicated]);
  };

  const handleDeleteMeasurement = (id: string) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      setMeasurements(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleEditMeasurement = (measurement: JobMeasurement) => {
    setEditingId(measurement.id);
    setNewMeasurement({
      windowId: measurement.windowId,
      width: measurement.width.toString(),
      height: measurement.height.toString(),
      notes: measurement.notes || '',
      location: measurement.location || '',
      controlType: measurement.controlType || 'none',
      bracketType: measurement.bracketType || 'top-fix'
    });
    setMeasurementPhotos(measurement.photos || []);
  };

  const handleUpdateMeasurement = () => {
    if (!newMeasurement.windowId || !newMeasurement.width || !newMeasurement.height) {
      alert('Please fill in all required fields');
      return;
    }

    setMeasurements(prev => prev.map(m =>
      m.id === editingId ? {
        ...m,
        windowId: newMeasurement.windowId,
        width: parseFloat(newMeasurement.width),
        height: parseFloat(newMeasurement.height),
        notes: newMeasurement.notes,
        location: newMeasurement.location,
        controlType: newMeasurement.controlType,
        bracketType: newMeasurement.bracketType,
        photos: measurementPhotos
      } : m
    ));

    setEditingId(null);
    setNewMeasurement({
      windowId: '',
      width: '',
      height: '',
      notes: '',
      location: '',
      controlType: 'none',
      bracketType: 'top-fix'
    });
    setMeasurementPhotos([]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewMeasurement({
      windowId: '',
      width: '',
      height: '',
      notes: '',
      location: '',
      controlType: 'none',
      bracketType: 'top-fix'
    });
    setMeasurementPhotos([]);
  };

  const handleComplete = () => {
    if (measurements.length === 0) {
      alert('Please add at least one measurement');
      return;
    }
    onComplete({ measurements, convertToInstallation });
  };

  if (showCamera) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Take Measurement Photo</h3>
          <p className="text-gray-600">Capture the window for reference</p>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={capturePhoto}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
          >
            <Camera className="w-5 h-5 mr-2" />
            Capture Photo
          </button>
          <button
            onClick={stopCamera}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Window Measurements</h3>
        <p className="text-gray-600">Take accurate measurements for each window with photos</p>
      </div>

      {/* Selected Products Reference */}
      {job.selectedProducts && job.selectedProducts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Selected Products for Installation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {job.selectedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                  </div>
                  <p className="font-semibold text-green-600">${(product.price * product.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Take measurements for {job.selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} window{job.selectedProducts.reduce((sum, p) => sum + p.quantity, 0) !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Add/Edit Measurement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-blue-900">{editingId ? 'Edit Measurement' : 'Add New Measurement'}</h4>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Window ID *
            </label>
            <input
              type="text"
              value={newMeasurement.windowId}
              onChange={(e) => setNewMeasurement({...newMeasurement, windowId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="W1, W2, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={newMeasurement.width}
              onChange={(e) => setNewMeasurement({...newMeasurement, width: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="120.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={newMeasurement.height}
              onChange={(e) => setNewMeasurement({...newMeasurement, height: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="150.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={newMeasurement.location}
              onChange={(e) => setNewMeasurement({...newMeasurement, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Living room, bedroom, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control Type
            </label>
            <select
              value={newMeasurement.controlType}
              onChange={(e) => setNewMeasurement({...newMeasurement, controlType: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">None</option>
              <option value="chain-cord">Chain & Cord Control</option>
              <option value="wand">Wand Control</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bracket Type
            </label>
            <select
              value={newMeasurement.bracketType}
              onChange={(e) => setNewMeasurement({...newMeasurement, bracketType: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="top-fix">T - Top Fix</option>
              <option value="face-fix">F - Face Fix</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={newMeasurement.notes}
              onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Special requirements, obstacles, etc."
            />
          </div>
        </div>

        {/* Photo Capture Section */}
        <div className="border-t border-blue-200 pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Measurement Photos (Optional)
          </label>
          <div className="flex gap-3 mb-4">
            <button
              onClick={startCamera}
              type="button"
              className="flex items-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="flex items-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <Image className="w-5 h-5 mr-2" />
              Upload from Gallery
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {measurementPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {measurementPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Measurement ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={editingId ? handleUpdateMeasurement : handleAddMeasurement}
            type="button"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingId ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Measurement
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Measurement
              </>
            )}
          </button>
        </div>
      </div>

      {/* Measurements List */}
      {measurements.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Recorded Measurements ({measurements.length})</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {measurements.map(measurement => (
              <div key={measurement.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {measurement.location && (
                      <p className="text-lg font-bold text-gray-900 mb-2">{measurement.location}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Window ID</p>
                        <p className="font-semibold text-gray-900">{measurement.windowId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Width</p>
                        <p className="font-semibold text-gray-900">{measurement.width} cm</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Height</p>
                        <p className="font-semibold text-gray-900">{measurement.height} cm</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Controls</p>
                        <p className="font-semibold text-gray-900 capitalize">{measurement.controlType?.replace('-', ' ')}</p>
                      </div>
                    </div>
                    {measurement.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Notes:</span> {measurement.notes}
                      </p>
                    )}
                    {measurement.photos && measurement.photos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Photos ({measurement.photos.length})</p>
                        <div className="flex gap-2 overflow-x-auto">
                          {measurement.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Window ${measurement.windowId} - ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditMeasurement(measurement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateMeasurement(measurement)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeasurement(measurement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Convert to Installation Option */}
      {measurements.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={convertToInstallation}
              onChange={(e) => setConvertToInstallation(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded mt-0.5 mr-3"
            />
            <div>
              <p className="font-semibold text-green-900">Auto-create Installation Job</p>
              <p className="text-sm text-green-800 mt-1">
                When you complete these measurements, an installation job will be automatically created with all measurement details. This saves time and ensures continuity between measurement and installation appointments.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Complete Button */}
      {measurements.length > 0 && (
        <button
          onClick={handleComplete}
          className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center"
        >
          <CheckCircle className="w-6 h-6 mr-3" />
          Complete Measurements
        </button>
      )}
    </div>
  );
}
