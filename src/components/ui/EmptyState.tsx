import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  image?: string;
}

const EmptyState = ({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  image = "/illustrations/Noevent.png" 
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="relative mb-8 group"
      >
        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors" />
        
        {/* Glassmorphic platform for the image */}
        <div className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl scale-90 translate-y-4" />
        
        <img 
          src={image} 
          alt="Illustration" 
          className="relative w-64 h-64 object-contain drop-shadow-2xl filter contrast-[1.1] dark:brightness-90 transition-transform group-hover:scale-105 duration-700" 
        />
        
        {/* Decorative elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>

      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-display font-bold mb-3 tracking-tight"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-10 leading-relaxed"
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            onClick={onAction}
            className="h-12 px-8 rounded-xl font-bold gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default EmptyState;
