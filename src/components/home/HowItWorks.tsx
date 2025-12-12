import { UserPlus, Upload, Cpu, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register & Buy Package",
    description: "Create your account and choose a package that suits your needs. Quick and easy setup!",
  },
  {
    icon: Upload,
    title: "Upload Documents",
    description: "Upload your documents once to our secure vault. Aadhaar, PAN, photo, certificates - all in one place.",
  },
  {
    icon: Cpu,
    title: "AI-Assisted Form Filling",
    description: "Our AI automatically fills forms using your saved data. Review and confirm before submission.",
  },
  {
    icon: CheckCircle,
    title: "Track & Get Reminders",
    description: "Track your application status and get timely reminders for deadlines. Never miss an opportunity!",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Apply for government jobs in 4 simple steps. Our platform handles the complexity so you can focus on preparation.
          </p>
        </div>

        <div className="relative">
          {/* Connection line - desktop */}
          <div className="absolute left-0 right-0 top-20 hidden h-0.5 bg-border lg:block" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step number with icon */}
                <div className="relative mx-auto mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-soft mx-auto">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                    {index + 1}
                  </div>
                </div>

                <h3 className="mb-3 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
