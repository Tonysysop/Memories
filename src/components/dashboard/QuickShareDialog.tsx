import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check, Mail } from "lucide-react";
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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
              <p className="text-2xl font-mono font-black tracking-widest text-primary">{event.shareCode}</p>
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
            
            <div className="grid grid-cols-2 gap-3 pb-2 max-w-sm mx-auto">
              <Button 
                  variant="outline" 
                  className="w-full gap-2 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 text-emerald-600 dark:text-emerald-500"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${shareUrl}`)}`, '_blank')}
              >
                  <WhatsAppIcon className="w-4 h-4" />
                  WhatsApp
              </Button>
              <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent(`You're invited: ${event.name}`)}&body=${encodeURIComponent(`Check out this event: ${shareUrl}`)}`}
              >
                  <Mail className="w-4 h-4" />
                  Email
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground/60 italic">Scan QR code or click to share the link</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickShareDialog;
