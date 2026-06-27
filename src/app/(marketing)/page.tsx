import Link from 'next/link';
import { ArrowRight, Bot, Zap, Package, Play, Check, ShieldCheck, MapPin, User } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700 font-sans">
      
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between max-w-[1400px] mx-auto px-6 py-12 md:py-20 w-full gap-12 relative">
        
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start text-left z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#6D4AFF]/30 text-[#6D4AFF] text-[10px] font-bold mb-6 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full border border-[#6D4AFF] animate-pulse" />
            AI-POWERED LOGISTICS AUTOMATION
          </div>
          
          <h1 className="text-[36px] md:text-[52px] font-[700] text-white tracking-tight leading-[1.1] mb-6">
            Automate your deliveries directly through <span className="text-[#6D4AFF]">Telegram.</span>
          </h1>
          
          <p className="text-[14px] md:text-[16px] font-[400] text-slate-400 mb-8 max-w-xl leading-relaxed">
            Routefy instantly extracts delivery details from text, audio, and screenshots using our AI, and automatically books the cheapest Shiprocket courier.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 bg-[#6D4AFF] hover:bg-[#5B3DF5] text-white text-[16px] font-[600] rounded-lg transition-all flex items-center justify-center group shadow-[0_0_20px_rgba(109,74,255,0.4)]">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white text-[16px] font-[600] rounded-lg border border-white/10 transition-all flex items-center justify-center">
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 text-slate-300 text-[14px] font-[400]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#6D4AFF]" /> No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#6D4AFF]" /> Setup in 2 minutes
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#6D4AFF]" /> Cancel anytime
            </div>
          </div>
        </div>
        
        {/* Right Mockup Graphic */}
        <div className="flex-1 relative w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
           <div className="relative w-full max-w-[650px] lg:aspect-[4/3] h-[800px] lg:h-auto z-10">
              {/* Fake Telegram Icon */}
              <div className="absolute -left-2 -top-6 md:-left-6 md:-top-6 w-12 h-12 md:w-16 md:h-16 bg-[#2AABEE] rounded-full flex items-center justify-center z-50 shadow-[0_10px_30px_rgba(42,171,238,0.4)] animate-bounce">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white ml-[-2px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.18 3.44-.49.34-.93.5-1.33.49-.44-.01-1.28-.25-1.9-.45-.77-.25-1.38-.38-1.33-.8.02-.22.33-.44.92-.68 3.6-1.57 6-2.6 7.2-3.1 3.43-1.42 4.14-1.67 4.6-1.67.1 0 .32.02.44.11.1.08.13.19.14.28 0 .04.01.2 0 .28z" />
                </svg>
              </div>

              {/* Back glowing panels */}
              <div className="absolute top-8 right-8 bottom-0 left-4 md:left-12 bg-indigo-900/30 rounded-3xl blur-2xl" />
              <div className="absolute top-10 right-0 md:right-4 bottom-[-10px] left-4 md:left-10 bg-slate-800/80 rounded-2xl border border-white/5 overflow-hidden" />
              
              {/* Telegram App Interface Mockup */}
              <div className="absolute inset-0 bg-[#0B0F19] rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden font-sans">
                
                {/* Chat Section */}
                <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/5 relative z-10">
                  {/* Chat Header */}
                  <div className="h-16 border-b border-white/5 flex items-center px-4 gap-3 bg-[#131722]">
                    <div className="text-slate-400 font-bold">{'<'}</div>
                    <div className="w-10 h-10 bg-[#6D4AFF] rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-[600] text-[14px]">Routefy Bot</div>
                      <div className="text-slate-400 text-[12px]">bot</div>
                    </div>
                  </div>
                  
                  {/* Chat Body */}
                  <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative bg-[#090C15]">
                    
                    {/* Bot Message */}
                    <div className="bg-[#1D2132] rounded-r-xl rounded-bl-xl p-3 max-w-[85%] self-start relative border border-white/5 shadow-sm">
                      <p className="text-[14px] text-slate-200">Hi! Send me an order details or screenshot.</p>
                      <span className="text-[10px] text-slate-500 absolute bottom-1 right-2">11:30 AM</span>
                    </div>

                    {/* User Message */}
                    <div className="bg-[#E4F2CB] text-slate-900 rounded-l-xl rounded-br-xl p-3 max-w-[85%] self-end relative shadow-sm">
                      <div className="text-[14px] leading-snug pb-3">
                        <p>Name: Rahul Sharma</p>
                        <p>Phone: 9876543210</p>
                        <br/>
                        <p>Product:</p>
                        <p>2 x Protein Powder</p>
                        <p>1 x Shaker</p>
                        <br/>
                        <p>Address:</p>
                        <p>Flat 4B, MG Road</p>
                        <p>Kochi, Kerala - 682016</p>
                      </div>
                      <span className="text-[10px] text-slate-600 absolute bottom-1 right-2 flex items-center gap-1">11:31 AM <Check className="w-3 h-3" /></span>
                    </div>

                    {/* Bot Extracting Message */}
                    <div className="bg-[#1D2132] rounded-r-xl rounded-bl-xl p-3 max-w-[85%] self-start relative border border-white/5 shadow-sm flex items-center gap-2">
                      <p className="text-[14px] text-slate-300">Extracting details...</p>
                      <span className="text-[10px] text-slate-500 absolute bottom-1 right-2">11:31 AM</span>
                    </div>

                  </div>
                </div>

                {/* Right Panel Section */}
                <div className="w-full md:w-[300px] bg-[#11141E] flex flex-col p-5 relative z-20 shadow-none md:shadow-[-15px_0_30px_rgba(0,0,0,0.4)] border-t md:border-t-0 border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-[14px] font-[700]">Order Extracted</h3>
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  
                  {/* Extracted Details */}
                  <div className="space-y-5 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#6D4AFF]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3 h-3 text-[#6D4AFF]" />
                      </div>
                      <div className="text-[12px] leading-tight">
                        <p className="text-white font-[600]">Rahul Sharma</p>
                        <p className="text-slate-400 mt-0.5">9876543210</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#6D4AFF]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#6D4AFF]" />
                      </div>
                      <div className="text-[12px] leading-tight">
                        <p className="text-white font-[600]">Flat 4B, MG Road</p>
                        <p className="text-slate-400 mt-0.5">Kochi, Kerala - 682016</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#6D4AFF]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-3 h-3 text-[#6D4AFF]" />
                      </div>
                      <div className="text-[12px] leading-tight">
                        <p className="text-white font-[600]">2 x Protein Powder</p>
                        <p className="text-slate-400 mt-0.5">1 x Shaker</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/5 mb-6" />

                  <h3 className="text-white text-[12px] font-[700] mb-3">Best Courier Options</h3>
                  
                  {/* Couriers */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#6D4AFF]/10 border border-[#6D4AFF]/30 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#6D4AFF] flex items-center justify-center">
                           <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[12px] text-white font-[500]">Xpressbees</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-[600] text-white">₹78</span>
                        <span className="text-[10px] text-slate-400 w-12 text-right">2-3 Days</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg border border-transparent hover:bg-white/5 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                        <span className="text-[12px] text-slate-300 font-[500]">Delhivery</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-[600] text-slate-300">₹89</span>
                        <span className="text-[10px] text-slate-400 w-12 text-right">2 Days</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg border border-transparent hover:bg-white/5 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                        <span className="text-[12px] text-slate-300 font-[500]">Ecom Express</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-[600] text-slate-300">₹85</span>
                        <span className="text-[10px] text-slate-400 w-12 text-right">2-3 Days</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-auto py-3 bg-[#6D4AFF] hover:bg-[#5B3DF5] text-white text-[12px] font-[600] rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(109,74,255,0.4)]">
                    <Zap className="w-3.5 h-3.5" fill="currentColor" /> Book Shipment
                  </button>
                </div>
              </div>

           </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="w-full max-w-[1400px] mx-auto px-6 py-12 text-center mt-12">
        <p className="text-[12px] font-[700] text-slate-500 tracking-[0.2em] uppercase mb-10">
          Trusted by 1000+ businesses
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Mock Logos */}
           <div className="text-[20px] font-bold font-serif italic text-white flex flex-col items-center leading-none">FitFuel<span className="text-[8px] font-sans not-italic text-slate-400 tracking-widest mt-1">NUTRITION</span></div>
           <div className="text-[24px] font-script text-white italic leading-none">BakeHouse<div className="text-[8px] font-sans not-italic text-slate-400 tracking-widest mt-1 text-center">BY PRIYA</div></div>
           <div className="text-[18px] font-bold text-white tracking-widest uppercase flex flex-col items-center leading-none">URBAN<span className="text-[14px] font-light mt-1">THREADS</span></div>
           <div className="text-[20px] font-bold text-white flex items-center gap-2 leading-none"><Bot className="w-6 h-6"/> PetCare<span className="text-[10px] font-normal text-slate-400 mt-1">India</span></div>
           <div className="text-[24px] font-serif text-white tracking-widest font-light flex flex-col items-center leading-none">GlowSkin<span className="text-[8px] font-sans text-slate-400 tracking-widest mt-1">BEAUTY</span></div>
           <div className="text-[20px] font-serif text-white flex flex-col items-center leading-none">TheGift<span className="text-[10px] font-sans tracking-widest text-slate-400 mt-1">STUDIO</span></div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full max-w-[1400px] mx-auto px-6 py-24 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-[24px] rounded-[24px] bg-gradient-to-b from-white/[0.03] to-transparent border-t border-l border-white/5 hover:bg-white/[0.05] transition-colors shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6D4AFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 bg-[#6D4AFF]/10 text-[#6D4AFF] rounded-xl flex items-center justify-center mb-6 relative z-10 border border-[#6D4AFF]/20">
              <Zap className="w-5 h-5" fill="currentColor" />
            </div>
            <h3 className="text-[20px] font-[600] text-white mb-3 relative z-10">Lightning Fast</h3>
            <p className="text-[14px] font-[400] text-slate-400 leading-relaxed relative z-10">From screenshot to shipment in under 30 seconds</p>
          </div>

          <div className="p-[24px] rounded-[24px] bg-gradient-to-b from-white/[0.03] to-transparent border-t border-l border-white/5 hover:bg-white/[0.05] transition-colors shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 bg-[#6D4AFF]/10 text-[#6D4AFF] rounded-xl flex items-center justify-center mb-6 relative z-10 border border-[#6D4AFF]/20">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-[20px] font-[600] text-white mb-3 relative z-10">AI-Powered Accuracy</h3>
            <p className="text-[14px] font-[400] text-slate-400 leading-relaxed relative z-10">Advanced AI extracts details with 99% accuracy</p>
          </div>

          <div className="p-[24px] rounded-[24px] bg-gradient-to-b from-white/[0.03] to-transparent border-t border-l border-white/5 hover:bg-white/[0.05] transition-colors shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 bg-[#6D4AFF]/10 text-[#6D4AFF] rounded-xl flex items-center justify-center mb-6 relative z-10 border border-[#6D4AFF]/20">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-[20px] font-[600] text-white mb-3 relative z-10">Cheapest Rates</h3>
            <p className="text-[14px] font-[400] text-slate-400 leading-relaxed relative z-10">Automatically compares and selects best courier rates</p>
          </div>

          <div className="p-[24px] rounded-[24px] bg-gradient-to-b from-white/[0.03] to-transparent border-t border-l border-white/5 hover:bg-white/[0.05] transition-colors shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 bg-[#6D4AFF]/10 text-[#6D4AFF] rounded-xl flex items-center justify-center mb-6 relative z-10 border border-[#6D4AFF]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[20px] font-[600] text-white mb-3 relative z-10">Secure & Reliable</h3>
            <p className="text-[14px] font-[400] text-slate-400 leading-relaxed relative z-10">Your data is encrypted and 100% secure</p>
          </div>
        </div>
      </section>

    </div>
  );
}
