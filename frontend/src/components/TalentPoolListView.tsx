
import React from 'react';
import Card from './Card';
import { Pencil as PencilIcon, Users as UsersIcon } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useModalState } from '../contexts/ModalStateContext';

const TalentPoolListView: React.FC = () => {
  const { talentPools, candidates: allCandidates } = useAppData();
  const { openTalentPoolFormModal, openAddCandidateToPoolModal } = useModalState();

  const getCandidateCountForPool = (poolId: string): number => {
    return allCandidates.filter(c => c.talentPoolIds?.includes(poolId)).length;
  };

  if (talentPools.length === 0) {
    return (
        <Card title="Talent Pools">
            <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Talent Pools Created Yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first talent pool to nurture candidates.
                </p>
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => openTalentPoolFormModal()}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Create New Talent Pool
                    </button>
                </div>
            </div>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
       <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold leading-6 text-gray-900 sm:truncate">Talent Pools</h1>
        <p className="mt-2 text-sm text-gray-500">Organize and nurture promising candidates for future opportunities.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talentPools.map(pool => (
          <Card key={pool.id} className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
            <div className="p-5 flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-teal-700">{pool.name}</h3>
                <span className="text-xs text-gray-400">ID: {pool.id}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 mb-3 min-h-[40px]">{pool.description || 'No description provided.'}</p>
              
              {pool.tags && pool.tags.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 mr-2">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pool.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Created: {new Date(pool.createdDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                Candidates in Pool: <span className="text-teal-600 font-bold">{getCandidateCountForPool(pool.id)}</span>
              </p>
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex justify-end space-x-2">
              <button
                onClick={() => openTalentPoolFormModal(pool)}
                className="flex items-center text-xs text-yellow-600 hover:text-yellow-800 font-medium py-1 px-2 rounded-md hover:bg-yellow-50 transition-colors"
                title="Edit Pool Details"
              >
                <PencilIcon className="w-3.5 h-3.5 mr-1" /> Edit Pool
              </button>
              <button
                onClick={() => openAddCandidateToPoolModal(pool)}
                className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded-md hover:bg-indigo-50 transition-colors"
                title="Manage Candidates in this Pool"
              >
                <UsersIcon className="w-4 h-4 mr-1" /> Manage Candidates
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TalentPoolListView;
