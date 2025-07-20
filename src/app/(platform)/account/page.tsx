
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useUser } from '@/context/user-context';
import { useToast } from '@/hooks/use-toast';
import { useAccount, type Account } from '@/context/account-context';
import { Copy, CheckCircle, User, Download, Upload, Eye, EyeOff, QrCode, Shield } from 'lucide-react';

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
})

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [importKey, setImportKey] = useState("");
  const [importedAccount, setImportedAccount] = useState<Account | null>(null);
  const [exportAccount, setExportAccount] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { user, updateUser } = useUser();
  const { importAccount, isLoading } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: user,
  })

  useEffect(() => {
    form.reset(user);
  }, [user, form]);

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    updateUser(values);
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully.",
    });
  }

  const handleImportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = importAccount(importKey);
    if (result.success && result.account) {
      setImportedAccount(result.account);
      setImportKey('');
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (!navigator.clipboard) {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Clipboard API is not available in this browser.',
      });
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: `${fieldName} Copied`,
          description: `Your ${fieldName.toLowerCase()} has been copied to the clipboard.`,
        });
      },
      (err) => {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: `Could not copy ${fieldName.toLowerCase()}.`,
        });
        console.error('Failed to copy text: ', err);
      }
    );
  };

  const handleDownloadBackup = () => {
    if (!exportAccount || !exportAccount.publicKey || !exportAccount.secretKey) {
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Account data is not available to download.',
        });
        return;
    }

    const backupData = {
        publicKey: exportAccount.publicKey,
        secretKey: exportAccount.secretKey,
        note: "This file contains your secret key. Keep it safe and do not share it.",
        exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `felix-account-backup-${exportAccount.publicKey.substring(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
        title: 'Backup Downloading',
        description: 'Your account backup file has started downloading.',
    });
  };

  // Fetch wallet keys from backend when Export tab is selected
  useEffect(() => {
    if (activeTab === "export" && user.email) {
      setIsExportLoading(true);
      setExportError(null);
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/wallets/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || data.message || "Failed to fetch wallet keys");
          }
          return res.json();
        })
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data[0]) {
            setExportAccount({ publicKey: data.data[0].public_key, secretKey: data.data[0].secret });
          } else {
            throw new Error("Invalid response from server");
          }
        })
        .catch((err) => {
          setExportError(err.message);
          setExportAccount(null);
        })
        .finally(() => setIsExportLoading(false));
    }
  }, [activeTab, user.email]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100' 
        : 'opacity-0'
    }`}>
      {/* Floating Elements */}
      <div className="fixed -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce pointer-events-none"></div>
      <div className="fixed -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-15 animate-pulse pointer-events-none"></div>
      
      <div className={`transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Account Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your profile, export and import your Stellar account.
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="export"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Account
              </TabsTrigger>
              <TabsTrigger 
                value="import"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Account
              </TabsTrigger>
        </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                  Update your username and email address. This is separate from your Stellar wallet.
                </CardDescription>
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</FormLabel>
                          <FormControl>
                              <Input 
                                placeholder="Your username" 
                                {...field}
                                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</FormLabel>
                          <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Your email address" 
                                {...field}
                                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      <Button 
                        type="submit"
                        className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group text-white hover:text-blue-200 focus-visible:outline-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span className="transition-colors duration-200 group-hover:text-blue-500">Save Changes</span>
                      </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
        </TabsContent>
            
            <TabsContent value="export" className="mt-6">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Export Your Account</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                        Save your account details securely. Keep your Secret Key private and never share it.
                    </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        {isExportLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
                      </div>
                        ) : exportError ? (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                        {exportError}
                      </div>
                        ) : exportAccount ? (
                          <>
                            <div>
                          <Label htmlFor="publicKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Key</Label>
                                <div className="relative">
                            <Input 
                              id="publicKey" 
                              readOnly 
                              value={exportAccount.publicKey} 
                              className="pr-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70" 
                            />
                                    <Button 
                                        type="button" 
                                        size="icon" 
                                        variant="ghost" 
                              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                                        onClick={() => handleCopy(exportAccount.publicKey, "Public Key")}
                                        disabled={isExportLoading}
                                    >
                                        <Copy className="h-4 w-4 transition-colors duration-200 group-hover:text-green-600" />
                                        <span className="sr-only">Copy Public Key</span>
                                    </Button>
                                </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Share this to receive funds.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                            <Label htmlFor="secretKeyInput" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key</Label>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setShowSecretKey(!showSecretKey)} 
                              disabled={isExportLoading}
                              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                            >
                              {showSecretKey ? 
                                <EyeOff className="w-3 h-3 mr-1 transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" /> : 
                                <Eye className="w-3 h-3 mr-1 transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                              }
                              <span className="transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{showSecretKey ? "Hide" : "Show"}</span>
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input 
                                        id="secretKeyInput"
                                        readOnly 
                                        value={showSecretKey ? exportAccount.secretKey : "S" + "•".repeat(55)} 
                                        type={showSecretKey ? "text" : "password"} 
                              className="pr-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70"
                                    />
                                    <Button 
                                        type="button" 
                                        size="icon" 
                                        variant="ghost" 
                              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                                        onClick={() => handleCopy(exportAccount.secretKey, "Secret Key")}
                                        disabled={isExportLoading}
                                    >
                                        <Copy className="h-4 w-4 transition-colors duration-200 group-hover:text-green-600" />
                                        <span className="sr-only">Copy Secret Key</span>
                                    </Button>
                                </div>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            <Shield className="w-3 h-3 inline mr-1" />
                            <strong>Warning:</strong> Never share your secret key.
                          </p>
                            </div>
                          </>
                        ) : (
                      <div className="text-center p-8 text-gray-600 dark:text-gray-400">No account data available.</div>
                        )}
                    </div>
                  <div className="flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                       {isExportLoading || !exportAccount ? (
                      <div className="w-[200px] h-[200px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                       ) : (
                         <Image 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${exportAccount.publicKey}`}
                           alt="Stellar Account QR Code" 
                           width={200} height={200}
                           data-ai-hint="qr code"
                        className="rounded-lg w-full max-w-[200px] h-auto"
                         />
                       )}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <QrCode className="w-4 h-4" />
                      <p className="text-sm">Scan to get public key</p>
                    </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadBackup} 
                    disabled={isExportLoading || !exportAccount}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200 group"
                  >
                    <Download className="mr-2 h-4 w-4 transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-400" />
                    <span className="transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">Download Backup</span>
                  </Button>
                </CardFooter>
            </Card>
        </TabsContent>
            
            <TabsContent value="import" className="mt-6">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              {!importedAccount ? (
                <form onSubmit={handleImportSubmit}>
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Import an Existing Stellar Account</CardTitle>
                          <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                        Enter your secret key to import an existing account. This will replace your current session's wallet.
                        </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                        <Label htmlFor="secretKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key</Label>
                            <Textarea 
                                id="secretKey"
                                placeholder="Starts with 'S'..."
                                value={importKey}
                                onChange={(e) => setImportKey(e.target.value)}
                                required
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit"
                        className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group text-white hover:text-blue-200 focus-visible:outline-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        <span className="transition-colors duration-200 group-hover:text-blue-500">Import Account</span>
                      </Button>
                    </CardFooter>
                </form>
              ) : (
                <>
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        Account Imported Successfully
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                        This account is now active in your session. You can view it on the "Export Account" tab.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="importedPublicKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">Imported Public Key</Label>
                           <div className="relative">
                          <Input 
                            id="importedPublicKey" 
                            readOnly 
                            value={importedAccount.publicKey} 
                            className="pr-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70" 
                          />
                              <Button 
                                  type="button" 
                                  size="icon" 
                                  variant="ghost" 
                            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                                  onClick={() => handleCopy(importedAccount.publicKey, 'Public Key')}
                              >
                                  <Copy className="h-4 w-4 transition-colors duration-200 group-hover:text-green-600" />
                                  <span className="sr-only">Copy Public Key</span>
                              </Button>
                          </div>
                      </div>
                      <div>
                        <Label htmlFor="importedSecretKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">Imported Secret Key</Label>
                           <div className="relative">
                          <Input 
                            id="importedSecretKey" 
                            readOnly 
                            value={"S" + "•".repeat(55)} 
                            type="password" 
                            className="pr-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70" 
                          />
                          </div>
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setImportedAccount(null)}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                      >
                        <Upload className="mr-2 h-4 w-4 transition-colors duration-200 group-hover:text-blue-600" />
                          <span className="transition-colors duration-200 group-hover:text-blue-600">Import Another Account</span>
                      </Button>
                  </CardFooter>
                </>
              )}
            </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  )
}
