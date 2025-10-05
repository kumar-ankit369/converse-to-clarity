import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, MessageSquare, TrendingUp, Shield, Zap, PlayCircle, Star, Users, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 lg:py-32">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      
      <div className="container relative mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            {/* Trust badges */}
            <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                <Brain className="w-4 h-4 mr-2" />
                Enterprise-Grade AI
              </Badge>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white text-sm ml-2">Trusted by 1000+ teams</span>
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Transform{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Conversations
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full opacity-60"></div>
              </span>{" "}
              into{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Clarity
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 rounded-full opacity-60"></div>
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Unlock the hidden value in your team communications with enterprise-grade AI analytics. 
              Transform chat data into actionable insights, identify bottlenecks, track sentiment, 
              and optimize collaboration across your entire organization.
            </p>
            
            {/* Key benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-xl">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Real-time insights & alerts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Easy integration & setup</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Advanced AI recommendations</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                asChild 
                size="lg" 
                className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl text-lg px-8 py-6"
              >
                <a href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6"
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <PlayCircle className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Social proof */}
            <div className="flex items-center gap-8 justify-center lg:justify-start text-slate-300 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>1M+ conversations analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>40% productivity increase</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative w-full max-w-2xl mx-auto">
              {/* Enhanced Dashboard mockup with more detailed design */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Header with better styling */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="w-48 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                        <div className="w-32 h-2 bg-white/30 rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-white text-sm">Live</div>
                      </div>
                    </div>
                    
                    {/* Enhanced Metrics Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30">
                        <CardContent className="p-4 space-y-2">
                          <div className="w-full h-2 bg-purple-400 rounded-full"></div>
                          <div className="w-3/4 h-6 bg-white/50 rounded"></div>
                          <div className="w-1/2 h-2 bg-white/30 rounded"></div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30">
                        <CardContent className="p-4 space-y-2">
                          <div className="w-full h-2 bg-blue-400 rounded-full"></div>
                          <div className="w-4/5 h-6 bg-white/50 rounded"></div>
                          <div className="w-2/3 h-2 bg-white/30 rounded"></div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30">
                        <CardContent className="p-4 space-y-2">
                          <div className="w-full h-2 bg-green-400 rounded-full"></div>
                          <div className="w-2/3 h-6 bg-white/50 rounded"></div>
                          <div className="w-1/3 h-2 bg-white/30 rounded"></div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Enhanced Chart Area with animation */}
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <div className="h-40 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-end justify-between p-2">
                            <div className="w-6 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t h-20 animate-pulse"></div>
                            <div className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t h-32 animate-pulse delay-100"></div>
                            <div className="w-6 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t h-24 animate-pulse delay-200"></div>
                            <div className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t h-36 animate-pulse delay-300"></div>
                            <div className="w-6 bg-gradient-to-t from-green-500 to-green-300 rounded-t h-28 animate-pulse delay-400"></div>
                            <div className="w-6 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t h-32 animate-pulse delay-500"></div>
                            <div className="w-6 bg-gradient-to-t from-pink-500 to-pink-300 rounded-t h-30 animate-pulse delay-600"></div>
                          </div>
                          {/* Chart grid lines */}
                          <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                            <div className="h-px bg-white"></div>
                            <div className="h-px bg-white"></div>
                            <div className="h-px bg-white"></div>
                            <div className="h-px bg-white"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Enhanced Activity Items */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="w-36 h-3 bg-white/40 rounded-full"></div>
                          <div className="w-28 h-2 bg-white/25 rounded-full"></div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="w-32 h-3 bg-white/40 rounded-full"></div>
                          <div className="w-24 h-2 bg-white/25 rounded-full"></div>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                          Trending
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Enhanced Floating elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="absolute top-1/2 -right-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-xl opacity-50 animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};