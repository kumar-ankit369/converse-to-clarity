export const SentimentChart = () => {
  // Mock data for the sentiment chart
  const data = [
    { day: "Mon", sentiment: 7.2 },
    { day: "Tue", sentiment: 8.1 },
    { day: "Wed", sentiment: 6.8 },
    { day: "Thu", sentiment: 8.5 },
    { day: "Fri", sentiment: 9.1 },
    { day: "Sat", sentiment: 7.6 },
    { day: "Sun", sentiment: 8.2 }
  ];

  return (
    <div className="h-64 relative">
      {/* Simple line chart visualization */}
      <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
        {data.map((point, index) => (
          <div key={point.day} className="flex flex-col items-center gap-2">
            <div 
              className="w-8 bg-gradient-primary rounded-t"
              style={{ height: `${(point.sentiment / 10) * 180}px` }}
            ></div>
            <span className="text-xs text-muted-foreground">{point.day}</span>
          </div>
        ))}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 text-xs text-muted-foreground">
        <span>10</span>
        <span>5</span>
        <span>0</span>
      </div>
      
      {/* Current value indicator */}
      <div className="absolute top-4 right-4 bg-card border rounded-lg px-3 py-2 shadow-soft">
        <div className="text-xs text-muted-foreground">Current</div>
        <div className="text-lg font-bold text-primary">8.2</div>
      </div>
    </div>
  );
};