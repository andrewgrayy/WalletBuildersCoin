import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Sparkles, Code, Coins, ArrowRight, Zap, Lock, Cpu } from 'lucide-react';
import { Button } from '../components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Wallet Builder",
      description: "Create and manage multiple Ethereum wallets with military-grade security"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Token Creator",
      description: "Mint your own ERC-20 tokens in seconds with customizable parameters"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Smart Contracts",
      description: "Generate production-ready Solidity contracts using GPT-5.2 intelligence"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Full Web3 Suite",
      description: "Complete blockchain toolkit for developers and crypto enthusiasts"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        
        <div className="relative z-10 container mx-auto px-6 py-24 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-sm bg-primary/5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-primary uppercase tracking-wider">The Obsidian Forge</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-foreground max-w-4xl">
              Build The <span className="text-primary">Future</span> of Crypto
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Your complete Web3 arsenal. Create wallets, mint tokens, and generate smart contracts 
              with AI-powered precision. No coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                data-testid="get-started-btn"
                onClick={() => navigate('/dashboard')}
                className="button-primary text-lg px-8 py-6"
              >
                Launch App <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                data-testid="create-wallet-btn"
                onClick={() => navigate('/create-wallet')}
                className="button-outline text-lg px-8 py-6"
              >
                Create Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">FORGE YOUR EMPIRE</h2>
          <div className="beam-line mx-auto w-24 my-6" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              data-testid={`feature-card-${index}`}
              className="wallet-card p-8 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="glass rounded-xl p-12 md:p-16 text-center space-y-6">
          <div className="flex justify-center gap-4 text-primary mb-4">
            <Lock className="w-6 h-6" />
            <Cpu className="w-6 h-6" />
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">READY TO BUILD?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join the next generation of crypto builders. Start creating your decentralized empire today.
          </p>
          <Button 
            data-testid="cta-start-building-btn"
            onClick={() => navigate('/dashboard')}
            className="button-primary text-lg px-10 py-6 mt-6"
          >
            Start Building Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground text-sm font-mono">
            Powered by Ethereum • Built with AI • Secured by Design
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;