'use client';

import { Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BreatheButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="gap-2 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300"
      onClick={() => router.push('/breathe')}
    >
      <Wind className="h-4 w-4" />
      Breathe
    </Button>
  );
}