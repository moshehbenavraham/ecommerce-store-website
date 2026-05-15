import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import AboutSidebar from "../../components/about/AboutSidebar";
import SEO from "../../components/SEO";

const CARE_EMAIL = "care@lineajewelry.com";
const CARE_ENDPOINT = (import.meta.env.VITE_CONTACT_FORM_ENDPOINT as string | undefined)?.trim() || "";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  orderNumber: string;
  message: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  orderNumber: "",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CustomerCare = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const usesEmailFallback = !CARE_ENDPOINT;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_RE.test(form.email.trim())) {
      next.email = "Please enter a valid email address";
    }
    if (form.message.trim().length < 10) {
      next.message = "Please share at least a sentence about your inquiry";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      if (usesEmailFallback) {
        // Honest fallback: open the visitor's mail client with a prefilled draft
        // rather than pretending to send via a non-existent endpoint.
        const subject = encodeURIComponent(
          `Customer Care inquiry from ${form.firstName} ${form.lastName}`
        );
        const bodyLines = [
          `Name: ${form.firstName} ${form.lastName}`,
          `Email: ${form.email}`,
          form.orderNumber ? `Order: ${form.orderNumber}` : "",
          "",
          form.message,
        ].filter(Boolean);
        const body = encodeURIComponent(bodyLines.join("\n"));
        window.location.href = `mailto:${CARE_EMAIL}?subject=${subject}&body=${body}`;
        toast.success("Opening your email app — review and send to finish.");
      } else {
        const res = await fetch(CARE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        toast.success("Thanks — we'll get back to you within 24 hours.");
        setForm(initialState);
      }
    } catch (err) {
      console.error("Customer care form submission failed", err);
      toast.error("Something went wrong. Please email us directly at care@lineajewelry.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Customer Care"
        description="Reach Linea's customer care team for shipping, returns, warranty, sizing, jewelry care, and authentication questions."
        path="/about/customer-care"
      />
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>

        <main id="main-content" className="w-full lg:w-[70vw] lg:ml-auto px-6">
        <PageHeader
          title="Customer Care"
          subtitle="We're here to help you with all your jewelry needs"
        />

        <ContentSection title="Contact Information">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-foreground">Phone</h3>
              <p className="text-muted-foreground">
                <a href="tel:+15551234567" className="hover:text-foreground transition-colors">
                  +1 (555) 123-4567
                </a>
              </p>
              <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM EST<br />Sat: 10AM-4PM EST</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-foreground">Email</h3>
              <p className="text-muted-foreground">
                <a
                  href={`mailto:${CARE_EMAIL}`}
                  className="hover:text-foreground transition-colors"
                >
                  {CARE_EMAIL}
                </a>
              </p>
              <p className="text-sm text-muted-foreground">Response within 24 hours</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-foreground">Live Chat</h3>
              <Button variant="outline" className="rounded-none">
                Start Chat
              </Button>
              <p className="text-sm text-muted-foreground">Available during business hours</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Frequently Asked Questions">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="shipping" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                What are your shipping options and timeframes?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We offer free standard shipping (3-5 business days) on orders over $500. Express shipping (1-2 business days) is available for $25. All orders are fully insured and require signature confirmation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="returns" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                What is your return and exchange policy?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We offer a 30-day return policy for unworn items in original condition. Custom and engraved pieces are final sale. Returns are free with our prepaid return label.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="warranty" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                What warranty do you offer on your jewelry?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                All LINEA jewelry comes with a lifetime warranty against manufacturing defects. This includes free repairs for normal wear and tear, stone tightening, and professional cleaning.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sizing" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                Can I resize my jewelry after purchase?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, we offer free ring resizing within 60 days of purchase (up to 2 sizes). Additional resizing is available for a service fee. Some designs cannot be resized due to their construction.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                How should I care for my LINEA jewelry?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Store pieces separately in soft pouches, avoid contact with chemicals and cosmetics, and clean gently with a soft cloth. We recommend professional cleaning every 6-12 months.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="authentication" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                How can I verify the authenticity of my jewelry?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Every LINEA piece comes with a certificate of authenticity and is hallmarked. You can verify authenticity on our website using your unique piece number or contact our customer care team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ContentSection>

        <ContentSection title="Contact Form">
          <div>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate aria-label="Customer care contact form">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="cc-first-name" className="text-sm font-light text-foreground">
                    First Name <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="cc-first-name"
                    name="firstName"
                    className="rounded-none"
                    placeholder="Enter your first name"
                    autoComplete="given-name"
                    required
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={errors.firstName ? "cc-first-name-error" : undefined}
                  />
                  {errors.firstName && (
                    <p id="cc-first-name-error" role="alert" className="text-xs text-destructive">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="cc-last-name" className="text-sm font-light text-foreground">
                    Last Name <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="cc-last-name"
                    name="lastName"
                    className="rounded-none"
                    placeholder="Enter your last name"
                    autoComplete="family-name"
                    required
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={errors.lastName ? "cc-last-name-error" : undefined}
                  />
                  {errors.lastName && (
                    <p id="cc-last-name-error" role="alert" className="text-xs text-destructive">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="cc-email" className="text-sm font-light text-foreground">
                  Email <span aria-hidden="true">*</span>
                </label>
                <Input
                  id="cc-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  className="rounded-none"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "cc-email-error" : undefined}
                />
                {errors.email && (
                  <p id="cc-email-error" role="alert" className="text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="cc-order" className="text-sm font-light text-foreground">
                  Order Number (Optional)
                </label>
                <Input
                  id="cc-order"
                  name="orderNumber"
                  className="rounded-none"
                  placeholder="Enter your order number if applicable"
                  autoComplete="off"
                  value={form.orderNumber}
                  onChange={(e) => update("orderNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cc-message" className="text-sm font-light text-foreground">
                  How can we help you? <span aria-hidden="true">*</span>
                </label>
                <Textarea
                  id="cc-message"
                  name="message"
                  className="rounded-none min-h-[120px]"
                  placeholder="Please describe your inquiry in detail"
                  required
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "cc-message-error" : undefined}
                />
                {errors.message && (
                  <p id="cc-message-error" role="alert" className="text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full rounded-none" disabled={submitting}>
                {submitting ? "Sending…" : usesEmailFallback ? "Send via Email" : "Send Message"}
              </Button>
              {usesEmailFallback && (
                <p className="text-xs text-muted-foreground text-center">
                  Submitting opens your email app with a prefilled draft to{" "}
                  <a href={`mailto:${CARE_EMAIL}`} className="underline hover:text-foreground">
                    {CARE_EMAIL}
                  </a>
                  .
                </p>
              )}
            </form>
          </div>
        </ContentSection>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerCare;
