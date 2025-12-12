import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Upload,
  Cpu,
  CheckCircle,
  CreditCard,
  FileSearch,
  Bell,
  Shield,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "1. Create Your Account",
    description:
      "Sign up with your mobile number and email. Verify your identity with OTP. It takes less than 2 minutes!",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: CreditCard,
    title: "2. Choose a Package",
    description:
      "Select a package based on how many forms you want to apply for. Pay securely via UPI, cards, or net banking.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Upload,
    title: "3. Upload Your Documents",
    description:
      "Upload your documents once to our secure vault - Aadhaar, PAN, photo, signature, certificates. They're encrypted and safe.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: FileSearch,
    title: "4. Browse & Select Jobs",
    description:
      "Explore thousands of government job listings. Filter by category, location, eligibility, and more.",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Cpu,
    title: "5. AI-Assisted Form Filling",
    description:
      "Our AI automatically fills the application form using your saved documents. Review the pre-filled data and confirm.",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: CheckCircle,
    title: "6. Submit & Track",
    description:
      "Submit your application with one click. Track the status in real-time from your dashboard.",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: Bell,
    title: "7. Get Reminders",
    description:
      "Receive timely notifications about deadlines, new jobs matching your profile, and application status updates.",
    color: "bg-yellow-500/10 text-yellow-600",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "256-bit encryption protects your data. We never share your information with third parties.",
  },
  {
    icon: Cpu,
    title: "AI-Powered Accuracy",
    description: "Our AI ensures error-free form submissions. No more rejected applications due to mistakes.",
  },
  {
    icon: Bell,
    title: "Never Miss Deadlines",
    description: "Get automated reminders before important deadlines. Stay ahead of the competition.",
  },
  {
    icon: CheckCircle,
    title: "Track Everything",
    description: "Real-time status updates for all your applications. Full transparency at every step.",
  },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              How <span className="text-primary">Easy Gov Forms</span> Works
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Apply for government jobs in 7 simple steps. Our platform handles the complexity so you can focus on what matters - your preparation.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-border md:left-1/2 md:block" />

              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`relative flex flex-col gap-6 md:flex-row md:gap-12 ${
                      index % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content */}
                    <div className="flex-1 md:text-right">
                      {index % 2 === 0 && (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                          <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}>
                            <step.icon className="h-6 w-6" />
                          </div>
                          <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="absolute left-8 top-6 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-primary md:left-1/2 md:block" />

                    {/* Content (other side) */}
                    <div className="flex-1">
                      {index % 2 === 1 && (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                          <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}>
                            <step.icon className="h-6 w-6" />
                          </div>
                          <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      )}
                      {index % 2 === 0 && <div className="hidden md:block" />}
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden">
                      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}>
                          <step.icon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Why Choose <span className="text-primary">Easy Gov Forms</span>?
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                We've built the most user-friendly platform for government job applications.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:shadow-card"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl bg-primary p-8 text-center md:p-12">
              <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
                Ready to Start Your Journey?
              </h2>
              <p className="mb-6 text-primary-foreground/80">
                Join 50,000+ users who are already applying for government jobs the easy way.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/register">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/govt-jobs">Browse Jobs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
