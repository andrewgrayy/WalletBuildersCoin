import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, Plus, Download, Coins, FileCode, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get(`${API}/wallets`);
      setWallets(response.data);
    } catch (error) {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Wallet",
      description: "Generate new Ethereum wallet",
      icon: <Wallet className="w-6 h-6" />,
      path: "/create-wallet",
      testId: "quick-action-create-wallet"
    },
    {
      title: "Import Wallet",
      description: "Import existing wallet",
      icon: <Download className="w-6 h-6" />,
      path: "/import-wallet",
      testId: "quick-action-import-wallet"
    },
    {
      title: "Create Token",
      description: "Mint your own ERC-20 token",
      icon: <Coins className="w-6 h-6" />,
      path: "/token-creator",
      testId: "quick-action-create-token"
    },
    {
      title: "AI Contract Writer",
      description: "Generate smart contracts with AI",
      icon: <FileCode className="w-6 h-6" />,
      path: "/contract-writer",
      testId: "quick-action-contract-writer"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-heading uppercase tracking-tight">Obsidian Forge</h1>
            <Button 
              data-testid="back-to-landing-btn"
              onClick={() => navigate('/')}
              variant="outline"
              className="button-outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">COMMAND CENTER</h2>
          <p className="text-muted-foreground">Your Web3 operations hub</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold uppercase tracking-wide">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                data-testid={action.testId}
                className="wallet-card cursor-pointer group"
                onClick={() => navigate(action.path)}
              >
                <CardHeader>
                  <div className="text-primary mb-2 group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Wallets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold uppercase tracking-wide">Your Wallets</h3>
            <Button 
              data-testid="add-wallet-btn"
              onClick={() => navigate('/create-wallet')}
              className="button-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Wallet
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading wallets...</div>
          ) : wallets.length === 0 ? (
            <Card className="wallet-card">
              <CardContent className="py-12 text-center space-y-4">
                <Wallet className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">No Wallets Yet</h4>
                  <p className="text-muted-foreground mb-4">Create or import your first wallet to get started</p>
                  <Button 
                    data-testid="create-first-wallet-btn"
                    onClick={() => navigate('/create-wallet')}
                    className="button-primary"
                  >
                    Create Wallet <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallets.map((wallet, index) => (
                <Card 
                  key={index}
                  data-testid={`wallet-card-${index}`}
                  className="wallet-card"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      {wallet.name}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs break-all">
                      {wallet.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(wallet.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;