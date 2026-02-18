'use client'

import React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { ActiveSound } from "@/types/sounds";

interface SaveMixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  currentSounds: ActiveSound[];
  loading?: boolean;
  error?: string | null;
}

const SaveMixDialog = ({
  open,
  onOpenChange,
  onSave,
  currentSounds,
  loading = false,
  error,
}: SaveMixDialogProps) => {
  const router = useRouter();

  const [mixName, setMixName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSave = () => {
    setLocalError(null);

    if (!mixName.trim()) {
      setLocalError("Please enter a name for your mix");
      return;
    }

    if (currentSounds.length === 0) {
      setLocalError("You need to have at least one sound to save a mix");
      return;
    }

    onSave(mixName);
    setMixName("");
    setLocalError(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setMixName("");
    setLocalError(null);
    onOpenChange(false);
  };

  const handleViewSavedMixes = () => {
    // Close the dialog and navigate to saved mixes page
    onOpenChange(false);
    router.push("/saved-mixes");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-8">
            Save Your Mix
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Give your sound mix a name to save it for later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mix-name" className="text-sm font-medium">
              Mix Name
            </Label>
            <Input
              id="mix-name"
              value={mixName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMixName(e.target.value)}
              className="bg-slate-700 border-slate-60 text-white placeholder:text-slate-400"
              placeholder="e.g., Relaxing Rain Sounds"
              disabled={loading}
            />
          </div>
        </div>

        {currentSounds.length > 0 && (
          <div className="text-sm text-slate-400">
            {currentSounds.length} sound{currentSounds.length !== 1 ? 's' : ''} will be saved
          </div>
        )}

        {(error || localError) && (
          <div className="text-sm text-red-400">
            {error || localError}
          </div>
        )}

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-slate-60 text-white hover:bg-slate-700 w-full sm:w-auto min-h-11"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleViewSavedMixes}
            className="bg-slate-600 hover:bg-slate-500 text-white w-full sm:w-auto min-h-11"
          >
            View Saved Mixes
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-h-11"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Mix"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveMixDialog;