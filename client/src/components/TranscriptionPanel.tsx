
import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';

interface TranscriptionPanelProps {
  transcripts: Message[];
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ transcripts }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);
  
  return (
    <div className="flex flex-col h-full p-4">
        <h2 className="text-xl font-bold text-[#0A1A3F] p-2 border-b border-[#E2E8F0] mb-4">Conversation</h2>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {transcripts.map((message, index) => {
                const isUser = message.speaker === 'user';
                const label = isUser ? 'You' : 'Maya';
                return (
                  <div key={`${message.timestamp}-${index}`} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${isUser ? 'bg-[#0058FF] text-white rounded-br-none' : 'bg-[#E2E8F0] text-[#0A1A3F] rounded-bl-none'}`}>
                          <p className="text-sm">{message.text}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">{label} at {message.timestamp}</span>
                  </div>
                );
            })}
             <div ref={endOfMessagesRef} />
        </div>
    </div>
  );
};

export default TranscriptionPanel;
