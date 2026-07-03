
import React, { useState, useEffect } from 'react';
import { TalentPool } from '../../types';

interface TalentPoolFormProps {
  onSubmit: (pool: TalentPool) => void;
  initialData?: TalentPool | null;
  onClose: () => void;
}

const emptyPoolState = {
  name: '',
  description: '',
  tagsString: '', // For comma-separated input
};

const TalentPoolForm: React.FC<TalentPoolFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [formData, setFormData] = useState(emptyPoolState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        tagsString: (initialData.tags || []).join(', '),
      });
    } else {
      setFormData(emptyPoolState);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Talent Pool name is required.");
      return;
    }

    const tagsArray = formData.tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const poolToSubmit: Omit<TalentPool, 'id' | 'createdDate'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    };
    
    const finalPool: TalentPool = {
        ...poolToSubmit,
        id: initialData?.id || `TP-${Date.now().toString().slice(-7)}`,
        createdDate: initialData?.createdDate || new Date().toISOString().split('T')[0],
    };

    onSubmit(finalPool);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 sm:text-sm placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest";
  const requiredSpan = <span className="text-red-500">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className={labelClass}>Pool Name {requiredSpan}</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} placeholder="Describe the purpose or focus of this talent pool."/>
      </div>
      <div>
        <label htmlFor="tagsString" className={labelClass}>Tags (comma-separated)</label>
        <input type="text" name="tagsString" id="tagsString" value={formData.tagsString} onChange={handleChange} className={inputClass} placeholder="e.g., Engineering, Frontend, React, Senior" />
        <p className="text-xs text-slate-500 mt-1">Tags help in organizing and searching pools. Separate with commas.</p>
      </div>

      <div className="pt-5 border-t border-slate-100 mt-8">
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
            {initialData ? 'Update Pool' : 'Create Pool'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TalentPoolForm;
