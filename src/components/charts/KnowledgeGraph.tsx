export const KnowledgeGraph = () => {
  const nodes = [
    { id: "sarah", name: "Sarah", expertise: "Frontend", x: 30, y: 20, connections: 4 },
    { id: "mike", name: "Mike", expertise: "Backend", x: 70, y: 30, connections: 6 },
    { id: "alex", name: "Alex", expertise: "DevOps", x: 50, y: 60, connections: 3 },
    { id: "emma", name: "Emma", expertise: "Design", x: 20, y: 70, connections: 2 },
    { id: "tom", name: "Tom", expertise: "Data", x: 80, y: 70, connections: 5 }
  ];

  return (
    <div className="h-64 relative bg-muted/20 rounded-lg overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Sample connections */}
        <line x1="30%" y1="20%" x2="70%" y2="30%" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
        <line x1="70%" y1="30%" x2="50%" y2="60%" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
        <line x1="30%" y1="20%" x2="20%" y2="70%" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
        <line x1="50%" y1="60%" x2="80%" y2="70%" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
      </svg>
      
      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className="relative group cursor-pointer">
            <div 
              className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium"
              style={{ 
                transform: `scale(${0.8 + (node.connections / 10)})` 
              }}
            >
              <span className="text-xs font-bold text-white">
                {node.name.charAt(0)}
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-card border rounded-lg px-3 py-2 shadow-medium whitespace-nowrap">
                <div className="text-sm font-medium">{node.name}</div>
                <div className="text-xs text-muted-foreground">{node.expertise}</div>
                <div className="text-xs text-muted-foreground">{node.connections} connections</div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card border rounded-lg px-3 py-2 shadow-soft">
        <div className="text-xs text-muted-foreground">Team Network</div>
        <div className="text-sm font-medium">{nodes.length} members</div>
      </div>
    </div>
  );
};