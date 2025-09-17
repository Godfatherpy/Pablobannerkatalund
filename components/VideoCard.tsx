
import React from 'react';
import type { Video } from '../types';
import { Icon } from './icons';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative aspect-video bg-telegram-secondary-bg rounded-lg overflow-hidden cursor-pointer group"
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
         <div className="w-14 h-14 bg-black bg-opacity-50 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
           <Icon name="play" className="w-8 h-8 text-white" />
         </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm font-medium truncate">
          {video.custom_caption || 'Untitled Video'}
        </p>
      </div>
    </div>
  );
};
