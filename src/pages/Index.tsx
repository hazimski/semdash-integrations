import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { FeatureCard } from "@/components/FeatureCard";
import { Container } from "@/components/Container";
import { Laptop, Zap, Shield } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <Navigation />
      <Hero />
      
      <section id="features" className="py-20 bg-slate-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium tracking-tight text-slate-900">
              Features
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to build modern websites
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll">
              <FeatureCard
                icon={<Laptop className="h-6 w-6" />}
                title="Responsive Design"
                description="Build websites that look great on any device with our responsive design system."
              />
            </div>
            <div className="animate-on-scroll">
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Fast Performance"
                description="Optimize your website's performance with our lightweight components."
              />
            </div>
            <div className="animate-on-scroll">
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Secure by Default"
                description="Keep your website secure with our built-in security features."
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Index;