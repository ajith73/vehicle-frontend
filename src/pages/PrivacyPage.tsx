export default function PrivacyPage() {
  return (
    <div className="flex-1 w-full bg-background flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 sm:py-24">
        <h1 className="text-4xl font-black text-foreground mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Data Collection</h2>
            <p>
              When you use Vehicle Assist, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Location Data:</strong> To match you with nearby mechanics (only with your explicit permission).</li>
              <li><strong>Device Information:</strong> IP address, browser type, and operating system to ensure platform stability.</li>
              <li><strong>Voluntary Information:</strong> Any feedback, mechanic submissions, or contact forms you fill out.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Data</h2>
            <p>
              Your data is strictly used to provide, maintain, and improve our emergency roadside assistance platform. We do not sell your personal information to third parties. 
              Location data is only used temporarily during your active session to find nearby help.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Sharing</h2>
            <p>
              We may share necessary details (such as your approximate location and vehicle issue) with mechanics or service providers on the platform so they can assist you. These professionals are independent entities and are bound by their own privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or how your data is handled, please use our Feedback page to get in touch with our administration team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
