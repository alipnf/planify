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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth';
import { useCoursesStore } from '@/lib/stores/courses';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const setMessage = useAuthStore((state) => state.setMessage);

  const handleLogout = async () => {
    const supabase = createClient();
    useCoursesStore.persist.clearStorage();
    await supabase.auth.signOut();
    setMessage(null);
    router.push('/auth/login');
    router.refresh();
  };

  const isAuthenticated = !loading && !!user;
  const shouldShowNavigation = isAuthenticated || loading;

  const navigation = [
    { name: 'Semua Mata Kuliah', href: '/courses', icon: BookOpen },
    { name: 'Buat Jadwal', href: '/create-schedule', icon: Plus },
    { name: 'Jadwal Tersimpan', href: '/saved', icon: Save },
  ];

  return (
    <>
      <header className="bg-background/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Planify</span>
            </Link>

            {shouldShowNavigation && (
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

            {/* Right side Actions */}
            <div className="flex items-center space-x-4">
              {/* Desktop Auth Status */}
              <div className="hidden md:block">
                {isAuthenticated || loading ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2"
                      >
                        <Avatar className="h-8 w-8">
                          {loading ? (
                            <div className="h-full w-full rounded-full bg-gray-200 animate-pulse" />
                          ) : user?.user_metadata?.avatar_url ? (
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
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {loading ? (
                        <>
                          <DropdownMenuItem disabled>
                            <div className="flex flex-col space-y-2">
                              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                              <div className="h-3 w-40 bg-gray-200 animate-pulse rounded" />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled>
                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem disabled>
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {user?.user_metadata?.full_name || user?.email}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                              </p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push('/settings')}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Pengaturan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowLogoutAlert(true)}
                            className="text-destructive"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Keluar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
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
                  </>
                )}
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
                    {loading ? (
                      <DropdownMenuItem disabled>
                        <div className="flex items-center space-x-2 w-full">
                          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 animate-pulse" />
                        </div>
                      </DropdownMenuItem>
                    ) : isAuthenticated ? (
                      <>
                        <DropdownMenuItem disabled>
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
                          onClick={() => setShowLogoutAlert(true)}
                          className="text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Keluar
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/auth/login" className="w-full">
                            Masuk
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/auth/register" className="w-full">
                            Daftar
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin keluar dari akun Anda?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Keluar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
