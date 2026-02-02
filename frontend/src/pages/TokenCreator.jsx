import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coins, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TokenCreator = () => {
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    total_supply: '',
    decimals: 18
  });
  const [createdToken, setCreatedToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const createToken = async () => {
    if (!tokenData.name || !tokenData.symbol || !tokenData.total_supply) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/token/create`, {
        name: tokenData.name,
        symbol: tokenData.symbol.toUpperCase(),
        total_supply: parseInt(tokenData.total_supply),
        decimals: parseInt(tokenData.decimals)
      });
      setCreatedToken(response.data);
      toast.success('Token contract generated successfully!');
    } catch (error) {
      toast.error('Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(createdToken.contract_code);
        toast.success('Contract code copied to clipboard!');
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = createdToken.contract_code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Contract code copied to clipboard!');
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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">Token Creator</h1>
            <p className="text-muted-foreground">Create your own ERC-20 token in seconds</p>
          </div>

          {!createdToken ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="wallet-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-primary" />
                    Token Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your token parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Token Name</label>
                    <Input
                      data-testid="token-name-input"
                      value={tokenData.name}
                      onChange={(e) => setTokenData({...tokenData, name: e.target.value})}
                      placeholder="e.g., My Token"
                      className="bg-input/50 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Token Symbol</label>
                    <Input
                      data-testid="token-symbol-input"
                      value={tokenData.symbol}
                      onChange={(e) => setTokenData({...tokenData, symbol: e.target.value.toUpperCase()})}
                      placeholder="e.g., MTK"
                      maxLength={5}
                      className="bg-input/50 border-border focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Supply</label>
                    <Input
                      data-testid="token-supply-input"
                      value={tokenData.total_supply}
                      onChange={(e) => setTokenData({...tokenData, total_supply: e.target.value})}
                      placeholder="e.g., 1000000"
                      type="number"
                      className="bg-input/50 border-border focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Decimals</label>
                    <Input
                      data-testid="token-decimals-input"
                      value={tokenData.decimals}
                      onChange={(e) => setTokenData({...tokenData, decimals: e.target.value})}
                      type="number"
                      className="bg-input/50 border-border focus:border-primary font-mono"
                    />
                  </div>

                  <Button 
                    data-testid="generate-token-btn"
                    onClick={createToken}
                    disabled={loading}
                    className="button-primary w-full mt-6"
                  >
                    {loading ? 'Generating...' : 'Generate Token Contract'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="wallet-card">
                <CardHeader>
                  <CardTitle>Token Preview</CardTitle>
                  <CardDescription>How your token will look</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="glass p-6 rounded-sm space-y-4 text-center">
                    <div className="w-16 h-16 bg-primary/20 border-2 border-primary rounded-full mx-auto flex items-center justify-center">
                      <Coins className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{tokenData.name || 'Token Name'}</h3>
                      <p className="text-primary font-mono text-lg">{tokenData.symbol || 'SYMBOL'}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground">Total Supply</p>
                      <p className="text-xl font-bold font-mono">
                        {tokenData.total_supply ? parseInt(tokenData.total_supply).toLocaleString() : '0'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ ERC-20 Standard</p>
                    <p>✓ OpenZeppelin Contracts</p>
                    <p>✓ Ownable & Mintable</p>
                    <p>✓ Production Ready</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card className="wallet-card border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <CheckCircle className="w-6 h-6" />
                    <CardTitle>Token Contract Generated!</CardTitle>
                  </div>
                  <CardDescription>
                    Your ERC-20 token contract is ready for deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Name</p>
                      <p className="font-semibold">{createdToken.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Symbol</p>
                      <p className="font-semibold font-mono text-primary">{createdToken.symbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                      <p className="font-semibold font-mono">{createdToken.total_supply.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Decimals</p>
                      <p className="font-semibold font-mono">{createdToken.decimals}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Smart Contract Code</label>
                      <Button
                        data-testid="copy-contract-code-btn"
                        onClick={copyCode}
                        className="button-outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" /> Copy Code
                      </Button>
                    </div>
                    <div className="terminal" data-testid="contract-code-display">
                      <pre className="text-xs overflow-x-auto">{createdToken.contract_code}</pre>
                    </div>
                  </div>

                  <div className="glass p-4 rounded-sm space-y-2">
                    <p className="text-sm font-semibold text-primary">📝 Next Steps</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Deploy this contract using Remix IDE or Hardhat</li>
                      <li>• Make sure to test on a testnet first (Sepolia, Goerli)</li>
                      <li>• Verify your contract on Etherscan after deployment</li>
                      <li>• Add liquidity if you plan to list on DEXes</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      data-testid="create-another-token-btn"
                      onClick={() => {
                        setCreatedToken(null);
                        setTokenData({ name: '', symbol: '', total_supply: '', decimals: 18 });
                      }}
                      className="button-outline flex-1"
                    >
                      Create Another
                    </Button>
                    <Button 
                      data-testid="go-to-dashboard-btn"
                      onClick={() => navigate('/dashboard')}
                      className="button-primary flex-1"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenCreator;