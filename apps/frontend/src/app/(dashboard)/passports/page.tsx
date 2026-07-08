'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePassports, useDeletePassport } from '@/lib/hooks/usePassports';
import { PassportStatusBadge } from '@/components/passport/PassportStatusBadge';
import { cn, formatDate } from '@/lib/utils';
import { PassportStatus, ChemistryType } from '@/lib/api/passports';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

const STATUS_OPTIONS: { value: PassportStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
];

const CHEMISTRY_OPTIONS: { value: ChemistryType | ''; label: string }[] = [
  { value: '', label: 'All Chemistries' },
  { value: 'NMC', label: 'NMC' },
  { value: 'LFP', label: 'LFP' },
  { value: 'NCA', label: 'NCA' },
  { value: 'LMO', label: 'LMO' },
  { value: 'LTO', label: 'LTO' },
  { value: 'OTHER', label: 'Other' },
];

export default function PassportsPage() {
  const router = useRouter();
  const deleteMutation = useDeletePassport();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PassportStatus | ''>('');
  const [chemistry, setChemistry] = useState<ChemistryType | ''>('');
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    console.log('handleDelete invoked with id:', id);
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this battery passport?')) {
      try {
        await deleteMutation.mutateAsync(id);
        setActiveMenuId(null);
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete battery passport.');
      }
    }
  };

  const { data, isLoading } = usePassports({
    search: search || undefined,
    status: status || undefined,
    chemistry: chemistry || undefined,
    page,
    limit: 10,
  });

  const passports = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Battery Passports</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total} passport{total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Link
          href="/passports/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create Passport
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Passport ID, Model, Serial..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as PassportStatus | ''); setPage(1); }}
              className="form-input pr-10 appearance-none min-w-[160px] cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          {/* Chemistry Filter */}
          <div className="relative">
            <select
              value={chemistry}
              onChange={(e) => { setChemistry(e.target.value as ChemistryType | ''); setPage(1); }}
              className="form-input pr-10 appearance-none min-w-[160px] cursor-pointer"
            >
              {CHEMISTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Passport ID</th>
                <th>Model</th>
                <th>Battery Type</th>
                <th>Chemistry</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Last Updated</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-20 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : passports.map((passport, idx) => (
                    <tr
                      key={passport.id}
                      className="cursor-pointer hover:bg-slate-800/10 transition-colors"
                      onClick={() => router.push(`/passports/${passport.id}`)}
                    >
                      <td>
                        <span className="font-mono text-emerald-400 text-xs font-semibold">
                          {passport.passportId}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-slate-200 font-medium text-sm">{passport.model}</p>
                          <p className="text-slate-500 text-xs font-mono">{passport.serialNumber}</p>
                        </div>
                      </td>
                      <td>
                        <span className="text-slate-300 text-sm">{passport.batteryType}</span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                          {passport.chemistry}
                        </span>
                      </td>
                      <td>
                        <PassportStatusBadge status={passport.status} />
                      </td>
                      <td>
                        <span className="text-slate-400 text-sm">{passport.createdByName || '—'}</span>
                      </td>
                      <td>
                        <span className="text-slate-400 text-xs">{formatDate(passport.updatedAt)}</span>
                      </td>
                      <td className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/passports/${passport.id}`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/passports/${passport.id}/edit`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === passport.id ? null : passport.id)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {activeMenuId === passport.id && (
                              <div className={cn(
                                "absolute right-0 w-40 glass-card rounded-lg shadow-glass overflow-hidden z-20",
                                idx >= passports.length - 2 ? "bottom-full mb-1" : "top-full mt-1"
                              )}>
                                <Link
                                  href={`/public-passport/${passport.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Public View
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(passport.id);
                                  }}
                                  disabled={deleteMutation.isPending}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!isLoading && passports.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No passports found</p>
              <p className="text-slate-600 text-sm mt-1">
                {search || status || chemistry
                  ? 'Try adjusting your search filters'
                  : 'Create your first battery passport to get started'}
              </p>
              {!search && !status && !chemistry && (
                <Link
                  href="/passports/new"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg btn-primary text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Create Passport
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/30">
            <p className="text-slate-500 text-xs">
              Showing {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
      )}
    </div>
  );
}
