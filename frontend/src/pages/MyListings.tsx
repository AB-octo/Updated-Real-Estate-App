import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Property } from '../types/property';

const MyListings: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyProperties = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/properties/?mine=true');
            setProperties(response.data);
        } catch (error) {
            console.error("Error fetching my properties", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProperties();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                    <p className="text-gray-500 mt-2">Manage and track your published properties.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.length === 0 ? (
                        <div className="col-span-3 text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-4xl block mb-4">📭</span>
                            <p className="text-gray-500 text-lg">You haven't listed any properties yet.</p>
                        </div>
                    ) : (
                        properties.map((property: any) => (
                            <div key={property.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                                <div className="relative h-64 overflow-hidden bg-gray-200">
                                    {property.image ? (
                                        <img
                                            src={property.image}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                            <span className="text-4xl">🏠</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${property.is_approved
                                                ? 'bg-green-100/90 text-green-700'
                                                : 'bg-yellow-100/90 text-yellow-700'
                                            }`}>
                                            {property.is_approved ? '✓ Approved' : '⌛ Pending'}
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm">
                                            ${Number(property.price).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{property.description}</p>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">Added on {new Date(property.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MyListings;
