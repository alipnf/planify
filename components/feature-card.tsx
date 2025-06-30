interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group relative h-full">
      <div className="h-full flex flex-col bg-muted/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
        <div className="size-12 flex items-center justify-center rounded-xl bg-primary text-white mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mt-auto">
          {description}
        </p>
      </div>
    </div>
  );
}
