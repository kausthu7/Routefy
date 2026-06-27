import React from 'react';

type Button = {
  id: string;
  title: string;
};

type ChatBubbleProps = {
  text: string;
  sender: 'user' | 'bot';
  buttons?: Button[];
  onButtonClick?: (buttonId: string) => void;
  imageUrl?: string;
  audioUrl?: string;
};

export default function ChatBubble({ text, sender, buttons, onButtonClick, imageUrl, audioUrl }: ChatBubbleProps) {
  const isUser = sender === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-[#E7FFDB] text-gray-900 rounded-tr-none'
            : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
        }`}
      >
        {imageUrl && (
          <img src={imageUrl} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-2 border border-gray-200" />
        )}
        
        {audioUrl && (
          <audio controls className="w-full mb-2">
            <source src={audioUrl} />
            Your browser does not support the audio element.
          </audio>
        )}

        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{text}</div>

        {buttons && buttons.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {buttons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => onButtonClick && onButtonClick(btn.id)}
                className="w-full text-center bg-[#F0F2F5] hover:bg-[#E2E8F0] text-[#00A884] font-medium py-2 px-4 rounded-lg transition-colors border border-gray-200"
              >
                {btn.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
