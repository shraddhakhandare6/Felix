
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
import { useAccount } from '@/context/account-context';

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
})

export default function AccountPage() {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [importKey, setImportKey] = useState("");
  
  const { user, updateUser } = useUser();
  const { account, importAccount } = useAccount();
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
    importAccount(importKey);
    setImportKey('');
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account Management</h1>

      <Tabs defaultValue="profile">
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
                        <div>
                            <Label htmlFor="publicKey">Public Key</Label>
                            <Input id="publicKey" readOnly value={account.publicKey} />
                            <p className="text-xs text-muted-foreground mt-1">Share this to receive funds.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="secretKeyInput">Secret Key</Label>
                                <Button variant="outline" size="sm" onClick={() => setShowSecretKey(!showSecretKey)}>
                                    {showSecretKey ? 'Hide' : 'Show'}
                                </Button>
                            </div>
                             <Input 
                                id="secretKeyInput"
                                readOnly 
                                value={showSecretKey ? account.secretKey : "S" + "•".repeat(55)} 
                                type={showSecretKey ? "text" : "password"} 
                             />
                            <p className="text-xs text-muted-foreground mt-1"><strong>Warning:</strong> Never share your secret key.</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-2 bg-secondary p-4 rounded-lg">
                       <Image 
                         src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${account.publicKey}`}
                         alt="Stellar Account QR Code" 
                         width={200} height={200}
                         data-ai-hint="qr code"
                         className="rounded-md w-full max-w-[200px] h-auto"
                       />
                       <p className="text-sm text-muted-foreground">Scan to get public key</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary">Download Backup</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="import">
            <Card>
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
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
