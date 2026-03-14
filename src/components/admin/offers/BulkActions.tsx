"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BulkActionsProps {
  canActivate: boolean;
  canDeactivate: boolean;
  onActivateAll: () => void;
  onDeactivateAll: () => void;
}

export function BulkActions({ canActivate, canDeactivate, onActivateAll, onDeactivateAll }: BulkActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            disabled={!canActivate}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.45)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Activate All Offers
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-white/10 bg-[hsl(20,18%,9%)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Activate all offers?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will set every configured offer to active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-black hover:bg-primary/90"
              onClick={onActivateAll}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            disabled={!canDeactivate}
            className="rounded-full border border-red-400/35 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Deactivate All Offers
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-white/10 bg-[hsl(20,18%,9%)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate all offers?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This keeps offer configuration but turns every one of them off.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-500/90"
              onClick={onDeactivateAll}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
