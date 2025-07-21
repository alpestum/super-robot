
import React from 'react';
import { VillaInputs, InputKeys } from '../types';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface VillaInfoFormProps {
  inputs: VillaInputs;
  onInputChange: (field: InputKeys, value: string | number | boolean) => void;
}

const VillaInfoForm: React.FC<VillaInfoFormProps> = ({ inputs, onInputChange }) => {
  const handleTextOrDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onInputChange(name as InputKeys, value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (e.g., JPG, PNG, GIF, WebP).');
        e.target.value = ''; // Reset file input
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          onInputChange('imageUrl', loadEvent.target.result as string);
        } else {
          alert('Failed to read image. Please try again.');
        }
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        e.target.value = ''; // Reset file input
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user cancels dialog), clear current image
      onInputChange('imageUrl', ''); 
    }
  };

  return (
    <Card title="Villa Information" className="mb-6">
      <Input
        label="Villa Title / Name"
        id="title"
        name="title"
        type="text"
        value={inputs.title}
        onChange={handleTextOrDescriptionChange}
        placeholder="e.g., Sunset Paradise Villa"
      />
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
          Short Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={inputs.description}
          onChange={handleTextOrDescriptionChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900"
          placeholder="e.g., A beautiful 3-bedroom villa with ocean views."
        />
      </div>
      <div className="mb-4">
        <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Villa Image
        </label>
        <input
          id="imageUpload"
          name="imageUpload"
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleImageUpload}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        />
         {inputs.imageUrl && (
            <p className="mt-1 text-xs text-gray-500">
                Current image: {inputs.imageUrl.startsWith('data:image') ? 'Uploaded image' : inputs.imageUrl.substring(0,30) + '...'}
            </p>
        )}
      </div>

      {inputs.imageUrl && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={inputs.imageUrl} 
            alt="Villa Preview" 
            className="w-full h-auto max-h-64 object-cover"
            onError={(e) => {
              // If a data URL fails, it's a real issue with the data. Clear it or show broken.
              // For simplicity, we can let it show the browser's default broken image icon.
              // Optionally, clear the imageUrl state: onInputChange('imageUrl', '');
              console.error("Error loading image preview from data URL.");
              (e.currentTarget as HTMLImageElement).style.display = 'none'; // Hide broken image
               // Or show a placeholder: e.currentTarget.src = 'path/to/placeholder.png'; 
            }}
          />
        </div>
      )}
    </Card>
  );
};

export default VillaInfoForm;