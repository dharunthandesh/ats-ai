import React, { useState, useEffect } from 'react';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ShieldCheck, UserCheck, Shield, Mail } from 'lucide-react';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await authApi.listUsers();
      setUsers(res.data || []);
    } catch (err) {
      error(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authApi.updateUser(userId, { role: newRole });
      success('User role updated');
      loadUsers();
    } catch (err) {
      error(err.message);
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await authApi.updateUser(userId, { isActive: !currentActive });
      success(`User account ${!currentActive ? 'activated' : 'deactivated'}`);
      loadUsers();
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          User & RBAC Role Governance
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage system team members, assign role permissions, and control active credentials.
        </p>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Department & Title</th>
                <th className="px-6 py-4">Role Permission</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const roleColors = {
                  HR_ADMIN: 'purple',
                  RECRUITER: 'indigo',
                  INTERVIEWER: 'blue',
                };

                const isSelf = u._id === currentUser?.id;

                return (
                  <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">
                            {u.name} {isSelf && <span className="text-xs text-indigo-400">(You)</span>}
                          </p>
                          <p className="text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-slate-200 font-medium">{u.department}</p>
                      <p className="text-slate-500">{u.title || 'Staff'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-50"
                      >
                        <option value="HR_ADMIN">HR Administrator</option>
                        <option value="RECRUITER">Recruiter</option>
                        <option value="INTERVIEWER">Technical Interviewer</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'emerald' : 'rose'} size="xs">
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleActive(u._id, u.isActive)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            u.isActive
                              ? 'border-rose-800/60 text-rose-400 hover:bg-rose-950/40'
                              : 'border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
