import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, User } from "lucide-react";

interface Blocker {
  id: string;
  title: string;
  duration: string;
  participants: string[];
  urgency: "high" | "medium" | "low";
}

export const BlockerBoard = () => {
  const blockers: Blocker[] = [
    {
      id: "1",
      title: "API Integration Issue",
      duration: "3 days",
      participants: ["Sarah", "Mike"],
      urgency: "high"
    },
    {
      id: "2", 
      title: "Database Migration",
      duration: "2 days",
      participants: ["Alex", "Tom", "Lisa"],
      urgency: "medium"
    },
    {
      id: "3",
      title: "Code Review Pending",
      duration: "1 day",
      participants: ["Emma"],
      urgency: "low"
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {blockers.map((blocker) => (
        <div key={blocker.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${getUrgencyColor(blocker.urgency)}`} />
            <div className="flex-1 space-y-2">
              <h4 className="font-medium text-sm">{blocker.title}</h4>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{blocker.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{blocker.participants.length} people</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-7">
                Notify Team
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};