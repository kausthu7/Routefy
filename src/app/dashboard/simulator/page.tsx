'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image as ImageIcon, Bot, User, CheckCheck, Loader2 } from 'lucide-react';

export default function SimulatorPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchProfileAndMessages();
    const interval = setInterval(fetchMessagesOnly, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProfileAndMessages = async () => {
    const res = await fetch('/api/merchant/profile');
    if (res.ok) {
      const data = await res.json();
      setMerchant(data.profile);
      fetchMessagesForMerchant(data.profile.id);
    }
  };

  const fetchMessagesOnly = async () => {
    if (merchant?.id) {
      fetchMessagesForMerchant(merchant.id);
    }
  };

  const fetchMessagesForMerchant = async (merchantId: string) => {
    const { data } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const sendSpoofedWebhook = async (payload: any) => {
    setLoading(true);
    try {
      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Fetch immediately after sending
      setTimeout(fetchMessagesOnly, 1000);
      setTimeout(fetchMessagesOnly, 3000);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !merchant) return;

    const textToSend = inputText;
    setInputText('');

    // Optimistically insert into DB to show immediately
    await supabase.from('ai_messages').insert([{ 
      merchant_id: merchant.id, 
      sender: 'merchant', 
      text_content: textToSend 
    }]);
    fetchMessagesOnly();

    // Construct Meta Webhook Payload for Text
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            metadata: { phone_number_id: 'simulator_bot_id' },
            messages: [{
              from: merchant.phone_number,
              type: 'text',
              text: { body: textToSend }
            }]
          }
        }]
      }]
    };

    await sendSpoofedWebhook(payload);
  };

  const handleInteractiveClick = async (buttonId: string, title: string) => {
    if (!merchant) return;

    // Optimistically show user clicking the button
    await supabase.from('ai_messages').insert([{ 
      merchant_id: merchant.id, 
      sender: 'merchant', 
      text_content: `Clicked: ${title}` 
    }]);
    fetchMessagesOnly();

    // Construct Meta Webhook Payload for Interactive Button
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            metadata: { phone_number_id: 'simulator_bot_id' },
            messages: [{
              from: merchant.phone_number,
              type: 'interactive',
              interactive: {
                button_reply: { id: buttonId }
              }
            }]
          }
        }]
      }]
    };

    await sendSpoofedWebhook(payload);
  };

  const renderMessageContent = (text: string) => {
    // Check if message contains interactive buttons
    if (text.includes('|__ID__')) {
      const lines = text.split('\n');
      const standardLines: string[] = [];
      const buttons: { title: string, id: string }[] = [];

      lines.forEach(line => {
        const match = line.match(/🔘 (.*?) \|__ID__(.*?)__/);
        if (match) {
          buttons.push({ title: match[1], id: match[2] });
        } else {
          standardLines.push(line);
        }
      });

      return (
        <div className="space-y-3">
          <div className="whitespace-pre-wrap">{standardLines.join('\n')}</div>
          <div className="flex flex-col gap-2 mt-2">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleInteractiveClick(btn.id, btn.title)}
                className="bg-white text-[#075E54] hover:bg-emerald-50 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm border border-emerald-100 transition-colors w-full text-center"
              >
                {btn.title}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return <div className="whitespace-pre-wrap">{text}</div>;
  };

  if (!merchant) return <div className="p-8 text-slate-400">Loading simulator...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">WhatsApp Simulator</h1>
        <p className="text-slate-400 text-sm">
          Test your Routefy bot logic directly. Messages sent here spoof the Meta webhook perfectly.
          Operating as <span className="text-emerald-400 font-mono">{merchant.phone_number}</span>.
        </p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col bg-[#0b141a] border-slate-800 shadow-2xl rounded-2xl relative">
        
        {/* Chat Header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center gap-4 z-10 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-slate-100 font-semibold">Routefy Bot</h2>
            <p className="text-xs text-emerald-500 font-medium">Online</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(11, 20, 26, 0.9)' }}
        >
          {messages.length === 0 && (
            <div className="bg-[#1f2c34] text-slate-300 text-xs px-3 py-1.5 rounded-lg w-fit mx-auto shadow-sm">
              Send a message to start the conversation
            </div>
          )}
          
          {messages.map((msg) => {
            const isMerchant = msg.sender === 'merchant';
            return (
              <div key={msg.id} className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] md:max-w-[70%] rounded-xl px-3 py-2 shadow-sm text-[15px] leading-relaxed relative ${
                    isMerchant 
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-sm' 
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-sm'
                  }`}
                >
                  {renderMessageContent(msg.text_content)}
                  
                  <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                    <span className="text-[10px] leading-none">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMerchant && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 z-10">
          <Button variant="ghost" size="icon" className="text-[#8696a0] hover:text-[#d1d7db] hover:bg-white/5 shrink-0">
            <ImageIcon className="w-6 h-6" />
          </Button>
          
          <form onSubmit={handleSendText} className="flex-1 flex items-center gap-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message or address details..."
              className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0] h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
            <Button 
              type="submit" 
              disabled={loading || !inputText.trim()}
              className="bg-[#00a884] hover:bg-[#00a884]/90 text-white w-10 h-10 rounded-full p-0 flex items-center justify-center shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-0.5" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
