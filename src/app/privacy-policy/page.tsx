export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-secondaryText py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primaryText mb-8">Privacy Policy</h1>
        
        <div className="bg-card border border-border shadow-sm p-8 rounded-3xl space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect about you to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide, maintain, and improve our services, including processing transactions and sending related information like confirmations and receipts.</li>
              <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
              <li>Respond to your comments, questions, and requests and provide customer service.</li>
              <li>Communicate with you about products, services, offers, and events offered by Routefy and others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">3. Sharing of Information</h2>
            <p>We may share the information we collect about you with third-party vendors (like Shiprocket) to fulfill logistics requests, payment gateways (like Razorpay) to process payments, and other service providers who need access to such information to carry out work on our behalf.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">4. Security</h2>
            <p>Routefy takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at: support@routefy.in</p>
          </section>
        </div>
      </div>
    </div>
  );
}
