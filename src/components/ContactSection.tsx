"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSocialLinks } from "@/utils/social";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ContactSection = () => {
  const [whatsappLink, setWhatsappLink] = useState("https://wa.me/919743862836");

  useEffect(() => {
    const config = getSocialLinks();
    const wa = config.links.find((l) => l.platform === "whatsapp");
    if (wa && wa.url) {
      setWhatsappLink(wa.url);
    }
  }, []);

  return (
  <section id="contact" className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                      rounded-full bg-primary/5 blur-[160px]" />
    </div>

    <div className="max-w-3xl mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <div className="section-label mb-6 mx-auto w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Stay Connected
        </div>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-4">
          Connect <span className="text-gradient italic">With Us</span>
        </h2>
        <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto mb-10 leading-relaxed">
          Order via WhatsApp for fresh food delivered or ready for pickup.
        </p>

        {/* WhatsApp CTA */}
        <motion.a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-heading
                     font-semibold text-base shimmer mb-10 shadow-lg transition-all"
          style={{
            background: "rgba(37, 211, 102, 0.10)",
            border: "1px solid rgba(37, 211, 102, 0.28)",
            color: "hsl(145 60% 58%)",
            boxShadow: "0 0 32px rgba(37, 211, 102, 0.08)"
          }}
        >
          <WhatsAppIcon />
          Chat on WhatsApp
        </motion.a>
      </motion.div>
    </div>
  </section>
  );
};

export default ContactSection;
