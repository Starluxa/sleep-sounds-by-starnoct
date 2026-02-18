'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAudioStore, selectActiveSounds } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { encodeMix } from '@/lib/share-utils';
import { APP_URL } from '@/constants';

type ShareButtonSize = 'small' | 'medium' | 'large'
type ShareButtonContext = 'collapsed' | 'expanded'

export default function ShareButton({
  size = 'small',
  context = 'collapsed',
}: {
  size?: ShareButtonSize
  context?: ShareButtonContext
}) {
  const [copied, setCopied] = useState(false);
  const activeSounds = useAudioStore(useShallow(selectActiveSounds));

  const sizeConfig = (() => {
    // Keep collapsed buttons compact; expanded view should be comfortably tappable.
    if (context === 'expanded') {
      return size === 'small'
        ? { btn: 'h-11 w-11', icon: 'h-5 w-5' }
        : size === 'medium'
          ? { btn: 'h-12 w-12', icon: 'h-5 w-5' }
          : { btn: 'h-14 w-14', icon: 'h-6 w-6' }
    }

    // collapsed
    return size === 'small'
      // Ensure a reliable mobile tap target (>= 44px) and prevent flex shrinking.
      ? { btn: 'h-11 w-11', icon: 'h-4 w-4' }
      : size === 'medium'
        ? { btn: 'h-11 w-11', icon: 'h-5 w-5' }
        : { btn: 'h-12 w-12', icon: 'h-6 w-6' }
  })();

  const handleShare = async () => {
    if (activeSounds.length === 0) {
      toast.error('No sounds active to share');
      return;
    }

    try {
      const hash = encodeMix(activeSounds);
      const url = `${APP_URL}?mix=${hash}`;

      await navigator.clipboard.writeText(url);
      toast.success('Mix link copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        `rounded-xl bg-linear-to-br from-blue-600/40 to-blue-800/25 hover:opacity-95 shadow-sm border border-white/10 text-gray-100 pointer-events-auto flex items-center justify-center shrink-0 min-w-11 min-h-11 ${sizeConfig.btn}`
      }
      aria-label={copied ? 'Share link copied' : 'Share mix'}
    >
      {copied ? <Check className={sizeConfig.icon} /> : <Share2 className={sizeConfig.icon} />}
    </button>
  );
}
