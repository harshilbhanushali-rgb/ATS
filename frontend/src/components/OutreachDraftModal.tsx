
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { Sparkles as SparklesIcon, Clipboard as ClipboardDocumentIcon, CheckCircle as CheckCircleIcon } from 'lucide-react';

interface OutreachDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  draftText: string | null;
  isLoading: boolean;
  error: string | null;
}

const OutreachDraftModal: React.FC<OutreachDraftModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  draftText,
  isLoading,
  error,
}) => {
  const [editedDraft, setEditedDraft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (draftText) {
      setEditedDraft(draftText);
    } else {
      setEditedDraft(''); // Clear if draft is null (e.g. on open before load)
    }
  }, [draftText]);

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(editedDraft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied status after 2s
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text. Please select and copy manually.');
    });
  }, [editedDraft]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI-Generated Outreach Draft for ${candidateName}`}
      size="3xl"
    >
      <div className="space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48">
            <SparklesIcon className="w-10 h-10 text-indigo-500 animate-pulse" />
            <p className="mt-3 text-gray-600">AI is crafting a personalized message...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              <strong className="font-semibold">Error:</strong> {error}
            </p>
          </div>
        )}
        {!isLoading && !error && draftText !== null && (
          <>
            <p className="text-sm text-gray-600">
              Review and edit the AI-generated draft below. You can then copy it to your clipboard.
            </p>
            <textarea
              value={editedDraft}
              onChange={(e) => setEditedDraft(e.target.value)}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="AI-generated draft will appear here..."
              aria-label="Editable outreach message draft"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCopyToClipboard}
                className={`flex items-center text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm transition-colors disabled:opacity-50
                            ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                disabled={!editedDraft}
              >
                {copied ? (
                    <>
                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                        Copied!
                    </>
                ) : (
                    <>
                        <ClipboardDocumentIcon className="w-4 h-4 mr-1.5" />
                        Copy to Clipboard
                    </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default OutreachDraftModal;
