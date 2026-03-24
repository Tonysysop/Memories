import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { WizardFormData } from "@/types/event";
import { WizardForm } from "../WizardForm";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: WizardFormData) => void;
}

const CreateEventDialog = ({
  open,
  onOpenChange,
  onCreate,
}: CreateEventDialogProps) => {
  const handleComplete = (data: WizardFormData) => {
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
