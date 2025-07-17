
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
import { Copy, CheckCircle } from 'lucide-react';

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

  const { user, updateUser } = useUser();
  const { importAccount, isLoading } = useAccount();
  const { toast } = useToast();

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
      fetch("http://localhost:5000/api/v1/wallets/export", {
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="export">Export Account</TabsTrigger>
            <TabsTrigger value="import">Import Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your username and email address. This is separate from your Stellar wallet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Changes</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="export">
            <Card>
                <CardHeader>
                    <CardTitle>Export Your Account</CardTitle>
                    <CardDescription>
                        Save your account details securely. Keep your Secret Key private and never share it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        {isExportLoading ? (
                          <div>Loading...</div>
                        ) : exportError ? (
                          <div className="text-red-500">{exportError}</div>
                        ) : exportAccount ? (
                          <>
                            <div>
                                <Label htmlFor="publicKey">Public Key</Label>
                                <div className="relative">
                                    <Input id="publicKey" readOnly value={exportAccount.publicKey} className="pr-10" />
                                    <Button 
                                        type="button" 
                                        size="icon" 
                                        variant="ghost" 
                                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                                        onClick={() => handleCopy(exportAccount.publicKey, "Public Key")}
                                        disabled={isExportLoading}
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="sr-only">Copy Public Key</span>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Share this to receive funds.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="secretKeyInput">Secret Key</Label>
                                    <Button variant="outline" size="sm" onClick={() => setShowSecretKey(!showSecretKey)} disabled={isExportLoading}>
                                        {showSecretKey ? "Hide" : "Show"}
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input 
                                        id="secretKeyInput"
                                        readOnly 
                                        value={showSecretKey ? exportAccount.secretKey : "S" + "•".repeat(55)} 
                                        type={showSecretKey ? "text" : "password"} 
                                        className="pr-10"
                                    />
                                    <Button 
                                        type="button" 
                                        size="icon" 
                                        variant="ghost" 
                                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                                        onClick={() => handleCopy(exportAccount.secretKey, "Secret Key")}
                                        disabled={isExportLoading}
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="sr-only">Copy Secret Key</span>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1"><strong>Warning:</strong> Never share your secret key.</p>
                            </div>
                          </>
                        ) : (
                          <div>No account data available.</div>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-2 bg-secondary p-4 rounded-lg">
                       {isExportLoading || !exportAccount ? (
                         <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded-md" />
                       ) : (
                         <Image 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${exportAccount.publicKey}`}
                           alt="Stellar Account QR Code" 
                           width={200} height={200}
                           data-ai-hint="qr code"
                           className="rounded-md w-full max-w-[200px] h-auto"
                         />
                       )}
                       <p className="text-sm text-muted-foreground">Scan to get public key</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" onClick={handleDownloadBackup} disabled={isExportLoading || !exportAccount}>Download Backup</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="import">
            <Card>
              {!importedAccount ? (
                <form onSubmit={handleImportSubmit}>
                    <CardHeader>
                        <CardTitle>Import an Existing Stellar Account</CardTitle>
                        <CardDescription>
                        Enter your secret key to import an existing account. This will replace your current session's wallet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="secretKey">Secret Key</Label>
                            <Textarea 
                                id="secretKey"
                                placeholder="Starts with 'S'..."
                                value={importKey}
                                onChange={(e) => setImportKey(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Import Account</Button>
                    </CardFooter>
                </form>
              ) : (
                <>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        Account Imported Successfully
                      </CardTitle>
                      <CardDescription>
                        This account is now active in your session. You can view it on the "Export Account" tab.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                          <Label htmlFor="importedPublicKey">Imported Public Key</Label>
                           <div className="relative">
                              <Input id="importedPublicKey" readOnly value={importedAccount.publicKey} className="pr-10" />
                              <Button 
                                  type="button" 
                                  size="icon" 
                                  variant="ghost" 
                                  className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                                  onClick={() => handleCopy(importedAccount.publicKey, 'Public Key')}
                              >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Copy Public Key</span>
                              </Button>
                          </div>
                      </div>
                      <div>
                          <Label htmlFor="importedSecretKey">Imported Secret Key</Label>
                           <div className="relative">
                              <Input id="importedSecretKey" readOnly value={"S" + "•".repeat(55)} type="password" className="pr-10" />
                          </div>
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button variant="outline" onClick={() => setImportedAccount(null)}>
                          Import Another Account
                      </Button>
                  </CardFooter>
                </>
              )}
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
