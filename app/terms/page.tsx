export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold uppercase tracking-tight">
            Repurpose<span className="text-secondary">AI</span>
          </a>
          <a href="/" className="text-sm font-bold uppercase tracking-wider hover:text-secondary transition-colors">&larr; Home</a>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold uppercase mb-8">Terms of Service</h1>
        <div className="brutal-card p-8 bg-white space-y-6 text-dark/80 font-medium leading-relaxed">
          <p><strong>Last updated:</strong> March 15, 2026</p>
          <h2 className="text-xl font-bold uppercase pt-4">1. Acceptance of Terms</h2>
          <p>By accessing or using RepurposeAI, you agree to be bound by these Terms of Service. If you do not agree, do not use our service.</p>
          <h2 className="text-xl font-bold uppercase pt-4">2. Service Description</h2>
          <p>RepurposeAI provides AI-powered content repurposing tools that transform your content into multiple formats optimized for different platforms.</p>
          <h2 className="text-xl font-bold uppercase pt-4">3. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account. You must provide accurate information when creating an account via Google Sign-In.</p>
          <h2 className="text-xl font-bold uppercase pt-4">4. Content Ownership</h2>
          <p>You retain all rights to content you upload. By using our service, you grant us a limited license to process your content for the purpose of providing our repurposing services.</p>
          <h2 className="text-xl font-bold uppercase pt-4">5. Pricing & Payments</h2>
          <p>Free tier includes 5 repurposes per month. Pro tier ($19/month) includes unlimited repurposes. Prices may change with 30 days notice.</p>
          <h2 className="text-xl font-bold uppercase pt-4">6. Prohibited Use</h2>
          <p>You may not use our service to generate illegal, harmful, or misleading content. We reserve the right to terminate accounts that violate these terms.</p>
          <h2 className="text-xl font-bold uppercase pt-4">7. Limitation of Liability</h2>
          <p>RepurposeAI is provided &quot;as is&quot; without warranties. We are not liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
          <h2 className="text-xl font-bold uppercase pt-4">8. Contact</h2>
          <p>For questions about these terms, contact us at <strong>legal@repurposeai.com</strong>.</p>
        </div>
      </main>
    </div>
  );
}
