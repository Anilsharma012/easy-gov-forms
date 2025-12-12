import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Privacy Policy
            </h1>
            <p className="mb-8 text-muted-foreground">Last updated: January 2024</p>

            <div className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">1. Introduction</h2>
                  <p className="text-muted-foreground">
                    Easy Gov Forms ("we", "our", or "us") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you use our platform.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">2. Information We Collect</h2>
                  <h3 className="mb-2 font-medium text-foreground">Personal Information:</h3>
                  <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>Name, email address, and phone number</li>
                    <li>Date of birth and gender</li>
                    <li>Address and location details</li>
                    <li>Educational qualifications</li>
                    <li>Government ID details (Aadhaar, PAN, etc.)</li>
                  </ul>
                  <h3 className="mb-2 font-medium text-foreground">Documents:</h3>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>Identity documents</li>
                    <li>Educational certificates</li>
                    <li>Photographs and signatures</li>
                    <li>Category certificates (if applicable)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>To fill government job application forms on your behalf</li>
                    <li>To store your documents securely in your personal vault</li>
                    <li>To send notifications about deadlines and application status</li>
                    <li>To provide customer support</li>
                    <li>To improve our services and user experience</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">4. Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement robust security measures to protect your data:
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>256-bit SSL encryption for all data transmission</li>
                    <li>Encrypted storage for all documents and personal information</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Secure data centers with physical security measures</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">5. Data Sharing</h2>
                  <p className="text-muted-foreground">
                    We do NOT sell or rent your personal information. We may share your data only:
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>With government portals when submitting your applications (as authorized by you)</li>
                    <li>With payment processors to complete transactions</li>
                    <li>When required by law or legal process</li>
                    <li>To protect our rights, privacy, safety, or property</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">6. Your Rights</h2>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>Access your personal data stored with us</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Withdraw consent for data processing</li>
                    <li>Export your data in a portable format</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">7. Data Retention</h2>
                  <p className="text-muted-foreground">
                    We retain your data for as long as your account is active or as needed to provide 
                    services. You can request deletion of your data at any time. Some information may 
                    be retained as required by law or for legitimate business purposes.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">8. Cookies and Tracking</h2>
                  <p className="text-muted-foreground">
                    We use cookies and similar technologies to enhance your experience, analyze usage, 
                    and provide personalized content. You can control cookie settings through your browser.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">9. Children's Privacy</h2>
                  <p className="text-muted-foreground">
                    Our services are not intended for individuals under 18 years of age. We do not 
                    knowingly collect personal information from children.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">10. Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    significant changes via email or through the Platform.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">11. Contact Us</h2>
                  <p className="text-muted-foreground">
                    For privacy-related inquiries, please contact our Data Protection Officer at:{" "}
                    <a href="mailto:privacy@easygovforms.com" className="text-primary hover:underline">
                      privacy@easygovforms.com
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

export default Privacy;
