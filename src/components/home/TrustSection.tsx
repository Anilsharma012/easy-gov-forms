import { Shield, Lock, Eye, Award, Users, Clock } from "lucide-react";

const trustBadges = [
  {
    icon: Shield,
    title: "256-bit Encryption",
    description: "Your data is protected with bank-grade security",
  },
  {
    icon: Lock,
    title: "No Third-Party Sharing",
    description: "We never share your personal data with anyone",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Track every step of your application process",
  },
  {
    icon: Award,
    title: "Government Certified",
    description: "Authorized platform for form submissions",
  },
  {
    icon: Users,
    title: "50,000+ Users",
    description: "Trusted by thousands across India",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Get help anytime via WhatsApp or call",
  },
];

const TrustSection = () => {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Why Trust Easy Gov Forms?
          </h2>
          <p className="mx-auto max-w-2xl text-primary-foreground/80">
            Your security and privacy are our top priorities. We've built a platform you can rely on.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-xl bg-primary-foreground/10 p-6 backdrop-blur"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20">
                <badge.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-primary-foreground">{badge.title}</h3>
                <p className="text-sm text-primary-foreground/70">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
