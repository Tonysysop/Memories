import {
    Gift,
    Activity,
    Upload,
    QrCode,
    Palette,
    ShieldCheck
} from "lucide-react";

const FeaturesSection = () => {
    const features = [
        {
            icon: Gift,
            title: "Seamless Cash Gifting",
            description: "Allow guests to send cash gifts directly to you. Secure, transparent, and integrated into your event page.",
            highlight: true
        },
        {
            icon: Activity,
            title: "Real-time Live Feed",
            description: "Watch memories unfold as they happen. Photos, videos, and messages appear instantly on a dynamic live wall.",
            highlight: true
        },
        {
            icon: Upload,
            title: "App-free Uploads",
            description: "No downloads required. Guests simply scan a QR code and start sharing their favorite moments.",
        },
        {
            icon: QrCode,
            title: "QR Code Sharing",
            description: "Personalized QR codes for every event. Print them on table cards or display them on screens.",
        },
        {
            icon: Palette,
            title: "Custom Event Branding",
            description: "Tailor your event page to match your theme. Add custom cover images and choose your event type.",
        },
        {
            icon: ShieldCheck,
            title: "Secure & Private",
            description: "You have full control. Approve uploads before they go live and keep your memories safe.",
        },
    ];

    return (
        <section id="features" className="py-24 md:py-32 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section header */}
                <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        Powerful Features
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                        Everything You Need for a <span className="text-gradient-primary">Perfect Event</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        From instant photo sharing to secure cash gifting, we've got all the tools to make your celebration unforgettable.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`group bg-card rounded-2xl border border-border p-8 card-elevated transition-all duration-300 hover:border-primary/50 ${feature.highlight ? "ring-2 ring-primary/10 bg-primary/5 md:col-span-1" : ""
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${feature.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                }`}>
                                <feature.icon className="w-7 h-7" />
                            </div>

                            <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
