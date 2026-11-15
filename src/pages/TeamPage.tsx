// ==============================================================================
// APNI ESTATE INTERIORS - TEAM & STAFF MANAGEMENT PAGE
// Multi-tenant staff directory and role assignment.
// Safe client architecture: No service_role key, real organization RLS.
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, StaffMember } from '../types';
import { formatDate } from '../utils/formatters';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles, 
  Info,
  Building2,
  Crown,
  CheckCircle2,
  Palette,
  HardHat
} from 'lucide-react';
import { teamService } from '../services/teamService';

const ROLE_DISPLAY: Record<UserRole, { title: string; badge: string; icon: any }> = {
  owner: { title: 'Owner', badge: 'bg-amber-50 text-amber-800 border-amber-200', icon: Crown },
  admin: { title: 'Admin', badge: 'bg-purple-50 text-purple-800 border-purple-200', icon: ShieldCheck },
  designer: { title: 'Designer', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Palette },
  supervisor: { title: 'Supervisor', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: HardHat },
  member: { title: 'Staff', badge: 'bg-slate-50 text-slate-800 border-slate-200', icon: Users }
};

export const TeamPage: React.FC = () => {
  const { teamMembers, updateMemberRole } = useApp();
  const { profile, organization, isDemoMode, user } = useAuth();

  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  const isOwner = profile?.role === 'owner' || isDemoMode;

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    if (newRole === 'owner') {
      alert('Primary Owner role cannot be reassigned through this panel.');
      return;
    }
    setRoleUpdatingId(memberId);
    try {
      await updateMemberRole(memberId, newRole);
    } catch (err: any) {
      alert(err.message || 'Failed to update member role.');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const adminOrOwnerCount = teamMembers.filter((m) => m.role === 'owner' || m.role === 'admin').length;
  const activeCount = teamMembers.filter((m) => m.status === 'Active' || !m.status).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Architectural Header & Staff Summary */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
            Studio Team
          </h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {teamMembers.length} members
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Members</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
            <p className="text-lg font-bold text-[#111827] tabular-nums mt-1">{teamMembers.length}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Admins</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
            <p className="text-lg font-bold text-[#1D4ED8] tabular-nums mt-1">{adminOrOwnerCount}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-lg font-bold text-emerald-700 tabular-nums mt-1">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((member) => {
          const roleKey = (member.role in ROLE_DISPLAY) ? (member.role as UserRole) : 'member';
          const roleInfo = ROLE_DISPLAY[roleKey];
          const RoleIcon = roleInfo.icon;
          const isCurrentUser = member.id === profile?.id || member.id === user?.id;
          const isTargetOwner = member.role === 'owner';
          const initials = (member.full_name || 'TM')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || '')
            .join('');

          return (
            <div
              key={member.id}
              className={`bg-white p-5 rounded-2xl border transition-colors flex flex-col justify-between ${
                isCurrentUser ? 'border-[#1D4ED8]' : 'border-[#E5E7EB] hover:border-[#CBD5E1]'
              }`}
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-11 h-11 rounded-xl object-cover border border-[#E5E7EB] shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                        {initials || 'TM'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{member.full_name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                            You
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Member since {member.created_at ? formatDate(member.created_at) : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Badge / Role Selector */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Studio Role
                  </label>
                  {isOwner && !isCurrentUser && !isTargetOwner ? (
                    <div className="relative">
                      <select
                        value={member.role}
                        disabled={roleUpdatingId === member.id}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                        className={`w-full px-3 py-1.5 text-xs font-bold rounded-xl border focus:outline-none transition-colors ${roleInfo.badge}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="designer">Designer</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="member">Staff</option>
                      </select>
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${roleInfo.badge}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span>{roleInfo.title}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Active Workspace</span>
                </span>
                <span>Role: {member.role}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
