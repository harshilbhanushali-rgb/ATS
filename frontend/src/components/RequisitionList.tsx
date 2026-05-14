import React, { useEffect, useRef, useState } from 'react';
import { FunctionArea, Priority, Requisition, RequisitionStatus } from '../types';
import { RequisitionFilterParams } from '../services/crudApi';
import Card from './Card';

interface RequisitionListProps {
  requisitions: Requisition[];
  onEdit: (requisition: Requisition) => void;
  onFilterChange?: (params: RequisitionFilterParams) => void;
}

const RequisitionListItem: React.FC<{ requisition: Requisition; onEdit: (requisition: Requisition) => void; }> = ({ requisition, onEdit }) => {
  const getPriorityChipClass = (priority: Priority) => {
    switch (priority) {
      case Priority.P0: return 'bg-rose-50 text-rose-600 border-rose-100';
      case Priority.P1: return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusChipClass = (status: RequisitionStatus) => {
    switch (status) {
      case RequisitionStatus.OPEN: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case RequisitionStatus.OFFERED: return 'bg-purple-50 text-purple-600 border-purple-100';
      case RequisitionStatus.JOINED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case RequisitionStatus.HOLD: return 'bg-slate-100 text-slate-600 border-slate-200';
      case RequisitionStatus.CANCELLED: return 'bg-rose-50 text-rose-600 border-rose-100 opacity-80';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <Card className="group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-display tracking-tight">{requisition.role}</h3>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getPriorityChipClass(requisition.priority)}`}>
                    {requisition.priority}
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-400">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{requisition.id}</span>
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18" />
                    </svg>
                    {requisition.function}
                </span>
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {requisition.location}
                </span>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiring Manager</p>
                    <p className="text-sm font-semibold text-slate-700">{requisition.hiringManagerName}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recruiter</p>
                    <p className="text-sm font-semibold text-slate-700">{requisition.assignedRecruiterName}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hire Type</p>
                    <p className="text-sm font-semibold text-slate-700">{requisition.hireType}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</p>
                    <p className="text-sm font-bold text-indigo-600">{requisition.cost.amount.toLocaleString()} <span className="text-[10px] text-indigo-400">{requisition.cost.currency}</span></p>
                </div>
            </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:pl-6 lg:border-l border-slate-100 shrink-0">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm ${getStatusChipClass(requisition.reqStatus)}`}>
                {requisition.reqStatus}
            </span>
            <button
                onClick={() => onEdit(requisition)}
                className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/20"
            >
                Edit Details
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
            </button>
        </div>
      </div>
    </Card>
  );
};


const RequisitionList: React.FC<RequisitionListProps> = ({ requisitions, onEdit, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hmFilter, setHmFilter] = useState('');
  const [functionFilter, setFunctionFilter] = useState('');

  // Capture hiring managers from the first non-empty load so the dropdown stays stable while filtered
  const [allHiringManagers, setAllHiringManagers] = useState<string[]>([]);
  const managersSeeded = useRef(false);
  useEffect(() => {
    if (!managersSeeded.current && requisitions.length > 0) {
      managersSeeded.current = true;
      setAllHiringManagers(
        Array.from(new Set(requisitions.map((r) => r.hiringManagerName))).sort()
      );
    }
  }, [requisitions]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Propagate filter changes to parent for backend query
  useEffect(() => {
    onFilterChange?.({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      hiringManager: hmFilter || undefined,
      functionArea: functionFilter || undefined,
    });
  }, [debouncedSearch, statusFilter, hmFilter, functionFilter, onFilterChange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('');
    setHmFilter('');
    setFunctionFilter('');
  };

  const inputClass = "mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-inner-soft placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1";

  return (
    <div className="space-y-8">
      <Card className="!p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-end">
          <div className="lg:col-span-2">
            <label htmlFor="searchTerm" className={labelClass}>Search by Role or ID</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <input
                  type="text"
                  id="searchTerm"
                  placeholder="Enter role or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className={labelClass}>Status</label>
            <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
              <option value="">All Statuses</option>
              {Object.values(RequisitionStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hmFilter" className={labelClass}>Hiring Manager</label>
            <select id="hmFilter" value={hmFilter} onChange={(e) => setHmFilter(e.target.value)} className={inputClass}>
              <option value="">All HMs</option>
              {allHiringManagers.map(hm => (
                <option key={hm} value={hm}>{hm}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-grow">
                <label htmlFor="functionFilter" className={labelClass}>Function Area</label>
                <select id="functionFilter" value={functionFilter} onChange={(e) => setFunctionFilter(e.target.value)} className={inputClass}>
                  <option value="">All Functions</option>
                  {Object.values(FunctionArea).map(func => (
                    <option key={func} value={func}>{func}</option>
                  ))}
                </select>
            </div>
            <button
                onClick={handleClearFilters}
                className="shrink-0 mt-5 p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                title="Clear all filters"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                </svg>
            </button>
          </div>
        </div>
      </Card>

      {requisitions.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-12 text-lg">
            {!debouncedSearch && !statusFilter && !hmFilter && !functionFilter
              ? 'No requisitions found. Start by creating one!'
              : 'No requisitions match your current filters.'}
          </p>
        </Card>
      ) : (
        requisitions.map(req => (
          <RequisitionListItem key={req.id} requisition={req} onEdit={onEdit} />
        ))
      )}
    </div>
  );
};

export default RequisitionList;
