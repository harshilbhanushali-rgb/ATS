import React, { useMemo, useState } from 'react';
import { Candidate, TalentPool } from '../../types';
import { Search as SearchIcon } from 'lucide-react';

interface AddExistingCandidateFormProps {
  pool: TalentPool;
  candidates: Candidate[];
  onAdd: (candidateId: string, poolId: string) => void;
  onClose: () => void;
}

const AddExistingCandidateForm: React.FC<AddExistingCandidateFormProps> = ({ pool, candidates, onAdd, onClose }) => {
  const [search, setSearch] = useState('');

  const availableCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return candidates
      .filter((c) => !(c.talentPoolIds || []).includes(pool.id))
      .filter((c) => !term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term))
      .slice(0, 50);
  }, [candidates, pool.id, search]);

  const handleAdd = (candidateId: string) => {
    onAdd(candidateId, pool.id);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidates by name or email..."
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 sm:text-sm"
          autoFocus
        />
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
        {availableCandidates.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6">No matching candidates found.</p>
        ) : (
          availableCandidates.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                <p className="text-xs text-slate-400 truncate">{c.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(c.id)}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
              >
                Add
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AddExistingCandidateForm;
