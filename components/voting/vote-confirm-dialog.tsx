'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface VoteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateImageUrl?: string;
  pointsToSpend: number;
  remainingBalance: number;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function VoteConfirmDialog({
  open,
  onOpenChange,
  candidateName,
  candidateImageUrl,
  pointsToSpend,
  remainingBalance,
  onConfirm,
  isSubmitting,
}: VoteConfirmDialogProps) {
  const afterBalance = remainingBalance - pointsToSpend;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-background">
        <DialogHeader>
          <DialogTitle>Confirm Your Vote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {candidateImageUrl && (
            <img
              src={candidateImageUrl}
              alt={candidateName}
              className="w-20 h-20 rounded-full mx-auto object-cover"
            />
          )}
          <p className="text-center font-semibold text-lg">{candidateName}</p>
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Points to spend:</span>
              <span className="font-bold text-primary">-{pointsToSpend} pts</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Remaining balance:</span>
              <span className="font-bold">{afterBalance} pts</span>
            </div>
          </div>
          {afterBalance < 0 && (
            <p className="text-red-600 text-sm text-center">
              Insufficient points. You only have {remainingBalance} pts remaining.
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting || afterBalance < 0}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Vote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
