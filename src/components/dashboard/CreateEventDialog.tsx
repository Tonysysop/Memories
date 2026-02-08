import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { EventType } from "@/types/event";
import { WizardForm } from "../WizardForm";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    type: EventType;
    customType?: string;
    coverImage?: string;
    eventDate?: string;
    groomFirstName?: string;
    groomLastName?: string;
    brideFirstName?: string;
    brideLastName?: string;
    religiousRiteVenue?: string;
    religiousRiteStartTime?: string;
    religiousRiteEndTime?: string;
    receptionVenue?: string;
    receptionStartTime?: string;
    receptionEndTime?: string;
    isLocationPublic?: boolean;
  }) => void;
}

const CreateEventDialog = ({ open, onOpenChange, onCreate }: CreateEventDialogProps) => {
  const handleComplete = (data: any) => {
    onCreate(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <WizardForm 
          onComplete={handleComplete} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;