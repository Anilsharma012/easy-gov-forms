import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { mockPackages } from "@/data/mockData";
import { Check, Star, Zap } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Choose Your <span className="text-primary">Package</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Select a package that fits your needs. Apply for multiple government jobs with AI-assisted form filling.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mockPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border bg-card p-6 transition-all ${
                  pkg.popular
                    ? "border-primary shadow-soft scale-105"
                    : "border-border hover:border-primary/50 hover:shadow-card"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-xl font-bold text-foreground">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.forms} Form Applications</p>
                </div>

                <div className="mb-6 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-foreground">₹{pkg.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-through">
                    ₹{pkg.originalPrice}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Save {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
                  </span>
                </div>

                <ul className="mb-6 space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ Teaser */}
          <div className="mt-16 rounded-2xl bg-muted/50 p-8 text-center md:p-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Have Questions?</h2>
            <p className="mb-6 text-muted-foreground">
              Check out our frequently asked questions or contact our support team.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="outline" asChild>
                <Link to="/how-it-works">How It Works</Link>
              </Button>
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
