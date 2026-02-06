import { Button } from "@/components/ui/button";
import { Check, QrCode, Upload, Link2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const features = [
    { icon: Upload, text: "Guest uploads without signup" },
    { icon: Link2, text: "One link or QR code" },
    { icon: Sparkles, text: "Personalized event page" },
  ];

  return (
    <section className="relative min-h-screen hero-gradient overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-40 pb-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border card-elevated animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                Capture moments that matter
              </span>
            </div>

            {/* Main heading */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Collect Every Memory From Your Event —{" "}
              <span className="text-gradient-primary">In One Place</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Create an event, share a link or QR code, and let guests upload photos, videos, and messages instantly. No apps. No signups.
            </p>

            {/* Feature list */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <Button size="lg" className="text-base font-semibold px-8 py-6 glow-primary hover:scale-105 transition-transform" asChild>
                <Link to="/auth?mode=signup">Create Your Event</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base font-medium px-8 py-6 hover:bg-secondary transition-colors">
                See How It Works
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 justify-center lg:justify-start pt-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,000+</span> memories collected this month
              </div>
            </div>
          </div>

          {/* Right content - Visual cards */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Main card */}
            <div className="relative z-10 w-full max-w-sm bg-card rounded-2xl border border-border card-elevated p-6 animate-scale-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Preview</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-primary" />
                  </div>
                </div>
                
                <h3 className="font-display text-xl font-semibold">Sarah's Birthday 🎂</h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent" />
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-muted border-2 border-card"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">24</span> guests contributing
                  </span>
                </div>
              </div>
            </div>

            {/* Floating card 1 */}
            <div className="absolute top-0 -left-4 lg:left-0 w-48 bg-card rounded-xl border border-border card-elevated p-4 animate-float z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">New upload!</p>
                  <p className="text-xs text-muted-foreground">2 seconds ago</p>
                </div>
              </div>
            </div>

            {/* Floating card 2 */}
            <div className="absolute bottom-10 -right-4 lg:right-0 w-52 bg-card rounded-xl border border-border card-elevated p-4 animate-float-delayed z-20">
              <div className="space-y-2">
                <p className="text-sm font-medium">💬 "Happy Birthday Sarah!"</p>
                <p className="text-xs text-muted-foreground">Message from Uncle Tom</p>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;