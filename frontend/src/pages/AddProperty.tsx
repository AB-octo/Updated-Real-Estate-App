import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import ProcessingModal from '../components/ProcessingModal';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const AddProperty: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY" // Placeholder
    });

    const [images, setImages] = useState<File[]>([]);

    const [isVerifying, setIsVerifying] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            alert('Please upload at least one image.');
            return;
        }

        setIsVerifying(true);

        try {
            // 1. AI Image Verification
            const verifyData = new FormData();
            images.forEach(img => verifyData.append('files', img));

            const verifyResp = await api.post(`${import.meta.env.VITE_VERIFY_URL || 'http://localhost:8001'}/validate/`, verifyData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (verifyResp.data.status === 'REJECTED') {
                alert(`Image verification failed: ${verifyResp.data.message}`);
                setIsVerifying(false);
                return;
            }

            // 2. Submit to Backend
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('location', formData.location);
            if (formData.latitude) data.append('latitude', formData.latitude.toString());
            if (formData.longitude) data.append('longitude', formData.longitude.toString());
            images.forEach(img => data.append('images', img));

            await api.post('/api/properties/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Property added successfully! Waiting for admin approval.');
            navigate('/');
        } catch (error: any) {
            console.error("Error adding property", error);
            if (error.response) {
                alert(`Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to process property submission (Network/Unknown error).');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-indigo-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">List Your Property</h1>
                        <p className="text-indigo-100 mt-2">Fill in the details below to submit your property for review.</p>
                    </div>

                    <ProcessingModal isOpen={isVerifying} />

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700">Property Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="e.g. Modern Apartment in Downtown"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    placeholder="Describe the property..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    placeholder="e.g. New York, NY"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pin Location on Map</label>
                                <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : { lat: 40.7128, lng: -74.0060 }}
                                            zoom={10}
                                            onClick={(e: any) => {
                                                if (e.latLng) {
                                                    setFormData({
                                                        ...formData,
                                                        latitude: e.latLng.lat(),
                                                        longitude: e.latLng.lng()
                                                    });
                                                }
                                            }}
                                        >
                                            {formData.latitude && formData.longitude && (
                                                <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                                            )}
                                        </GoogleMap>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                            Loading Map...
                                        </div>
                                    )}
                                </div>
                                {formData.latitude && (
                                    <p className="mt-2 text-xs text-indigo-600 font-medium">
                                        Pinned: {formData.latitude.toFixed(4)}, {formData.longitude?.toFixed(4)}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Images</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {images.length > 0 ? (
                                                <div className="text-center">
                                                    <p className="text-sm text-green-600 font-semibold">{images.length} images selected</p>
                                                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{images.map(img => img.name).join(', ')}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                    </svg>
                                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (Select multiple)</p>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" multiple />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isVerifying}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition-all hover:scale-[1.02] ${isVerifying
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }`}
                            >
                                {isVerifying ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying Image...
                                    </div>
                                ) : 'Submit Property'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProperty;
