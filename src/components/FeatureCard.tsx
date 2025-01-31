interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="glass rounded-2xl p-8 transition-all duration-300 hover:translate-y-[-4px]">
      <div className="inline-flex items-center justify-center rounded-xl bg-white/5 p-3">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-medium text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-700">{description}</p>
    </div>
  );
}