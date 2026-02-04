import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small gatherings and personal events.",
      storage: "1GB",
      features: [
        "1GB storage",
        "Up to 50 guest uploads",
        "QR code & shareable link",
        "Basic event page",
        "7-day download window",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Premium",
      price: "$9",
      period: "/month",
      description: "Ideal for weddings, parties, and larger celebrations.",
      storage: "5GB",
      features: [
        "5GB storage",
        "Unlimited guest uploads",
        "QR code & shareable link",
        "Custom event branding",
        "Unlimited download access",
        "Priority support",
        "HD video uploads",
        "Remove watermarks",
      ],
      cta: "Start Premium",
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade when you need more space for your memories.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card rounded-2xl border p-8 ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl font-semibold mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-3">
                  <span className="font-display text-5xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Storage highlight */}
              <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-center">
                <span className="text-3xl font-display font-bold text-primary">
                  {plan.storage}
                </span>
                <span className="text-muted-foreground ml-2">storage</span>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Button
                className={`w-full ${
                  plan.popular
                    ? ""
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          No credit card required for free plan. Cancel premium anytime.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
