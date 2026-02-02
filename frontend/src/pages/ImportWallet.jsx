import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ImportWallet = () => {
  const navigate = useNavigate();
  const [walletName, setWalletName] = useState('Imported Wallet');
  const [privateKey, setPrivateKey] = useState('');
  const [importedWallet, setImportedWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  const importWallet = async () => {
    if (!privateKey) {
      toast.error('Please enter a private key');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/wallet/import`, {
        private_key: privateKey,
        name: walletName
      });
      setImportedWallet(response.data);
      toast.success('Wallet imported successfully!');
    } catch (error) {
      toast.error('Failed to import wallet. Check your private key.');
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">Import Wallet</h1>
            <p className="text-muted-foreground">Import an existing Ethereum wallet using your private key</p>
          </div>

          {!importedWallet ? (
            <Card className="wallet-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Import Existing Wallet
                </CardTitle>
                <CardDescription>
                  Enter your private key to import an existing wallet
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-destructive">Private Key</label>
                  <Input
                    data-testid="private-key-input"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="0x..."
                    type="password"
                    className="bg-black border-destructive/30 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Your private key is never stored on our servers</p>
                </div>

                <div className="glass p-4 rounded-sm space-y-2">
                  <p className="text-sm font-semibold text-primary">ℹ️ Important</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Private keys start with '0x' followed by 64 hexadecimal characters</li>
                    <li>• Make sure you're on a secure connection</li>
                    <li>• Your key is processed locally for security</li>
                  </ul>
                </div>

                <Button 
                  data-testid="import-wallet-btn"
                  onClick={importWallet}
                  disabled={loading || !privateKey || !walletName}
                  className="button-primary w-full"
                >
                  {loading ? 'Importing...' : 'Import Wallet'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card className="wallet-card border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <CheckCircle className="w-6 h-6" />
                    <CardTitle>Wallet Imported Successfully!</CardTitle>
                  </div>
                  <CardDescription>
                    Your wallet has been imported and is ready to use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wallet Name</label>
                    <Input
                      data-testid="imported-wallet-name-display"
                      value={importedWallet.name}
                      readOnly
                      className="bg-input/50 border-border font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Wallet Address</label>
                    <Input
                      data-testid="imported-wallet-address-display"
                      value={importedWallet.address}
                      readOnly
                      className="bg-black border-primary/30 font-mono text-primary"
                    />
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

export default ImportWallet;