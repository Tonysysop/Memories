"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { EventUpload } from "@/types/event";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: EventUpload[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate,
}: LightboxProps) {
  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && currentItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Header Actions */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <div className="text-white text-sm font-medium px-4 py-2 bg-white/10 rounded-full backdrop-blur-md">
              {currentIndex + 1} / {items.length} 
              {currentItem.guestName && <span className="ml-2 text-white/60">by {currentItem.guestName}</span>}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(currentItem.content, '_blank');
                }}
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute inset-y-0 left-0 flex items-center p-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all active:scale-90"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center p-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 text-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all active:scale-90"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>

          {/* Content */}
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              const swipeThreshold = 50;
              if (info.offset.x > swipeThreshold) {
                handlePrev();
              } else if (info.offset.x < -swipeThreshold) {
                handleNext();
              }
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.type === "photo" ? (
              <img
                src={currentItem.content}
                alt="Memory"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={currentItem.content}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
