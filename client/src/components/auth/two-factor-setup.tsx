import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Mail, Shield, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TwoFactorSetupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TOTPSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export function TwoFactorSetup({ open, onClose, onSuccess }: TwoFactorSetupProps) {
  const [activeTab, setActiveTab] = useState("email");
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [totpSetup, setTotpSetup] = useState<TOTPSetupData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEmailSetup = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/2fa/setup/email");
      if (response.ok) {
        setStep(2);
        toast({
          title: "Verification code sent",
          description: "Check your email for the verification code.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Setup failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "Failed to setup email 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTOTPSetup = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/2fa/setup/totp");
      if (response.ok) {
        const data = await response.json();
        setTotpSetup(data);
        setStep(2);
      } else {
        const error = await response.json();
        toast({
          title: "Setup failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "Failed to setup TOTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/2fa/verify-setup", {
        code: verificationCode,
        method: activeTab,
      });

      if (response.ok) {
        toast({
          title: "2FA enabled",
          description: `Two-factor authentication has been enabled using ${activeTab === 'email' ? 'email' : 'authenticator app'}.`,
        });
        onSuccess();
        onClose();
        resetState();
      } else {
        const error = await response.json();
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard.",
    });
  };

  const resetState = () => {
    setStep(1);
    setVerificationCode("");
    setTotpSetup(null);
    setCopied(false);
    setActiveTab("email");
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetState, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setup Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="totp" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Authenticator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Authentication</CardTitle>
                  <CardDescription>
                    Receive verification codes via email when logging in.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      We'll send a 6-digit code to your email address each time you log in.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleEmailSetup} 
                    disabled={isLoading}
                    className="w-full mt-4"
                  >
                    {isLoading ? "Setting up..." : "Setup Email 2FA"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="totp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Authenticator App</CardTitle>
                  <CardDescription>
                    Use an authenticator app like Google Authenticator, Authy, or 1Password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <QrCode className="h-4 w-4" />
                    <AlertDescription>
                      More secure than email. Works offline and generates time-based codes.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleTOTPSetup} 
                    disabled={isLoading}
                    className="w-full mt-4"
                  >
                    {isLoading ? "Setting up..." : "Setup Authenticator 2FA"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {activeTab === "email" && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  A verification code has been sent to your email. Enter it below to complete setup.
                </AlertDescription>
              </Alert>
            )}

            {activeTab === "totp" && totpSetup && (
              <div className="space-y-4">
                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    Scan the QR code with your authenticator app, then enter the 6-digit code.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <img 
                    src={totpSetup.qrCodeUrl} 
                    alt="TOTP QR Code" 
                    className="border rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Manual Entry Key</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={totpSetup.secret} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(totpSetup.secret)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {totpSetup.backupCodes && (
                  <Alert>
                    <AlertDescription>
                      Save these backup codes in a secure location. You can use them if you lose access to your authenticator app.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleVerifySetup}
                disabled={isLoading || !verificationCode.trim()}
                className="flex-1"
              >
                {isLoading ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}