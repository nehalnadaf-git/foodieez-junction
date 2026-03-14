"use client";

import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { motion } from "framer-motion";

const AboutSection = () => (
  <section id="about" className="py-14 md:py-24 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px]
                      rounded-full bg-primary/5 blur-[120px]" />
    </div>

    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* Left — story */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-label mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Our Story
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-8">
            Al Aqsa's <br />
            <span className="text-gradient italic">Foodieez Junction</span>
          </h2>
          <p className="text-muted-foreground font-body leading-[1.9] mb-5 text-sm md:text-base">
            Hubballi's favourite local street food spot! Al Aqsa's Foodieez Junction serves authentic
            street-style fast food that's freshly made, hygienic, and packed with bold flavors. From
            steaming hot momos near Bengeri to sizzling Chicken 65, every dish is prepared with love.
          </p>
          <p className="text-muted-foreground font-body leading-[1.9] text-sm md:text-base">
            Craving the best fast food in Hubballi? Visit us near Modi Medical, Bengeri — unforgettable
            noodles, chicken rice, and takeaway food worth coming back for.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-primary/10">
            {[
              { title: "Freshly Cooked", desc: "Made on order only" },
              { title: "Authenticity",  desc: "True street flavors" },
              { title: "Hygienic Prep", desc: "Quality ingredients" },
            ].map((pillar) => (
              <div key={pillar.title}>
                <p className="font-accent text-[11px] font-black uppercase tracking-wider text-primary mb-1">{pillar.title}</p>
                <p className="text-xs text-muted-foreground/80 font-body leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — info card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass card-hover p-8 md:p-10 space-y-7"
        >
          {[
            { icon: MapPin,  label: "Address", value: "Main Road, near Modi Medical, Bengeri, Vidya Nagar, Hubballi 580023" },
            { icon: Phone,   label: "Phone",   value: "+91 97438 62836" },
            { icon: Clock,   label: "Hours",   value: "Open Daily: 2:00 PM – 11:00 PM" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-accent uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-foreground/85 font-body leading-relaxed">{item.value}</p>
                </div>
              </motion.div>
            );
          })}

          <div className="section-divider" />

          <a
            href="https://maps.app.goo.gl/gPfC6myQrq2Xps6d8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-primary
                       text-primary-foreground font-heading font-semibold text-sm shimmer
                       glow-on-hover hover:scale-[1.04] transition-all"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </a>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;

