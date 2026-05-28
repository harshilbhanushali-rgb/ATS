import React, { useMemo, useState } from 'react';
import { Candidate, CandidateStage, FunctionArea, Requisition } from '../../types';
import Card from '../Card';
import { downloadCSV } from './reportingUtils';

interface ApplicationsTabProps {
  allCandidates: Candidate[];
  requisitions: Requisition[];
}

type SortConfig = { key: string; direction: 'ascending' | 'descending' } | null;

const ITEMS_PER_PAGE = 8;

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ allCandidates, requisitions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [appSort, setAppSort] = useState<SortConfig>({ key: 'applyTimestamp', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);

  const candidateList = useMemo(() => allCandidates.map(c => {
    const req = requisitions.find(r => r.id === c.requisitionId);
    return {
      id: c.id, name: c.name, email: c.email, phone: c.phone || 'N/A',
      targetJob: req ? req.role : 'General Applicant',
      department: req ? req.function : FunctionArea.ENGINEERING,
      applyTimestamp: c.applicationDate || '2026-05-15T09:00:00Z',
      stage: c.stage, source: c.source
    };
  }), [allCandidates, requisitions]);

  const filtered = useMemo(() => candidateList.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || app.email.toLowerCase().includes(searchTerm.toLowerCase()) || app.targetJob.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (filterDept === 'all' || app.department === filterDept) && (filterStage === 'all' || app.stage === filterStage);
  }), [candidateList, searchTerm, filterDept, filterStage]);

  const sorted = useMemo(() => {
    if (!appSort) return filtered;
    return [...filtered].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const valA = a[appSort.key], valB = b[appSort.key];
      const cmp = typeof valA === 'string' ? (valA as string).localeCompare(valB as string) : (valA as number) - (valB as number);
      return appSort.direction === 'ascending' ? cmp : -cmp;
    });
  }, [filtered, appSort]);

  const paginated = useMemo(() => sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [sorted, currentPage]);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  const requestSort = (key: string) => {
    setAppSort(prev => ({ key, direction: prev?.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
  };

  const handleDownload = () => {
    const headers = ['Candidate Name', 'Target Job Name', 'Department', 'Email Address', 'Phone Number', 'Application Timestamp', 'Status', 'Source'];
    downloadCSV(sorted.map(r => ({
      'Candidate Name': r.name, 'Target Job Name': r.targetJob, 'Department': r.department,
      'Email Address': r.email, 'Phone Number': r.phone, 'Application Timestamp': r.applyTimestamp,
      'Status': r.stage, 'Source': r.source
    })) as Record<string, unknown>[], headers, 'all_candidate_applications_report.csv');
  };

  const clearFilters = () => { setSearchTerm(''); setFilterDept('all'); setFilterStage('all'); setCurrentPage(1); };

  return (
    <div className="space-y-6" id="candidate-applications-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 font-display">Candidate Applications Audit Journal</h2>
          <p className="text-xs text-slate-500">Comprehensive, searchable audit log of all incoming applications.</p>
        </div>
        <button onClick={handleDownload} className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-slate-900 transition-all text-white text-xs font-semibold rounded-xl gap-2 shadow-sm shrink-0 self-start md:self-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          <span>Download Audit List</span>
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-slate-400 mr-2 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input type="text" placeholder="Search name, email, target role..." className="bg-transparent text-sm text-slate-800 outline-none w-full font-medium" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex items-center px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm">
            <label htmlFor="dept-filter" className="text-slate-400 font-bold mr-2 text-xs">Department:</label>
            <select id="dept-filter" className="w-full bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs" value={filterDept} onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Departments</option>
              {Object.values(FunctionArea).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm">
            <label htmlFor="stage-filter" className="text-slate-400 font-bold mr-2 text-xs">Stage:</label>
            <select id="stage-filter" className="w-full bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs" value={filterStage} onChange={e => { setFilterStage(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Stages</option>
              {Object.values(CandidateStage).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {(searchTerm || filterDept !== 'all' || filterStage !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 select-none">
            <span className="text-xs text-slate-400 font-bold">Applied criteria:</span>
            {searchTerm && <span className="inline-flex items-center text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">Search: &quot;{searchTerm}&quot;</span>}
            {filterDept !== 'all' && <span className="inline-flex items-center text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">Dept: {filterDept}</span>}
            {filterStage !== 'all' && <span className="inline-flex items-center text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">Stage: {filterStage}</span>}
            <button onClick={clearFilters} className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors ml-1">Clear all filters</button>
          </div>
        )}
      </div>

      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {[{ key: 'name', label: 'Candidate Name' }, { key: null, label: 'Email Address' }, { key: null, label: 'Phone' }, { key: 'targetJob', label: 'Target Job Title' }, { key: null, label: 'Department' }, { key: 'applyTimestamp', label: 'Application Date' }, { key: null, label: 'Status' }].map(col => (
                  <th key={col.label} onClick={col.key ? () => requestSort(col.key!) : undefined}
                    className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.key ? 'cursor-pointer hover:bg-slate-100 group' : ''}`}>
                    {col.label}{col.key && <span className="ml-1 text-[9px] text-slate-400 group-hover:text-indigo-600">▲▼</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? paginated.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{row.phone}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{row.targetJob}</td>
                  <td className="px-6 py-4 text-sm text-slate-500"><span className="inline-flex text-[11px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md font-bold">{row.department}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(row.applyTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${row.stage === CandidateStage.REJECTED ? 'bg-rose-50 text-rose-700' : [CandidateStage.HIRED, CandidateStage.OFFER_ACCEPTED].includes(row.stage) ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>{row.stage}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm font-bold">No applications matched your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 select-none">
            <span className="text-xs text-slate-400 font-bold">Page {currentPage} of {totalPages} ({filtered.length} candidates)</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 text-xs">◀ Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 text-xs">Next ▶</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApplicationsTab;
