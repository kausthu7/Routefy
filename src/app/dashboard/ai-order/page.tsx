'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Image as ImageIcon, Send, X, Package, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';

export default function AIOrderPage() {
  const router = useRouter();
  
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [parsedData, setParsedData] = useState<any>(null);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null); // courierId
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Product Selection State
  const [needsProductSelection, setNeedsProductSelection] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | 'other' | null>(null);
  const [customProduct, setCustomProduct] = useState({ product_name: '', weight_kg: 1, length_cm: 10, breadth_cm: 10, height_cm: 10 });

  // ... (Recording Audio code remains same)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic:", err);
      setError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearInputs = () => {
    setTextInput('');
    setFileInput(null);
    setAudioBlob(null);
    setError('');
  };

  // Convert File/Blob to Base64
  const toBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Submit to AI
  const handleSubmit = async (submitWithProduct = false) => {
    if (!textInput && !fileInput && !audioBlob && !submitWithProduct) {
      setError('Please provide text, an image, or a voice note.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Only clear if it's the initial submission
    if (!submitWithProduct) {
      setParsedData(null);
      setCouriers([]);
      setSuccessMsg('');
      setNeedsProductSelection(false);
      setSelectedProductId(null);
    }

    try {
      let type = 'text';
      let data = textInput;

      if (audioBlob) {
        type = 'audio';
        data = await toBase64(audioBlob);
      } else if (fileInput) {
        type = 'image';
        data = await toBase64(fileInput);
      }

      const payload: any = { type, data };
      
      if (submitWithProduct && parsedData) {
        // Clone parsed data and apply selected product details
        let finalData = { ...parsedData };
        if (selectedProductId === 'other') {
          finalData = { ...finalData, ...customProduct };
        } else {
          const prod = availableProducts.find(p => p.id === selectedProductId);
          if (prod) {
            finalData.product_name = prod.name;
            finalData.weight_kg = prod.weight_kg;
            finalData.length_cm = prod.length_cm;
            finalData.breadth_cm = prod.breadth_cm;
            finalData.height_cm = prod.height_cm;
          }
        }
        payload.parsedData = finalData;
      }

      const res = await fetch('/api/merchant/ai-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          router.push('/');
          return;
        }
        throw new Error(result.error || 'Failed to process order.');
      }

      if (result.needsProductSelection) {
        setNeedsProductSelection(true);
        setAvailableProducts(result.products || []);
        setParsedData(result.parsedData);
        setLoading(false);
        return;
      }

      setNeedsProductSelection(false);
      setParsedData({
        ...result.order,
        customer_name: result.order.customer_name,
        customer_phone: result.order.customer_phone,
        delivery_address: result.order.delivery_address,
        pincode: result.order.pincode,
        is_cod: result.order.is_cod,
        cod_amount: result.order.cod_amount,
        weight_kg: result.order.weight_kg,
        product_name: result.order.product_name
      });
      setCouriers(result.couriers);
      setOrderId(result.order.id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditData({ ...parsedData });
    }
    setIsEditing(!isEditing);
  };

  const saveEdit = async () => {
    if (!editData || !orderId) return;
    setIsUpdating(true);
    setError('');
    
    try {
      const res = await fetch('/api/merchant/ai-order/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          ...editData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      setParsedData(data.order);
      setCouriers(data.couriers || []);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm Courier Booking
  const confirmBooking = async (courierId: string, price: number) => {
    if (!orderId) return;
    setConfirming(courierId);
    setError('');
    
    try {
      const res = await fetch('/api/merchant/ai-order/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, courierId, price })
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to confirm booking.');
      }

      setSuccessMsg(`Booking Confirmed! Tracking URL: ${result.trackingUrl}`);
      setCouriers([]);
      setParsedData(null);
      clearInputs();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div className="p-4 sm:p-[32px] max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10 pb-32">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-slate-900 drop-shadow-sm flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-purple-200 md:text-purple-600" /> Smart Booking
        </h1>
        <p className="text-purple-100 md:text-slate-500 mt-1 text-sm font-medium">Create orders magically using text, screenshots, or voice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <div className="bg-white rounded-[24px] p-6 flex flex-col relative overflow-hidden border border-slate-100 shadow-sm">
           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
           
           <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm relative z-10">Provide Details</h3>
           
           {!fileInput && !audioBlob && (
             <textarea 
               value={textInput}
               onChange={(e) => setTextInput(e.target.value)}
               placeholder="Paste delivery address, name, and phone here..."
               className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-300 resize-none mb-4 relative z-10 transition-colors"
             />
           )}

           {fileInput && (
             <div className="w-full h-32 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between p-4 mb-4 relative z-10">
               <div className="flex items-center gap-3 text-purple-600">
                 <ImageIcon className="w-6 h-6" />
                 <span className="font-medium text-sm truncate max-w-[150px]">{fileInput.name}</span>
               </div>
               <button onClick={() => setFileInput(null)} className="p-2 hover:bg-white rounded-full text-slate-400 border border-transparent hover:border-slate-200 transition-colors">
                 <X className="w-4 h-4" />
               </button>
             </div>
           )}

           {audioBlob && (
             <div className="w-full h-32 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between p-4 mb-4 relative z-10">
               <div className="flex items-center gap-3 text-indigo-600">
                 <Mic className="w-6 h-6" />
                 <span className="font-medium text-sm">Voice Note Recorded</span>
               </div>
               <button onClick={() => setAudioBlob(null)} className="p-2 hover:bg-white rounded-full text-slate-400 border border-transparent hover:border-slate-200 transition-colors">
                 <X className="w-4 h-4" />
               </button>
             </div>
           )}

           <div className="flex items-center gap-3 relative z-10 mt-auto">
             {!audioBlob && !textInput && (
               <>
                 <label className="bg-slate-50 border border-slate-200 flex-1 h-12 rounded-xl flex items-center justify-center cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all group">
                   <ImageIcon className="w-5 h-5 mr-2 text-slate-400 group-hover:text-purple-500 transition-colors" /> Image
                   <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setFileInput(e.target.files[0])} />
                 </label>
                 
                 <button 
                   onMouseDown={startRecording}
                   onMouseUp={stopRecording}
                   onTouchStart={startRecording}
                   onTouchEnd={stopRecording}
                   className={`flex-1 h-12 rounded-xl flex items-center justify-center font-medium transition-all ${isRecording ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                 >
                   <Mic className={`w-5 h-5 mr-2 ${isRecording ? '' : 'text-purple-500'}`} /> 
                   {isRecording ? 'Recording...' : 'Hold to Speak'}
                 </button>
               </>
             )}
           </div>

           <button 
             onClick={() => handleSubmit(false)} 
             disabled={loading || (!textInput && !fileInput && !audioBlob)}
             className="w-full mt-4 h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50 relative z-10"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Process AI Booking</>}
           </button>
           
            {error && (
             <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
               {error}
             </div>
           )}
           {successMsg && (
             <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center">
               <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> {successMsg}
             </div>
           )}
        </div>

        {/* Product Selection Section */}
        {needsProductSelection && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-in slide-in-from-right duration-500">
              <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" /> Select Product
              </h3>
              <p className="text-sm text-slate-500 mb-4">You have multiple products saved. Which one is this order for?</p>
              
              <div className="space-y-3">
                {availableProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${selectedProductId === p.id ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                  >
                    <span className="font-bold">{p.name}</span>
                    <span className="text-xs text-slate-500 block mt-1">{p.weight_kg}kg • {p.length_cm}x{p.breadth_cm}x{p.height_cm}cm</span>
                  </button>
                ))}
                
                <button
                  onClick={() => setSelectedProductId('other')}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${selectedProductId === 'other' ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className="font-bold">Other (Custom Product)</span>
                </button>
              </div>

              {selectedProductId === 'other' && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-xs font-medium">Product Name</label>
                    <input type="text" value={customProduct.product_name} onChange={e => setCustomProduct({...customProduct, product_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-medium">Weight (kg)</label>
                      <input type="number" step="0.1" value={customProduct.weight_kg} onChange={e => setCustomProduct({...customProduct, weight_kg: parseFloat(e.target.value) || 1})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-medium">Length (cm)</label>
                      <input type="number" value={customProduct.length_cm} onChange={e => setCustomProduct({...customProduct, length_cm: parseFloat(e.target.value) || 10})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-medium">Breadth (cm)</label>
                      <input type="number" value={customProduct.breadth_cm} onChange={e => setCustomProduct({...customProduct, breadth_cm: parseFloat(e.target.value) || 10})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-medium">Height (cm)</label>
                      <input type="number" value={customProduct.height_cm} onChange={e => setCustomProduct({...customProduct, height_cm: parseFloat(e.target.value) || 10})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900" />
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => handleSubmit(true)}
                disabled={!selectedProductId || (selectedProductId === 'other' && !customProduct.product_name)}
                className="w-full mt-6 h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Selection & Find Couriers'}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="flex flex-col gap-6">
          {!needsProductSelection && parsedData && (
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-in slide-in-from-right duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" /> Extracted Details
                </h3>
                {!isEditing && (
                  <button onClick={handleEditToggle} className="text-purple-600 hover:text-purple-700 text-xs font-bold px-3 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors">
                    EDIT
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs uppercase font-medium">Customer</label>
                      <input type="text" value={editData.customer_name} onChange={e => setEditData({...editData, customer_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs uppercase font-medium">Phone</label>
                      <input type="text" value={editData.customer_phone} onChange={e => setEditData({...editData, customer_phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 text-sm" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-slate-500 text-xs uppercase font-medium">Address</label>
                      <input type="text" value={editData.delivery_address} onChange={e => setEditData({...editData, delivery_address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs uppercase font-medium">Pincode</label>
                      <input type="text" value={editData.pincode} onChange={e => setEditData({...editData, pincode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs uppercase font-medium">Weight (kg)</label>
                      <input type="number" step="0.1" value={editData.weight_kg} onChange={e => setEditData({...editData, weight_kg: parseFloat(e.target.value) || 1})} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-900 text-sm" />
                    </div>
                    <div className="space-y-1 flex items-center gap-2 mt-2">
                      <input type="checkbox" id="edit-cod" checked={editData.is_cod} onChange={e => setEditData({...editData, is_cod: e.target.checked})} className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                      <label htmlFor="edit-cod" className="text-slate-700 text-sm">Is COD?</label>
                    </div>
                    {editData.is_cod && (
                      <div className="space-y-1">
                        <label className="text-slate-500 text-xs uppercase font-medium">COD Amount</label>
                        <input type="number" value={editData.cod_amount} onChange={e => setEditData({...editData, cod_amount: parseFloat(e.target.value) || 0})} className="w-full bg-amber-50 border border-amber-200 rounded-md p-2 text-amber-700 text-sm font-bold" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button onClick={handleEditToggle} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors border border-slate-200">
                      Cancel
                    </button>
                    <button onClick={saveEdit} disabled={isUpdating} className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors flex justify-center items-center shadow-sm">
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Refresh Couriers'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-medium mb-1">Customer</p>
                    <p className="text-slate-900 font-medium">{parsedData.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-medium mb-1">Phone</p>
                    <p className="text-slate-900 font-medium">{parsedData.customer_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs uppercase font-medium mb-1">Address</p>
                    <p className="text-slate-900 font-medium">{parsedData.delivery_address}, {parsedData.pincode}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-medium mb-1">Type</p>
                    <p className="text-slate-900 font-medium">
                      {parsedData.is_cod ? <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-xs font-bold">COD (₹{parsedData.cod_amount})</span> : <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-xs font-bold">Prepaid</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-medium mb-1">Weight</p>
                    <p className="text-slate-900 font-medium">{parsedData.weight_kg} kg</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {couriers.length > 0 && (
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-in slide-in-from-bottom duration-700">
               <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" /> Select Courier
              </h3>
              <div className="space-y-3">
                {couriers.slice(0, 4).map((c: any) => (
                  <button 
                    key={c.courier_id}
                    onClick={() => confirmBooking(c.courier_id.toString(), parseFloat(c.price))}
                    disabled={!!confirming}
                    className="w-full bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 p-4 rounded-xl flex items-center justify-between text-left transition-all disabled:opacity-50 group shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{c.courier_name}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.estimated_delivery_days || 3} Days Delivery</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-lg text-slate-900 group-hover:text-purple-700">₹{c.price}</span>
                      {confirming === c.courier_id.toString() && <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
