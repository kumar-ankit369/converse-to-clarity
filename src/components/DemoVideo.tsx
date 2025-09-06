import { Button } from "@/components/ui/button";
import { Play, CheckCircle } from "lucide-react";

export const DemoVideo = () => {
  return (
    <section id="demo-video" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">See It In Action</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Watch How Converse to Clarity Works
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how our AI transforms your team's conversations into actionable insights 
            in just 2 minutes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Video Container */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
            <div className="aspect-video relative">
              {/* YouTube Video Embed */}
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=example&autoplay=0&rel=0&modestbranding=1"
                title="Converse to Clarity Demo"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Play Button Overlay (hidden when video loads) */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20"
                  onClick={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                      iframe.src = iframe.src.replace('autoplay=0', 'autoplay=1');
                    }
                  }}
                >
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </Button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get instant insights as your team communicates
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">
                Discover patterns and bottlenecks automatically
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Actionable Reports</h3>
              <p className="text-sm text-muted-foreground">
                Export detailed analytics for your team
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="mr-4">
              <a href="/register">Start Your Free Trial</a>
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
