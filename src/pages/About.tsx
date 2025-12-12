import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Target, Heart, Shield, Users, Award, Rocket } from "lucide-react";

const stats = [
  { label: "Users", value: "50,000+" },
  { label: "Forms Submitted", value: "2,00,000+" },
  { label: "Success Rate", value: "99.5%" },
  { label: "Support Tickets Resolved", value: "15,000+" },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're on a mission to simplify government job applications for every Indian citizen.",
  },
  {
    icon: Heart,
    title: "User-First",
    description: "Every feature we build is designed with our users' needs and challenges in mind.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Your data security is our top priority. We use bank-grade encryption for all data.",
  },
  {
    icon: Users,
    title: "Inclusive",
    description: "We make government jobs accessible to everyone, regardless of technical expertise.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              About <span className="text-primary">Easy Gov Forms</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We're building India's most trusted platform for government job applications. 
              Our AI-powered system makes form filling accurate, fast, and stress-free.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="mb-6 text-center text-2xl font-bold text-foreground md:text-3xl">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Easy Gov Forms was born from a simple observation: applying for government jobs in India 
                  is unnecessarily complicated. Candidates spend hours filling the same information across 
                  multiple forms, often making errors that lead to rejection.
                </p>
                <p>
                  In 2023, our founders - a team of engineers and government exam aspirants - decided to 
                  change this. We built an AI-powered platform that automates the tedious parts of form 
                  filling while ensuring 100% accuracy.
                </p>
                <p>
                  Today, Easy Gov Forms helps thousands of aspirants apply for government jobs with 
                  confidence. Our document vault stores your information securely, and our AI fills 
                  forms in seconds - not hours.
                </p>
                <p>
                  We believe everyone deserves a fair shot at government jobs, regardless of their 
                  technical skills. That's why we've made our platform simple enough for anyone to use.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                Our Values
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                These core values guide everything we do at Easy Gov Forms.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards/Recognition */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              Recognition & Trust
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Easy Gov Forms is trusted by aspirants across India and recognized for our 
              commitment to security and user experience.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="rounded-xl border border-border bg-card px-6 py-4">
                <p className="font-semibold text-foreground">ISO 27001 Certified</p>
                <p className="text-sm text-muted-foreground">Information Security</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-6 py-4">
                <p className="font-semibold text-foreground">Startup India</p>
                <p className="text-sm text-muted-foreground">Recognized Startup</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-6 py-4">
                <p className="font-semibold text-foreground">DPIIT Registered</p>
                <p className="text-sm text-muted-foreground">Government Recognized</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
              Join Our Growing Community
            </h2>
            <p className="mb-6 text-primary-foreground/80">
              Start your government job journey with Easy Gov Forms today.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
