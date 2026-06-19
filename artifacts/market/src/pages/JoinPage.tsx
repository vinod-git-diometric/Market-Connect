import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import UnitedMainHeader from "@/components/UnitedMainHeader";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface FormState {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  website: string;
}

export default function JoinPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${BASE}/api/vendor-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <UnitedMainHeader />

      <div className="max-w-xl mx-auto px-5 py-12">
        <nav className="mb-8">
          <Link
            href="/market"
            className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span aria-hidden>←</span> Stoneham Farmers Market
          </Link>
        </nav>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center py-12"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl italic text-foreground mb-3">
              Application received
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Thanks for your interest in vending at the Stoneham Farmers Market. You'll hear back within 2 business days.
            </p>
            <Link
              href="/market"
              className="inline-block mt-8 text-[11px] font-sans uppercase tracking-widest text-primary hover:underline"
            >
              Back to the market
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-2">
              Stoneham Farmers Market
            </p>
            <h1 className="font-serif text-4xl italic text-foreground mb-2">
              Join as a vendor
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Interested in selling at the market? Fill out the form below and we'll be in touch within 2 business days.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="businessName" className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">
                  Business name <span className="text-primary">*</span>
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Your business name"
                  className="w-full bg-transparent border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">
                  Your name <span className="text-primary">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="First and last name"
                  className="w-full bg-transparent border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">
                  Phone <span className="text-primary">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(617) 555-0123"
                  className="w-full bg-transparent border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="website" className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">
                  Website <span className="text-muted-foreground/50 normal-case tracking-normal text-xs">(optional)</span>
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://yourbusiness.com"
                  className="w-full bg-transparent border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full bg-primary text-primary-foreground font-sans text-sm font-medium rounded-[4px] px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Submit application"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
