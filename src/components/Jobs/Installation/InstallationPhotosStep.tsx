import React, { useState, useRef } from 'react';
import { Camera, Image, Trash2, Upload, CheckCircle } from 'lucide-react';
import { Job } from '../../../types';
import { supabase } from '../../../lib/supabase';

interface InstallationPhotosStepProps {
  job: Job;
  existingPhotos: string[];
  onComplete: (data: any) => void;
}

export function InstallationPhotosStep({ job, existingPhotos, onComplete }: InstallationPhotosStepProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
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

      setPhotos([...photos, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

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
      setPhotos([...photos, photoUrl]);
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

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (photos.length === 0) {
      alert('Please take at least one photo of the completed installation');
      return;
    }

    onComplete({
      photos,
      photosUploadedAt: new Date().toISOString()
    });
  };

  if (showCamera) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Take Installation Photo</h3>
          <p className="text-gray-600">Position the camera to capture the installed blind</p>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
          <Camera className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Installation Photos</h3>
          <p className="text-gray-600">Take photos of the completed installation</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Photo Guidelines:</strong> Take clear photos showing the installed blinds from different angles.
          Include close-ups of mounting hardware and overall room shots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={startCamera}
          className="flex items-center justify-center px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
        >
          <Camera className="w-5 h-5 mr-3" />
          Take Photo with Camera
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
        >
          <Upload className="w-5 h-5 mr-3" />
          {uploading ? 'Uploading...' : 'Upload from Gallery'}
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

      {photos.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Captured Photos ({photos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Installation ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mb-6">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No photos taken yet</p>
          <p className="text-sm text-gray-500">Take photos to document the installation</p>
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={photos.length === 0}
        className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <CheckCircle className="w-6 h-6 mr-3" />
        Continue to Customer Signature
      </button>
    </div>
  );
}
