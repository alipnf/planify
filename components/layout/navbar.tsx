'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Save, LogOut, Menu, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    // Optional: subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth/login');
  };

  const isAuthenticated = !!user;

  const navigation = [
    { name: 'Semua Mata Kuliah', href: '/courses', icon: BookOpen },
    { name: 'Buat Jadwal', href: '/create-schedule', icon: Plus },
    { name: 'Jadwal Tersimpan', href: '/saved', icon: Save },
  ];

  return (
    <header className="bg-background/80 backdrop-blur border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Planify</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={`flex items-center space-x-2 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Desktop User Dropdown */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2"
                      >
                        <Avatar className="h-8 w-8">
                          {user?.user_metadata?.avatar_url ? (
                            <AvatarImage
                              src={user.user_metadata.avatar_url}
                              alt={user.user_metadata.full_name || user.email}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <AvatarFallback>
                              {user?.user_metadata?.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                                user?.email?.charAt(0).toUpperCase() ||
                                'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="hidden sm:block text-left">
                          <div className="text-sm font-medium">
                            {user?.user_metadata?.full_name || user?.email}
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={() => router.push('/settings')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Pengaturan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>
                        <div className="flex items-center space-x-2 w-full">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={user?.user_metadata?.avatar_url}
                            />
                            <AvatarFallback className="text-xs">
                              {user?.user_metadata?.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                                user?.email?.charAt(0).toUpperCase() ||
                                'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {user?.user_metadata?.full_name || user?.email}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <DropdownMenuItem asChild key={item.name}>
                            <Link
                              href={item.href}
                              className={cn(
                                'w-full flex items-center space-x-2',
                                isActive
                                  ? 'text-primary bg-primary/10'
                                  : 'text-muted-foreground'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings"
                          className={cn(
                            'w-full flex items-center space-x-2',
                            pathname === '/settings'
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground'
                          )}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Pengaturan</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-sm">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="text-sm">
                      Daftar
                    </Button>
                  </Link>
                </div>

                {/* Mobile Auth Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="flex gap-2 w-full px-3 py-2">
                        <Link href="/auth/register" className="w-1/2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Daftar
                          </Button>
                        </Link>
                        <Link href="/auth/login" className="w-1/2">
                          <Button size="sm" className="w-full">
                            Masuk
                          </Button>
                        </Link>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
