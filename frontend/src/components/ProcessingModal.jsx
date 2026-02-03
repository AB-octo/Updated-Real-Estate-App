import React from 'react';

const ProcessingModal = ({
    isOpen,
    title = "Processing...",
    message = "Please wait while we verify and upload your property."
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl">🏠</span>
                        </div>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-500">{message}</p>
            </div>
        </div>
    );
};

export default ProcessingModal;
