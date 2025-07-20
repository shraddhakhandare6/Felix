
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EntityCreationForm } from '@/components/admin/entity-creation-form';
import { UserCreationForm } from '@/components/admin/user-creation-form';
import { AssetCreationForm } from '@/components/admin/asset-creation-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEntities, type Entity } from '@/context/entity-context';
import { usePlatformUsers, type PlatformUser } from '@/context/platform-users-context';
import { useAssets } from '@/context/asset-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Users, Building2, Coins, Shield, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { FancyLoader } from '@/components/ui/fancy-loader';
import { IssueAssetDialog } from '@/components/dialogs/issue-asset-dialog';

// A unified type for recipients to simplify dialog handling
interface Recipient {
  name: string;
  email: string;
  isEntity: boolean;
}

export default function AdminPage() {
  const { users } = usePlatformUsers();
  const { entities } = useEntities();
  const { assets, isLoading, error } = useAssets();
  const router = useRouter();
  const { roles, loading: authLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEntityDialogOpen, setIsEntityDialogOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isIssueAssetDialogOpen, setIsIssueAssetDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  
  // Pagination for Users
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const userRecordsPerPage = 5;
  const userTotalPages = Math.ceil(users.length / userRecordsPerPage);
  const userIndexOfLastRecord = userCurrentPage * userRecordsPerPage;
  const userIndexOfFirstRecord = userIndexOfLastRecord - userRecordsPerPage;
  const currentUserRecords = users.slice(userIndexOfFirstRecord, userIndexOfLastRecord);

  // Pagination for Entities
  const [entityCurrentPage, setEntityCurrentPage] = useState(1);
  const entityRecordsPerPage = 5;
  const entityTotalPages = Math.ceil(entities.length / entityRecordsPerPage);
  const entityIndexOfLastRecord = entityCurrentPage * entityRecordsPerPage;
  const entityIndexOfFirstRecord = entityIndexOfLastRecord - entityRecordsPerPage;
  const currentEntityRecords = entities.slice(entityIndexOfFirstRecord, entityIndexOfLastRecord);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      const isAdmin = roles.includes('realm-admin');
      if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [roles, authLoading, router]);

  const handleEntityClick = (entityId: string) => {
    router.push(`/entity?entityId=${entityId}`);
  };

  const handleIssueAssetClick = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsIssueAssetDialogOpen(true);
  };

  if (isLoading) {
    return <FancyLoader />;
  }

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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Admin Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create and manage users, entities, and assets within the platform.
        </p>
            </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Create User</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Create a new user and assign them to a group.
            </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardFooter>
                <Button 
                  onClick={() => setIsUserDialogOpen(true)}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                >
              <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create User</span>
            </Button>
          </CardFooter>
        </Card>
        
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Entity</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Create a new entity like a project or a department.
            </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardFooter>
                <Button 
                  onClick={() => setIsEntityDialogOpen(true)}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                >
              <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create Entity</span>
            </Button>
          </CardFooter>
        </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Asset</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Define a new asset by providing an asset code.
            </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardFooter>
                <Button 
                  onClick={() => setIsAssetDialogOpen(true)}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                >
               <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create Asset</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create User</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new user and assign them to a group.
            </DialogDescription>
          </DialogHeader>
          <UserCreationForm onSuccess={() => setIsUserDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEntityDialogOpen} onOpenChange={setIsEntityDialogOpen}>
            <DialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create Entity</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new entity like a project or a department.
            </DialogDescription>
          </DialogHeader>
          <EntityCreationForm onSuccess={() => setIsEntityDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
            <DialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create Asset</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
              Define a new asset by providing an asset code.
            </DialogDescription>
          </DialogHeader>
          <AssetCreationForm onSuccess={() => setIsAssetDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <IssueAssetDialog 
        open={isIssueAssetDialogOpen}
        onOpenChange={setIsIssueAssetDialogOpen}
        recipient={selectedRecipient}
      />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Managed Users</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                      The list of users you have created.
                    </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
                <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <Table>
              <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Email</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Group</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                      {currentUserRecords.map((user, index) => (
                        <TableRow 
                          key={user.id}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">{user.name}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{user.email}</TableCell>
                    <TableCell>
                            <Badge 
                              variant="outline"
                              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700"
                            >
                              {user.group}
                            </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleIssueAssetClick({ ...user, isEntity: false })}
                              className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-colors duration-200 group"
                            >
                              <Coins className="w-3 h-3 mr-1" />
                            Issue Asset
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                </div>
          </CardContent>
           <CardFooter>
            <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {userCurrentPage} of {userTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={userCurrentPage === 1}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-800 hover:text-white hover:border-blue-800 dark:hover:bg-green-900 dark:hover:text-green-300 dark:hover:border-green-400 transition-colors duration-200"
                >
                      <ChevronLeft className="w-3 h-3 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserCurrentPage((prev) => Math.min(prev + 1, userTotalPages))}
                  disabled={userCurrentPage === userTotalPages}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-800 hover:text-white hover:border-blue-800 dark:hover:bg-green-900 dark:hover:text-green-300 dark:hover:border-green-400 transition-colors duration-200"
                >
                  Next
                      <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Managed Entities</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                      The list of entities you have created.
                    </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
                <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <Table>
              <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Owner</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                      {currentEntityRecords.map((entity, index) => (
                        <TableRow 
                          key={entity.id}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                    <TableCell 
                            className="font-medium cursor-pointer hover:underline text-blue-600 dark:text-blue-400"
                      onClick={() => handleEntityClick(entity.id)}
                    >
                      {entity.name}
                    </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{entity.ownerEmail}</TableCell>
                    <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleIssueAssetClick({ name: entity.name, email: entity.ownerEmail, isEntity: true })}
                              className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-colors duration-200 group"
                            >
                              <Coins className="w-3 h-3 mr-1" />
                            Issue Asset
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {entityCurrentPage} of {entityTotalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEntityCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={entityCurrentPage === 1}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-green-900 hover:text-green-300 hover:border-green-400 dark:hover:bg-blue-800 dark:hover:text-white dark:hover:border-blue-800 transition-colors duration-200"
                  >
                      <ChevronLeft className="w-3 h-3 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEntityCurrentPage((prev) => Math.min(prev + 1, entityTotalPages))}
                    disabled={entityCurrentPage === entityTotalPages}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-green-900 hover:text-green-300 hover:border-green-400 dark:hover:bg-blue-800 dark:hover:text-white dark:hover:border-blue-800 transition-colors duration-200"
                  >
                    Next
                      <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
          </CardFooter>
        </Card>

            <Card className="lg:col-span-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Managed Assets</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                      The list of assets you have created.
                    </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading assets...</span>
                  </div>
            ) : error ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                  </div>
            ) : assets.length === 0 ? (
                  <div className="text-center p-8">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                      <Coins className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Assets Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Create your first asset to get started.</p>
                  </div>
            ) : (
                  <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
              <Table>
                <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Asset Code</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Asset ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                        {assets.map((asset, index) => (
                          <TableRow 
                            key={asset.id}
                            className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-medium text-gray-900 dark:text-gray-100">{asset.asset_code}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{asset.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                  </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
