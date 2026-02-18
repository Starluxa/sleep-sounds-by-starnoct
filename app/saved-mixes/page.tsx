'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, Play, Pause } from 'lucide-react';
import { useAudioStore } from '@/lib/store';
import { useMixStore } from '@/lib/mix-store';
import { Skeleton } from '@/components/ui/skeleton';
import { useMixHydration } from '@/hooks/useMixHydration';
import { LocalSavedMix, ActiveSound } from '@/types/sounds';
import type { CuratedMix } from '@/data/default-mixes';
import { DEFAULT_MIXES_WITH_IMAGES } from '@/data/default-mixes';
import { CuratedMixButton } from '@/components/ui/CuratedMixButton';
import { useRouter } from 'next/navigation';

export default function SavedMixesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mixToDelete, setMixToDelete] = useState<string | null>(null);
  const { deleteMix, savedMixes } = useMixStore();


  const router = useRouter();
  const { currentMixKey, isPaused } = useAudioStore();
  const setMix = useAudioStore(state => state.setMix);


  const hydrated = useMixHydration();

  const sortedMixes: LocalSavedMix[] = useMemo(() =>
    [...savedMixes].sort((a, b) => b.createdAt - a.createdAt),
    [savedMixes]
  ) as LocalSavedMix[];


  const handleDeleteMix = (mixId: string) => {
    setMixToDelete(mixId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMix = async () => {
    if (mixToDelete) {
      await deleteMix(mixToDelete);
      setDeleteDialogOpen(false);
      setMixToDelete(null);
    }
  };

  const cancelDeleteMix = () => {
    setDeleteDialogOpen(false);
    setMixToDelete(null);
  };

  const handleLoadMix = (mix: LocalSavedMix | CuratedMix) => {
    const state = useAudioStore.getState();
    const currentMixKey = state.currentMixKey;
    const mixKey = (mix as any).id || mix.name;
    if (currentMixKey === mixKey) {
      useAudioStore.setState({ isPaused: !state.isPaused });
    } else {
      setMix(mix.sounds.map(s => ({ ...s, isPlaying: true })));
      useAudioStore.setState({
        isPaused: false,
        currentMixKey: mixKey
      });
    }
  };



  const amberClasses = "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10";
  const greenClasses = "text-green-400 hover:text-green-300 hover:bg-green-500/10";
  return (
    <div className="min-h-screen p-4 pb-32 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 -ml-2 hover:bg-slate-800/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Saved Mixes</h1>
      </div>

      {!hydrated || sortedMixes.length > 0 ? (
        <div className="grid gap-3" role="list">
          {sortedMixes.map((mix) => (
            <div
              key={mix.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:bg-slate-800 h-12 min-h-12"
              role="listitem"
            >
              <div
                className="flex-1 min-w-0 pr-4 cursor-pointer select-none"
                onClick={() => handleLoadMix(mix)}
              >
                <h3 className="font-semibold text-lg text-white truncate">{mix.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {mix.sounds?.length ?? 0} sounds • {new Date(mix.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${mix.id === currentMixKey && !isPaused ? amberClasses : greenClasses} h-10 w-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
                  aria-label={`${mix.id === currentMixKey && !isPaused ? 'Pause' : 'Play'} ${mix.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadMix(mix);
                  }}
                >
                  {mix.id === currentMixKey && !isPaused ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 w-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`Delete ${mix.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMix(mix.id);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 mt-20 p-12 space-y-2">
          <p className="text-xl font-medium">No mixes saved yet...</p>
          <p className="text-sm">Create a mix and save it to access here.</p>
        </div>
      )}


      <div className="mt-12 pt-8 border-t border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 text-center md:text-left">Curated Mixes</h2>
        <div className="grid gap-4">
          {DEFAULT_MIXES_WITH_IMAGES.map((mix) => (
            <CuratedMixButton key={mix.name} mix={mix} onLoad={handleLoadMix} isCurrentPlaying={mix.name === currentMixKey && !isPaused} />
          ))}
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the saved mix.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteMix}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMix}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}