import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only - just show success
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Contact <span className="text-primary">Support</span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Have questions or need help? We're here for you 24/7. Reach out through any channel below.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Email Us</h3>
                <p className="mb-2 text-sm text-muted-foreground">For general inquiries and support</p>
                <a href="mailto:support@easygovforms.com" className="text-primary hover:underline">
                  support@easygovforms.com
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Call Us</h3>
                <p className="mb-2 text-sm text-muted-foreground">Mon-Sat, 9 AM - 9 PM IST</p>
                <a href="tel:+919876543210" className="text-primary hover:underline">
                  +91 98765 43210
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">WhatsApp</h3>
                <p className="mb-2 text-sm text-muted-foreground">Quick responses via WhatsApp</p>
                <a href="https://wa.me/919876543210" className="text-primary hover:underline">
                  Chat on WhatsApp
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Office Address</h3>
                <p className="text-sm text-muted-foreground">
                  Easy Gov Forms Pvt Ltd<br />
                  123, Business Park Tower<br />
                  Connaught Place, New Delhi - 110001
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Send us a Message</h2>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form and we'll get back to you within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="payment">Payment Issue</SelectItem>
                          <SelectItem value="application">Application Help</SelectItem>
                          <SelectItem value="technical">Technical Problem</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your query in detail..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Response time notice */}
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Average response time:</span> We typically respond within 2-4 hours during business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
