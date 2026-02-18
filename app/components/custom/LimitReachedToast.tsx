'use client';

import React from 'react';
import { toast } from 'sonner';
import { Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LimitReachedToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LimitReachedToast = ({ open, onOpenChange }: LimitReachedToastProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
        >
          <Volume2 className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-8">
            Concurrent Sound Limit Reached
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            You can play up to 10 sounds at the same time. Deselect a current active sound to add more.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};