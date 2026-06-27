export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background text-secondaryText py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primaryText mb-8">Terms and Conditions</h1>
        
        <div className="bg-card border border-border shadow-sm p-8 rounded-3xl space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Routefy, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">2. Description of Service</h2>
            <p>Routefy provides a software platform integrating with third-party logistics providers (e.g., Shiprocket) to facilitate order creation and tracking via web and conversational interfaces (e.g., Telegram/WhatsApp). Routefy is not a courier company and is not liable for lost or damaged goods during transit.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">3. Wallet and Payments</h2>
            <p>Users must maintain a positive balance in their Routefy prepaid wallet to process shipments. Funds added to the wallet are non-refundable unless required by applicable law or in the case of a failed recharge transaction where funds were deducted from your bank but not credited to the wallet.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">4. User Responsibilities</h2>
            <p>You agree not to use the service for shipping illegal, hazardous, or prohibited materials. You are responsible for accurately declaring the weight, dimensions, and value of the shipments.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">5. Limitation of Liability</h2>
            <p>In no event shall Routefy be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">6. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the date at the top of these terms or through other appropriate communication channels.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
