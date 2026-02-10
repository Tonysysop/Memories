import { motion } from "framer-motion";
import { Camera, Play, ChevronRight } from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { useNavigate } from "react-router-dom";

interface RecentMediaFeedProps {
  events: MemoryEvent[];
}

const RecentMediaFeed = ({ events }: RecentMediaFeedProps) => {
  const navigate = useNavigate();

  // Flatten all uploads and sort by date
  const allMedia = events
    .flatMap((event) =>
      event.uploads
        .filter((u) => u.type === "photo" || u.type === "video")
        .map((u) => ({ ...u, eventId: event.id, eventName: event.name })),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 12);

  if (allMedia.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Recent Memories
        </h2>
        <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
        {allMedia.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex-shrink-0 w-40 aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group border border-border/50 shadow-sm"
            onClick={() => navigate(`/dashboard/event/${item.eventId}`)}
          >
            <img
              src={item.content}
              alt="Memory"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Type Icon Overlay */}
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
              {item.type === "video" ? (
                <Play className="w-3 h-3 text-white fill-current" />
              ) : (
                <Camera className="w-3 h-3 text-white" />
              )}
            </div>

            {/* Event Name Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <p className="text-[10px] text-white/70 font-medium truncate mb-0.5">
                {item.eventName}
              </p>
              <p className="text-[10px] text-white font-bold truncate">
                {item.guestName || "Anonymous Guest"}
              </p>
            </div>

            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentMediaFeed;
