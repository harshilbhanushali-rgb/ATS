import React from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import Modal from './Modal';

interface ResumeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  resumeText?: string | null;
  resumeUrl?: string | null;
}

const ResumeViewModal: React.FC<ResumeViewModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  resumeText,
  resumeUrl,
}) => {
  const hasText = !!resumeText?.trim();
  const hasUrl = !!resumeUrl?.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Resume: ${candidateName}`} size="3xl">
      <div className="space-y-4">
        {hasUrl && (
          <a
            href={resumeUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 transition-colors"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5" />
            Open Resume Link
          </a>
        )}

        {hasText ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
              {resumeText}
            </pre>
          </div>
        ) : (
          !hasUrl && (
            <p className="text-sm text-slate-400 italic p-4 text-center">
              No resume on file for this candidate.
            </p>
          )
        )}
      </div>
    </Modal>
  );
};

export default ResumeViewModal;
