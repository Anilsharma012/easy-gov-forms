import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Refund = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Refund Policy
            </h1>
            <p className="mb-8 text-muted-foreground">Last updated: January 2024</p>

            <div className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">1. Overview</h2>
                  <p className="text-muted-foreground">
                    At Easy Gov Forms, we strive to provide the best possible service. This Refund Policy 
                    outlines the conditions under which refunds may be granted for purchased packages.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">2. Refund Eligibility</h2>
                  <h3 className="mb-2 font-medium text-foreground">Full Refund (within 7 days of purchase):</h3>
                  <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>No form credits have been used from the package</li>
                    <li>Technical issues on our end prevented service delivery</li>
                    <li>Duplicate payment occurred</li>
                  </ul>
                  <h3 className="mb-2 font-medium text-foreground">Partial Refund:</h3>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>Pro-rated refund if less than 50% of credits have been used</li>
                    <li>Subject to review and approval by our team</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">3. Non-Refundable Cases</h2>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>More than 7 days have passed since purchase</li>
                    <li>More than 50% of credits have been used</li>
                    <li>Application rejection by government authorities (not our responsibility)</li>
                    <li>User error in document upload or form verification</li>
                    <li>Expired packages (past validity period)</li>
                    <li>Violation of our Terms & Conditions</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">4. How to Request a Refund</h2>
                  <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
                    <li>Log in to your account and go to Support</li>
                    <li>Create a new ticket with subject "Refund Request"</li>
                    <li>Provide your order ID and reason for refund</li>
                    <li>Our team will review within 3-5 business days</li>
                    <li>If approved, refund will be processed within 7-10 business days</li>
                  </ol>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">5. Refund Method</h2>
                  <p className="text-muted-foreground">
                    Refunds will be credited to the original payment method used for the purchase:
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>UPI payments: 3-5 business days</li>
                    <li>Credit/Debit cards: 7-10 business days</li>
                    <li>Net banking: 5-7 business days</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">6. Package Upgrades</h2>
                  <p className="text-muted-foreground">
                    Instead of a refund, you may choose to upgrade your package. The remaining value 
                    of your current package will be adjusted against the new package price.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">7. Technical Issues</h2>
                  <p className="text-muted-foreground">
                    If you experience technical issues that prevent you from using our services, please 
                    contact support immediately. We will work to resolve the issue or provide appropriate 
                    compensation (credits extension or refund).
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">8. Contact Us</h2>
                  <p className="text-muted-foreground">
                    For refund-related queries, contact us at:{" "}
                    <a href="mailto:billing@easygovforms.com" className="text-primary hover:underline">
                      billing@easygovforms.com
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

export default Refund;
