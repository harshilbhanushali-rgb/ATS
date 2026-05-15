import React, { useState } from 'react';
import { InterviewScorecardTemplate } from '../types';
import Card from './Card';
import { Plus as PlusIcon, Trash2 as TrashIcon, Pencil as PencilIcon } from 'lucide-react';

interface ScorecardTemplateBuilderProps {
  templates: InterviewScorecardTemplate[];
  onSave: (template: InterviewScorecardTemplate) => void;
}

const emptyTemplateState = {
  name: '',
  competencies: [{ id: `COMP-NEW-${Date.now()}`, name: '', description: '' }],
};

const ScorecardTemplateBuilder: React.FC<ScorecardTemplateBuilderProps> = ({ templates, onSave }) => {
  const [editingTemplate, setEditingTemplate] = useState<Partial<InterviewScorecardTemplate> | null>(null);
  const [formData, setFormData] = useState(emptyTemplateState);

  const handleStartEditing = (template: InterviewScorecardTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      competencies: [...template.competencies],
    });
  };

  const handleStartNew = () => {
    setEditingTemplate(null);
    setFormData(emptyTemplateState);
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setFormData(emptyTemplateState);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompetencyChange = (index: number, field: 'name' | 'description', value: string) => {
    const updatedCompetencies = [...formData.competencies];
    updatedCompetencies[index] = { ...updatedCompetencies[index], [field]: value };
    setFormData(prev => ({ ...prev, competencies: updatedCompetencies }));
  };

  const addCompetency = () => {
    setFormData(prev => ({
      ...prev,
      competencies: [...prev.competencies, { id: `COMP-NEW-${Date.now()}`, name: '', description: '' }],
    }));
  };

  const removeCompetency = (index: number) => {
    if (formData.competencies.length <= 1) {
      alert('A scorecard must have at least one competency.');
      return;
    }
    const updatedCompetencies = formData.competencies.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, competencies: updatedCompetencies }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Template name is required.');
      return;
    }
    if (formData.competencies.some(c => !c.name.trim())) {
      alert('All competency names are required.');
      return;
    }

    const templateToSave: InterviewScorecardTemplate = {
      id: editingTemplate?.id || `SCT-${Date.now().toString().slice(-7)}`,
      name: formData.name.trim(),
      competencies: formData.competencies.map(c => ({ ...c, name: c.name.trim(), description: c.description.trim() })),
      createdDate: editingTemplate?.createdDate || new Date().toISOString(),
    };

    onSave(templateToSave);
    handleCancel(); // Reset form after saving
  };

  const inputClass = "mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 sm:text-sm transition-all";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Scorecard Templates">
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {templates.map(template => (
              <li key={template.id} className="p-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 flex justify-between items-center transition-colors">
                <div>
                  <p className="font-medium text-blue-600">{template.name}</p>
                  <p className="text-xs text-slate-400">{template.competencies.length} competencies</p>
                </div>
                <button
                  onClick={() => handleStartEditing(template)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  aria-label={`Edit ${template.name}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={handleStartNew} className="w-full mt-4 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm transition-colors">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Template
          </button>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card title={editingTemplate ? `Editing: ${editingTemplate.name}` : 'Create New Scorecard Template'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className={labelClass}>Template Name <span className="text-red-500">*</span></label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} className={inputClass} required />
            </div>

            <div>
              <h3 className="text-md font-medium text-slate-700 mb-2">Competencies</h3>
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                {formData.competencies.map((comp, index) => (
                  <div key={index} className="p-3 border border-slate-200 rounded-xl bg-slate-50 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Competency Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => handleCompetencyChange(index, 'name', e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Description / What to look for</label>
                        <input
                          type="text"
                          value={comp.description}
                          onChange={(e) => handleCompetencyChange(index, 'description', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                     <button
                        type="button"
                        onClick={() => removeCompetency(index)}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                        aria-label={`Remove competency ${index + 1}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addCompetency}
                className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-1" /> Add Competency
              </button>
            </div>

            <div className="pt-5 border-t border-slate-200 flex justify-end space-x-3">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
                {editingTemplate ? 'Update Template' : 'Save Template'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ScorecardTemplateBuilder;
