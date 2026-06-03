'use client';

import { RoleOption } from '@/types';

interface RoleSelectorProps {
  roles: RoleOption[];
  value: string;
  onChange: (value: string) => void;
}

export function RoleSelector({ roles, value, onChange }: RoleSelectorProps) {
  return (
    <label className="flex min-w-[230px] flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
      <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Role-based path</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm font-medium text-white outline-none"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id} className="bg-slate-900 text-white">
            {role.label}
          </option>
        ))}
      </select>
    </label>
  );
}
