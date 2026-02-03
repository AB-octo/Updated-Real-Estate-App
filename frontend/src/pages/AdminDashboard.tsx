import React, { useEffect, useState } from 'react';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import { useSearchParams } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const filter = (searchParams.get('tab') || 'all') as 'all' | 'pending' | 'approved';

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/properties/?admin=true');
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

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/api/properties/${id}/approve/`);
            setProperties(properties.map(p => p.id === id ? { ...p, is_approved: true } : p));
        } catch (error) {
            alert("Failed to approve property");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await api.post(`/api/properties/${id}/reject/`);
            setProperties(properties.map(p => p.id === id ? { ...p, is_approved: false } : p));
        } catch (error) {
            alert("Failed to reject property");
        }
    };

    const filteredProperties = properties.filter(p => {
        if (filter === 'pending') return !p.is_approved;
        if (filter === 'approved') return p.is_approved;
        return true;
    });

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Listings Management</h1>
                <p className="text-slate-400 mt-1">Review and moderate all property submissions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { label: 'Total Listings', value: properties.length, color: 'indigo' },
                    { label: 'Pending Approval', value: properties.filter(p => !p.is_approved).length, color: 'yellow' },
                    { label: 'Approved', value: properties.filter(p => p.is_approved).length, color: 'green' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-2 text-${stat.color === 'indigo' ? 'indigo-400' : stat.color + '-400'}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Information</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner / Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valuation</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Moderation Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">Accessing database...</td>
                            </tr>
                        ) : filteredProperties.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No matching entries found.</td>
                            </tr>
                        ) : (
                            filteredProperties.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {p.image ? (
                                                <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl ring-1 ring-slate-700">🏠</div>
                                            )}
                                            <div>
                                                <div className="font-bold text-white">{p.title}</div>
                                                <div className="text-xs text-slate-500">{p.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{p.owner}</div>
                                        <div className="text-xs text-slate-500">Regular Member</div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-mono">${Number(p.price).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.is_approved
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                            {p.is_approved ? 'Approved' : 'Pending Review'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        {!p.is_approved ? (
                                            <button
                                                onClick={() => handleApprove(p.id)}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
                                            >
                                                Approve
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReject(p.id)}
                                                className="text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                                            >
                                                Unlist
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
