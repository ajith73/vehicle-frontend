export default function TermsPage() {
  return (
    <div className="flex-1 w-full bg-background flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 sm:py-24">
        <h1 className="text-4xl font-black text-foreground mb-8">Terms and Conditions</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
            <p>
              Welcome to Vehicle Assist. By using our platform, you agree to these Terms and Conditions. Please read them carefully. If you do not agree with any part of these terms, you must not use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Use of the Service</h2>
            <p>
              Our platform connects drivers in need of roadside assistance with independent mechanics and service providers. We do not provide vehicle repair services directly. We act solely as an intermediary technology platform.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Users must provide accurate location and vehicle information.</li>
              <li>Service providers must hold valid licenses and qualifications required by local law.</li>
              <li>We are not responsible for the quality of services rendered by third-party mechanics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Payments & Fees</h2>
            <p>
              Any payments for repair or towing services are handled directly between the user and the service provider unless explicitly stated otherwise within the app. We may collect platform fees or donations to maintain our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Liability Limitation</h2>
            <p>
              To the fullest extent permitted by law, Vehicle Assist shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use of our platform or any services booked through it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
