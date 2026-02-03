import React from 'react';

const PropertyDetailsModal = ({ isOpen, onClose, property, onApprove, onReject }) => {
    if (!isOpen || !property) return null;

    // Combine main image and gallery images into one list
    const allImages = [
        ...(property.image ? [{ id: 'main', image: property.image }] : []),
        ...(property.images || [])
    ];

    return (
        <div className="fixed inset-0 z-[1000] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-100">

                    {/* Header with Close Button */}
                    <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                        <button
                            type="button"
                            className="rounded-full bg-white/10 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left Column: Image Gallery */}
                            <div className="bg-gray-50 p-6 md:p-8 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                                {allImages.length > 0 ? (
                                    <>
                                        {/* Main Large Image */}
                                        <div className="aspect-w-16 aspect-h-12 w-full overflow-hidden rounded-xl shadow-md ring-1 ring-gray-200">
                                            <img
                                                src={allImages[0].image}
                                                alt={property.title}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>

                                        {/* Grid of other images */}
                                        {allImages.length > 1 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {allImages.slice(1).map((img, idx) => (
                                                    <div key={idx} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-200">
                                                        <img
                                                            src={img.image}
                                                            alt=""
                                                            className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity cursor-pointer"
                                                            onClick={() => window.open(img.image, '_blank')}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                        <div className="text-center">
                                            <span className="text-4xl">🏠</span>
                                            <p className="mt-2 text-sm">No images available</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Details */}
                            <div className="flex flex-col p-6 md:p-8">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${property.is_approved
                                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                                            : property.is_rejected
                                                ? 'bg-red-50 text-red-700 ring-red-600/20'
                                                : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                            }`}>
                                            {property.is_approved ? 'Approved' : property.is_rejected ? 'Rejected' : 'Pending Review'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ID: #{property.id}
                                        </span>
                                    </div>

                                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                        {property.title}
                                    </h2>

                                    <p className="mt-2 text-xl font-semibold text-indigo-600">
                                        ${Number(property.price).toLocaleString()}
                                    </p>

                                    <div className="mt-6 flex items-center gap-2 text-gray-600">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        <span>{property.location}</span>
                                        {property.latitude && property.longitude && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-indigo-500 hover:text-indigo-600 underline"
                                            >
                                                (View on Map)
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-sm font-medium text-gray-900">Description</h3>
                                        <div className="mt-2 prose prose-sm text-gray-500 max-w-none">
                                            <p className="whitespace-pre-line">{property.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 border-t border-gray-100 pt-6">
                                        <h3 className="text-sm font-medium text-gray-900">Owner Details</h3>
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {property.owner ? property.owner[0].toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.owner}</p>
                                                <p className="text-xs text-gray-500">Registered member</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100 items-center justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>

                                    {onApprove && onReject && !property.is_approved && (
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={() => {
                                                onApprove(property.id);
                                                onClose();
                                            }}
                                        >
                                            Approve Listing
                                        </button>
                                    )}

                                    {onApprove && onReject && property.is_approved && (
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm font-bold text-red-600 shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            onClick={() => {
                                                onReject(property.id);
                                                onClose();
                                            }}
                                        >
                                            Reject / Unlist
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsModal;
