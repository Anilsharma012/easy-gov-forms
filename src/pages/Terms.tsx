import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Terms & Conditions
            </h1>
            <p className="mb-8 text-muted-foreground">Last updated: January 2024</p>

            <div className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing and using Easy Gov Forms ("the Platform"), you accept and agree to be bound by 
                    these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">2. Description of Services</h2>
                  <p className="text-muted-foreground">
                    Easy Gov Forms provides an AI-assisted platform for filling and submitting government job 
                    application forms. Our services include document storage, form auto-fill, application tracking, 
                    and deadline reminders.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">3. User Accounts</h2>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>You must provide accurate and complete information during registration</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must be at least 18 years old to use our services</li>
                    <li>One person may only create one account</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">4. Packages and Payments</h2>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>Packages are non-transferable between users</li>
                    <li>Form credits expire as per the validity period of each package</li>
                    <li>Prices are subject to change with prior notice</li>
                    <li>All payments are processed through secure payment gateways</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">5. User Responsibilities</h2>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>Ensure all uploaded documents are genuine and belong to you</li>
                    <li>Verify all auto-filled information before submission</li>
                    <li>Keep track of application deadlines</li>
                    <li>Do not share your account with others</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">6. Disclaimer</h2>
                  <p className="text-muted-foreground">
                    Easy Gov Forms is a form-filling assistance platform. We do not guarantee job selection or 
                    application acceptance. Final decisions rest with the respective government authorities. 
                    Users must verify all information before submission.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">7. Intellectual Property</h2>
                  <p className="text-muted-foreground">
                    All content, features, and functionality of the Platform are owned by Easy Gov Forms and 
                    are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    Easy Gov Forms shall not be liable for any indirect, incidental, special, or consequential 
                    damages arising from your use of the Platform, including but not limited to missed deadlines, 
                    rejected applications, or technical issues.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">9. Termination</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to suspend or terminate your account if you violate these terms. 
                    Upon termination, your right to use the Platform will immediately cease.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">10. Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    We may modify these terms at any time. Continued use of the Platform after changes 
                    constitutes acceptance of the modified terms.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">11. Contact Us</h2>
                  <p className="text-muted-foreground">
                    For questions about these Terms & Conditions, please contact us at:{" "}
                    <a href="mailto:legal@easygovforms.com" className="text-primary hover:underline">
                      legal@easygovforms.com
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
