
import { EntityCreationForm } from '@/components/admin/entity-creation-form';
import { UserCreationForm } from '@/components/admin/user-creation-form';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <p className="text-muted-foreground">
          Create and manage users and entities within the platform.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <UserCreationForm />
        <EntityCreationForm />
      </div>
    </div>
  );
}
