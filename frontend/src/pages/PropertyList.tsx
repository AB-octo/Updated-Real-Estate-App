import React, { useEffect, useState } from 'react';
import api from '../api';
import type { Property } from '../types/property';
import PropertyDetailsModal from '../components/PropertyDetailsModal';

const PropertyList: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const fetchProperties = async (query = '') => {
        setLoading(true);
        try {
            const response = await api.get(`/api/properties/?search=${query}`);
            setProperties(response.data);
        } catch (error) {
            console.error("Error fetching properties", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProperties(search);
    };

    const handleViewDetails = (property: Property) => {
        setSelectedProperty(property);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero / Search Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-4">
                    <span className="block xl:inline">Find your dream</span>{' '}
                    <span className="block text-indigo-600 xl:inline">home today</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Discover a curated list of properties. Simple, transparent, and beautiful.
                </p>
                <div className="mt-10 max-w-xl mx-auto">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search by city, title, or price..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-full text-lg focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-full font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.length === 0 ? (
                        <p className="col-span-3 text-center text-gray-500 text-lg">No properties found matching your search.</p>
                    ) : (
                        properties.map((property) => (
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
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-indigo-600 shadow-sm">
                                        ${Number(property.price).toLocaleString()}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {property.location}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{property.description}</p>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Listed by <span className="text-gray-900">{property.owner}</span></span>
                                        <button
                                            onClick={() => handleViewDetails(property)}
                                            className="text-indigo-600 font-semibold text-sm hover:text-indigo-800"
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <PropertyDetailsModal
                isOpen={!!selectedProperty}
                onClose={() => setSelectedProperty(null)}
                property={selectedProperty}
            />
        </div>
    );
};

export default PropertyList;
