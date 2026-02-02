import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileCode, ArrowLeft, Copy, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContractWriter = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [generatedContract, setGeneratedContract] = useState(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    "Create a simple NFT collection contract with 10,000 max supply",
    "Build a staking contract that rewards users with tokens",
    "Generate a multisig wallet contract requiring 2 of 3 signatures",
    "Create a lottery contract where users buy tickets with ETH"
  ];

  const generateContract = async () => {
    if (!description.trim()) {
      toast.error('Please describe what you want to build');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/contract/generate`, {
        description: description
      });
      setGeneratedContract(response.data);
      toast.success('Smart contract generated successfully!');
    } catch (error) {
      toast.error('Failed to generate contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedContract.contract_code);
        toast.success('Contract code copied to clipboard!');
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = generatedContract.contract_code;
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">AI Contract Writer</h1>
            <p className="text-muted-foreground">Generate production-ready smart contracts using GPT-5.2</p>
          </div>

          {!generatedContract ? (
            <div className="space-y-6">
              <Card className="wallet-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-primary" />
                    Describe Your Smart Contract
                  </CardTitle>
                  <CardDescription>
                    Tell the AI what you want to build, and it will generate the complete Solidity code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contract Description</label>
                    <Textarea
                      data-testid="contract-description-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Example: Create an ERC-721 NFT contract with whitelist minting, maximum supply of 5000, and royalty support..."
                      rows={6}
                      className="bg-input/50 border-border focus:border-primary resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Quick Examples:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {examples.map((example, index) => (
                        <button
                          key={index}
                          data-testid={`example-${index}`}
                          onClick={() => setDescription(example)}
                          className="text-left p-3 glass rounded-sm hover:border-primary/50 transition-colors text-sm"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    data-testid="generate-contract-btn"
                    onClick={generateContract}
                    disabled={loading || !description.trim()}
                    className="button-primary w-full"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        AI is generating your contract...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Smart Contract
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="wallet-card">
                <CardContent className="py-6">
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-primary">✨ Powered by GPT-5.2</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Generates secure, well-commented Solidity code</li>
                      <li>• Follows best practices and security standards</li>
                      <li>• Includes comprehensive error handling</li>
                      <li>• Production-ready with OpenZeppelin libraries</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card className="wallet-card border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-primary mb-2">
                        <Sparkles className="w-6 h-6" />
                        Contract Generated Successfully!
                      </CardTitle>
                      <CardDescription>{generatedContract.explanation}</CardDescription>
                    </div>
                    <Button
                      data-testid="copy-contract-btn"
                      onClick={copyCode}
                      className="button-primary"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated Smart Contract</label>
                    <div className="terminal" data-testid="generated-contract-display">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{generatedContract.contract_code}</pre>
                    </div>
                  </div>

                  <div className="glass p-4 rounded-sm space-y-2">
                    <p className="text-sm font-semibold text-primary">🚀 Deployment Guide</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>1. Copy the contract code above</li>
                      <li>2. Open Remix IDE (remix.ethereum.org)</li>
                      <li>3. Create a new file and paste the code</li>
                      <li>4. Compile with Solidity ^0.8.20</li>
                      <li>5. Deploy to testnet first (Sepolia recommended)</li>
                      <li>6. Test thoroughly before mainnet deployment</li>
                      <li>7. Consider getting a security audit for production</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      data-testid="generate-another-btn"
                      onClick={() => {
                        setGeneratedContract(null);
                        setDescription('');
                      }}
                      className="button-outline flex-1"
                    >
                      Generate Another
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

export default ContractWriter;