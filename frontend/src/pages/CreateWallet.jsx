import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, Copy, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateWallet = () => {
  const navigate = useNavigate();
  const [walletName, setWalletName] = useState('My Wallet');
  const [createdWallet, setCreatedWallet] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const createWallet = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/wallet/create`, {
        name: walletName
      });
      setCreatedWallet(response.data);
      toast.success('Wallet created successfully!');
    } catch (error) {
      toast.error('Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success(`${label} copied to clipboard!`);
        } catch (err) {
          toast.error('Failed to copy. Please copy manually.');
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Button 
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">Create Wallet</h1>
            <p className="text-muted-foreground">Generate a new Ethereum wallet</p>
          </div>

          {!createdWallet ? (
            <Card className="wallet-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  New Wallet
                </CardTitle>
                <CardDescription>
                  Your wallet will be generated instantly with a unique address and private key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Wallet Name</label>
                  <Input
                    data-testid="wallet-name-input"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="Enter wallet name"
                    className="bg-input/50 border-border focus:border-primary font-mono"
                  />
                </div>

                <Button 
                  data-testid="generate-wallet-btn"
                  onClick={createWallet}
                  disabled={loading || !walletName}
                  className="button-primary w-full"
                >
                  {loading ? 'Generating...' : 'Generate Wallet'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card className="wallet-card border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <CheckCircle className="w-6 h-6" />
                    <CardTitle>Wallet Created Successfully!</CardTitle>
                  </div>
                  <CardDescription>
                    Store your private key securely. You'll need it to access your wallet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Wallet Address</label>
                    <div className="flex gap-2">
                      <Input
                        data-testid="wallet-address-display"
                        value={createdWallet.address}
                        readOnly
                        className="bg-black border-primary/30 font-mono text-primary"
                      />
                      <Button
                        data-testid="copy-address-btn"
                        onClick={() => copyToClipboard(createdWallet.address, 'Address')}
                        className="button-outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-destructive">Private Key (Keep Secret!)</label>
                    <div className="flex gap-2">
                      <Input
                        data-testid="private-key-display"
                        value={createdWallet.private_key}
                        type={showPrivateKey ? 'text' : 'password'}
                        readOnly
                        className="bg-black border-destructive/30 font-mono text-destructive"
                      />
                      <Button
                        data-testid="toggle-private-key-visibility-btn"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="button-outline border-destructive/50 text-destructive"
                      >
                        {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        data-testid="copy-private-key-btn"
                        onClick={() => copyToClipboard(createdWallet.private_key, 'Private Key')}
                        className="button-outline border-destructive/50 text-destructive"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="glass p-4 rounded-sm space-y-2">
                    <p className="text-sm font-semibold text-destructive">⚠️ Security Warning</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Never share your private key with anyone</li>
                      <li>• Store it in a secure location (hardware wallet, password manager)</li>
                      <li>• Losing your private key means losing access to your funds</li>
                      <li>• This wallet is generated client-side for maximum security</li>
                    </ul>
                  </div>

                  <Button 
                    data-testid="go-to-dashboard-btn"
                    onClick={() => navigate('/dashboard')}
                    className="button-primary w-full"
                  >
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWallet;