
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function UserCreationForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>
          Create a new user and assign them to a group.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userName">Name</Label>
          <Input id="userName" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userEmail">Email</Label>
          <Input id="userEmail" type="email" placeholder="john.doe@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userGroup">Group</Label>
          <Select>
            <SelectTrigger id="userGroup">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="developers">Developers</SelectItem>
              <SelectItem value="qa">QA</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Create User</Button>
      </CardFooter>
    </Card>
  );
}
