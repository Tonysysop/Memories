import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { useEvents } from '@/hooks/useEvent';
import { toast } from 'sonner';

interface DeleteEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

type StepStatus = 'pending' | 'loading' | 'success' | 'error';

const DeleteEventDialog = ({ isOpen, onClose, eventId, eventName }: DeleteEventDialogProps) => {
  const { deleteEvent, verifyEventDeleted } = useEvents();
  const [confirmName, setConfirmName] = useState('');
  const [status, setStatus] = useState<Record<string, StepStatus>>({
    deleting: 'pending',
    verifying: 'pending'
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmName === eventName;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    
    // Step 1: Delete
    setStatus(prev => ({ ...prev, deleting: 'loading' }));
    const success = await deleteEvent(eventId);
    
    if (!success) {
      setStatus(prev => ({ ...prev, deleting: 'error' }));
      setIsDeleting(false);
      return;
    }
    setStatus(prev => ({ ...prev, deleting: 'success' }));

    // Wait a brief moment for DB consistency
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Verify
    setStatus(prev => ({ ...prev, verifying: 'loading' }));
    const isActuallyGone = await verifyEventDeleted(eventId);
    
    if (!isActuallyGone) {
      setStatus(prev => ({ ...prev, verifying: 'error' }));
      toast.error("Verification failed: Event still exists in database!");
    } else {
      setStatus(prev => ({ ...prev, verifying: 'success' }));
      toast.success("Event permanently deleted and verified.");
      setTimeout(onClose, 2000);
    }
    setIsDeleting(false);
  };

  const getIcon = (stepStatus: StepStatus) => {
    switch (stepStatus) {
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !isDeleting && !v && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Event
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. To delete <strong>{eventName}</strong>, please type the name below.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Input
            placeholder={`Type "${eventName}" to confirm`}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            disabled={isDeleting || status.verifying === 'success'}
            className="font-medium"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {getIcon(status.deleting)}
                <span className="text-sm font-medium">Delete from Server</span>
              </div>
              {status.deleting === 'error' && <span className="text-xs text-destructive">Failed</span>}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {getIcon(status.verifying)}
                <span className="text-sm font-medium">Verification Check</span>
              </div>
              {status.verifying === 'error' && <span className="text-xs text-destructive">Failed (Still Exists)</span>}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting || status.verifying === 'success'}
          >
            {isDeleting ? "Deleting..." : "Confirm & Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteEventDialog;
