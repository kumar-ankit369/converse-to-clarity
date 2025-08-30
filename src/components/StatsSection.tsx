export const StatsSection = () => {
  const stats = [
    { value: "85%", label: "Productivity Increase" },
    { value: "3.2x", label: "Faster Issue Resolution" },
    { value: "500+", label: "Teams Using InsightFlow" },
    { value: "24/7", label: "Real-time Monitoring" }
  ];

  return (
    <section className="py-16 bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};