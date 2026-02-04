import { QrCode, Share2, Images, ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: Images,
      title: "Create Event",
      description: "Set up your event page in seconds. Add a name, date, and customize the look to match your celebration.",
    },
    {
      number: "02",
      icon: Share2,
      title: "Share Link or QR",
      description: "Get a unique link and QR code to share with your guests via text, email, or print at your venue.",
    },
    {
      number: "03",
      icon: QrCode,
      title: "Collect Memories",
      description: "Guests upload photos, videos, and messages instantly—no app downloads or signups required.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple & Easy
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to capture every precious moment from your special event.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line - desktop only */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="bg-card rounded-2xl border border-border p-8 card-elevated h-full relative overflow-hidden">
                {/* Step number background */}
                <span className="absolute -top-4 -right-4 text-8xl font-display font-bold text-muted/30 select-none">
                  {step.number}
                </span>
                
                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow indicator for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6">
                    <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>

              {/* Step connector dot - desktop */}
              <div className="hidden md:flex absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-card border-2 border-primary items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
