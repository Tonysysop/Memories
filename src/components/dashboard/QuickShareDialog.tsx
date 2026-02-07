import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QuickShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    name: string;
    shareCode: string;
  } | null;
}

const QuickShareDialog = ({ isOpen, onClose, event }: QuickShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const shareUrl = `${window.location.origin}/event/${event.shareCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share this link with your guests.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold">
            <Share2 className="w-5 h-5 text-primary" />
            Quick Share
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-6 flex flex-col items-center">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-primary/10 border border-primary/5">
            <QRCodeSVG 
              value={shareUrl} 
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="w-full space-y-4 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1">Event Code</p>
              <p className="text-4xl font-mono font-black tracking-widest text-primary">{event.shareCode}</p>
            </div>

            <div className="relative group p-1 bg-muted rounded-2xl border border-border flex items-center gap-2 overflow-hidden max-w-sm mx-auto">
              <div className="flex-1 bg-transparent px-3 py-2 text-xs truncate font-medium text-muted-foreground">
                {shareUrl}
              </div>
              <Button 
                onClick={handleCopyLink}
                className="shrink-0 h-10 rounded-xl px-4 gap-2 transition-all active:scale-95"
                variant={copied ? "secondary" : "default"}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground/60 italic">Scan QR code or click to copy the link</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickShareDialog;
