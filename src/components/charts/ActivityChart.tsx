export const ActivityChart = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const activityData = [
    2, 1, 0, 0, 0, 0, 1, 3, 8, 12, 15, 18, 22, 25, 20, 18, 15, 12, 8, 6, 4, 3, 2, 1
  ];

  const maxActivity = Math.max(...activityData);

  return (
    <div className="h-64 relative">
      {/* Heatmap-style activity chart */}
      <div className="grid grid-cols-12 gap-1 h-full p-4">
        {hours.map((hour) => (
          <div key={hour} className="flex flex-col gap-1">
            <div 
              className="flex-1 rounded"
              style={{
                backgroundColor: `hsl(var(--primary) / ${(activityData[hour] / maxActivity) * 0.8 + 0.1})`
              }}
            ></div>
            {hour % 4 === 0 && (
              <span className="text-xs text-muted-foreground text-center">
                {hour.toString().padStart(2, '0')}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card border rounded-lg px-3 py-2 shadow-soft">
        <div className="text-xs text-muted-foreground mb-1">Peak Hour</div>
        <div className="text-lg font-bold text-primary">14:00</div>
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Activity Level by Hour
      </div>
    </div>
  );
};