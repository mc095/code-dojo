'use client';

import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Users, User } from 'lucide-react';

interface UserSwitcherProps {
  currentUser: UserRole;
  setCurrentUser: (user: UserRole) => void;
}

export default function UserSwitcher({ currentUser, setCurrentUser }: UserSwitcherProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentUser === 'user' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentUser('user')}
        className="rounded-full"
      >
        <User className="mr-2 h-4 w-4" />
        My Progress
      </Button>
      <Button
        variant={currentUser === 'cousin' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setCurrentUser('cousin')}
        className="rounded-full"
      >
        <Users className="mr-2 h-4 w-4" />
        Cousin's Progress
      </Button>
    </div>
  );
}
