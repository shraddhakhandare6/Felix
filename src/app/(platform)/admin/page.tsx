'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EntityCreationForm } from '@/components/admin/entity-creation-form';
import { UserCreationForm } from '@/components/admin/user-creation-form';
import { AssetCreationForm } from '@/components/admin/asset-creation-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEntities } from '@/context/entity-context';
import { usePlatformUsers, type PlatformUser } from '@/context/platform-users-context';
import { useAssets } from '@/context/asset-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { PageLoader } from '@/components/page-loader';
import { IssueAssetDialog } from '@/components/dialogs/issue-asset-dialog';

export default function AdminPage() {
  const { users } = usePlatformUsers();
  const { entities } = useEntities();
  const { assets, isLoading, error } = useAssets();
  const router = useRouter();
  const { roles, loading: authLoading } = useAuth();

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEntityDialogOpen, setIsEntityDialogOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isIssueAssetDialogOpen, setIsIssueAssetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const totalPages = Math.ceil(users.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = users.slice(indexOfFirstRecord, indexOfLastRecord);

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

  const handleIssueAssetClick = (user: PlatformUser) => {
    setSelectedUser(user);
    setIsIssueAssetDialogOpen(true);
  };

  if (authLoading || !roles.includes('realm-admin')) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <p className="text-muted-foreground">
          Create and manage users, entities, and assets within the platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
            <CardDescription>
              Create a new user and assign them to a group.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsUserDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Create Entity</CardTitle>
            <CardDescription>
              Create a new entity like a project or a department.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsEntityDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Entity
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Asset</CardTitle>
            <CardDescription>
              Define a new asset by providing an asset code.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsAssetDialogOpen(true)}>
               <PlusCircle className="mr-2 h-4 w-4" />
               Create Asset
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Create a new user and assign them to a group.
            </DialogDescription>
          </DialogHeader>
          <UserCreationForm onSuccess={() => setIsUserDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEntityDialogOpen} onOpenChange={setIsEntityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Entity</DialogTitle>
            <DialogDescription>
              Create a new entity like a project or a department.
            </DialogDescription>
          </DialogHeader>
          <EntityCreationForm onSuccess={() => setIsEntityDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Asset</DialogTitle>
            <DialogDescription>
              Define a new asset by providing an asset code.
            </DialogDescription>
          </DialogHeader>
          <AssetCreationForm onSuccess={() => setIsAssetDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {selectedUser && (
        <IssueAssetDialog 
          open={isIssueAssetDialogOpen}
          onOpenChange={setIsIssueAssetDialogOpen}
          user={selectedUser}
        />
      )}


      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Managed Users</CardTitle>
            <CardDescription>The list of users you have created.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Issue Asset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.group}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleIssueAssetClick(user)}>
                            Issue Asset
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
           <CardFooter>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managed Entities</CardTitle>
            <CardDescription>The list of entities you have created.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entities.map((entity) => (
                  <TableRow key={entity.id} onClick={() => handleEntityClick(entity.id)} className="cursor-pointer">
                    <TableCell className="font-medium">{entity.name}</TableCell>
                    <TableCell>{entity.ownerEmail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managed Assets</CardTitle>
            <CardDescription>The list of assets you have created.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading assets...</div>
            ) : error ? (
              <div>{error}</div>
            ) : assets.length === 0 ? (
              <div>No assets found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Asset ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.asset_code}</TableCell>
                      <TableCell>{asset.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
