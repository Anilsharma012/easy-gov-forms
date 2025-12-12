import { Link } from "react-router-dom";
import { FileText, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Easy<span className="text-primary">Gov</span> Forms
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-assisted, secure, and trackable government form submission platform. Apply for jobs easily!
            </p>
            <div className="flex gap-4">
              <a href="#" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/govt-jobs" className="text-muted-foreground transition-colors hover:text-primary">
                  Government Jobs
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground transition-colors hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-primary">
                  Pricing & Packages
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground transition-colors hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground transition-colors hover:text-primary">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <span>support@easygovforms.com</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground md:flex-row">
            <p>© 2024 Easy Gov Forms. All rights reserved.</p>
            <p>Made with ❤️ for Indian Citizens</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
