import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <CheckCircle className="h-4 w-4" />
              <span>Trusted by 50,000+ Users</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Apply for{" "}
              <span className="text-gradient">Government Jobs</span>{" "}
              Easily
            </h1>

            <p className="text-lg text-muted-foreground md:text-xl">
              AI-assisted, secure, and trackable form submission. Never miss a deadline 
              or make a mistake on your government job applications again.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/govt-jobs">View Government Jobs</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>AI Verified</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto w-full max-w-lg">
              {/* Main card */}
              <div className="animate-float rounded-2xl bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    SSC CGL 2024
                  </span>
                  <span className="text-sm text-muted-foreground">Last Date: 15 Mar</span>
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Combined Graduate Level Exam</h3>
                <p className="mb-4 text-sm text-muted-foreground">8,000+ Vacancies | All India</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">₹100 Fee</span>
                  <Button size="sm">Apply Now</Button>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -left-8 top-20 animate-float rounded-xl bg-card p-4 shadow-card" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Form Submitted</p>
                    <p className="text-xs text-muted-foreground">Railway NTPC</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-16 animate-float rounded-xl bg-card p-4 shadow-card" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">256-bit Encrypted</p>
                    <p className="text-xs text-muted-foreground">Your data is safe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
