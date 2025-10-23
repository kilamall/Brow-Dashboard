import { useState, useEffect } from 'react';
import type { ConsentFormTemplate } from '@buenobrows/shared/types';

interface ConsentFormProps {
  template: ConsentFormTemplate;
  customerName: string;
  onAgree: (signature: string) => void;
  onDecline?: () => void;
  isOpen: boolean;
}

export default function ConsentForm({
  template,
  customerName,
  onAgree,
  onDecline,
  isOpen,
}: ConsentFormProps) {
  const [signature, setSignature] = useState('');
  const [checkedSections, setCheckedSections] = useState<Set<number>>(new Set());
  const [hasScrolled, setHasScrolled] = useState(false);

  // Reset state when form is opened
  useEffect(() => {
    if (isOpen) {
      setSignature('');
      setCheckedSections(new Set());
      setHasScrolled(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requiredSections = template.sections.filter((s) => s.required);
  const allRequiredChecked = requiredSections.every((_, idx) =>
    checkedSections.has(idx)
  );
  const canSubmit = allRequiredChecked && signature.trim().length > 0 && hasScrolled;

  const handleCheckboxChange = (index: number) => {
    setCheckedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-2 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-serif text-terracotta mb-1">
                {template.title}
              </h2>
              <p className="text-sm text-slate-600">
                Version {template.version} • Effective {new Date(template.effectiveDate).toLocaleDateString()}
              </p>
            </div>
            {onDecline && (
              <button
                onClick={onDecline}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 overscroll-contain"
          onScroll={handleScroll}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Introduction */}
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 leading-relaxed">
              {template.content}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {template.sections.map((section, idx) => (
              <div
                key={idx}
                className={`rounded-xl border-2 p-5 ${
                  section.required
                    ? 'border-terracotta/30 bg-terracotta/5'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {section.required && (
                    <input
                      type="checkbox"
                      checked={checkedSections.has(idx)}
                      onChange={() => handleCheckboxChange(idx)}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      id={`section-${idx}`}
                    />
                  )}
                  <div className="flex-grow">
                    <label htmlFor={`section-${idx}`} className="cursor-pointer">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        {section.heading}
                        {section.required && (
                          <span className="text-xs text-terracotta font-normal">
                            (Required)
                          </span>
                        )}
                      </h3>
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          {!hasScrolled && (
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4 -mx-6 px-6">
              <div className="text-center text-sm text-slate-600 animate-pulse">
                ↓ Please scroll to read all sections ↓
              </div>
            </div>
          )}
        </div>

        {/* Footer - Signature */}
        <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50 flex-shrink-0 space-y-3 sm:space-y-4">
          {/* Signature Input */}
          <div>
            <label htmlFor="signature" className="block text-sm font-medium text-slate-700 mb-2">
              Digital Signature <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <input
                id="signature"
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name to sign"
                className="w-full rounded-lg border-2 border-slate-300 p-3 font-serif text-lg italic focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                disabled={!hasScrolled}
              />
              {signature && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              By typing your name, you are providing a legal electronic signature.
            </p>
          </div>

          {/* Agreement Statement */}
          {canSubmit && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="text-green-800">
                <strong>I, {signature},</strong> confirm that I have read, understood, and agree to all the terms outlined above. I understand this is a legally binding agreement.
              </p>
              <p className="text-xs text-green-700 mt-2">
                Date: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            {onDecline && (
              <button
                onClick={onDecline}
                className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => canSubmit && onAgree(signature)}
              disabled={!canSubmit}
              className="px-8 py-3 rounded-lg bg-terracotta text-white font-medium hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-1 sm:order-2"
            >
              I Agree & Sign
            </button>
          </div>

          {/* Validation Messages */}
          {!hasScrolled && (
            <p className="text-xs text-center text-amber-600">
              ⚠ Please scroll through all sections before signing
            </p>
          )}
          {hasScrolled && !allRequiredChecked && (
            <p className="text-xs text-center text-amber-600">
              ⚠ Please check all required sections
            </p>
          )}
          {hasScrolled && allRequiredChecked && !signature && (
            <p className="text-xs text-center text-amber-600">
              ⚠ Please provide your signature
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

