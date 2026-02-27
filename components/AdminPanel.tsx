
import React from 'react';
import { User } from '../types';

interface AdminPanelProps {
  users: User[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  signupEnabled: boolean;
  onToggleSignup: (enabled: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, 
  onApprove, 
  onReject, 
  onDelete, 
  signupEnabled, 
  onToggleSignup 
}) => {
  const pending = users.filter(u => u.status === 'PENDING');
  const active = users.filter(u => u.status === 'APPROVED');

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Admin Dashboard</h2>
          <p className="text-slate-500 font-bold">Manage users and platform access controls.</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Public Signups</span>
            <span className={`text-xs font-bold ${signupEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {signupEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <button 
            onClick={() => onToggleSignup(!signupEnabled)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${signupEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${signupEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Users</span>
          <div className="text-5xl font-black mt-2">{users.length}</div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pending Approvals</span>
          <div className="text-5xl font-black mt-2 text-slate-900">{pending.length}</div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Licenses</span>
          <div className="text-5xl font-black mt-2 text-slate-900">{active.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">User Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Email</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">No registered users yet.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900">{u.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        u.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-slate-500 text-xs font-bold">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {u.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => onApprove(u.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-md shadow-blue-50"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => onReject(u.id)}
                              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => onDelete(u.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-all"
                          title="Delete User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
