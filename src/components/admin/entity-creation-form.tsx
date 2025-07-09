
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function EntityCreationForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Entity</CardTitle>
        <CardDescription>
          Create a new entity like a project or a department.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="entityName">Name</Label>
          <Input id="entityName" placeholder="Project Phoenix" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entityDescription">Description</Label>
          <Textarea id="entityDescription" placeholder="A short description of the entity." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entityOwner">Entity Owner (Email)</Label>
          <Input id="entityOwner" type="email" placeholder="owner@example.com" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Create Entity</Button>
      </CardFooter>
    </Card>
  );
}
