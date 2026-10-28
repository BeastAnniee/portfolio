'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { copyFeedbackMs } from '@/lib/copy-feedback';

interface CopyEmailButtonProps {
  email: string;
  label: string;
  copiedText: string;
}

const CopyEmailButton = ({ email, label, copiedText }: CopyEmailButtonProps) => {
  const [showCopied, setShowCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    let copyOk = true;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Sin permiso o sin HTTPS: se muestra el correo para que la persona lo copie a mano.
      copyOk = false;
    }
    setCopyFailed(!copyOk);
    setShowCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowCopied(false), copyFeedbackMs(copyOk));
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        className="press flex h-11 w-11 items-center justify-center rounded-xl border border-line text-bone hover:bg-bone hover:text-carbon"
      >
        <Mail className="h-5 w-5" aria-hidden="true" />
      </button>
      <div role="status" aria-live="polite">
        {showCopied && (
          <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-transparent bg-bone px-6 py-3 text-base font-medium text-carbon animate-fade-in">
            {copyFailed ? email : copiedText}
          </div>
        )}
      </div>
    </>
  );
};

export default CopyEmailButton;
