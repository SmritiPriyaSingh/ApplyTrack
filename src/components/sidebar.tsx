"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Calendar, 
  Building2, 
  Target,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditProfileModal } from '@/components/profile/edit-profile-modal';

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
const DEFAULT_NAME = "Smriti Priya Singh";

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: Briefcase },
  { name: 'Resume Vault', href: '/resumes', icon: FileText },
  { name: 'Analytics Hub', href: '/analytics', icon: BarChart3 },
  { name: 'Calendar & Tasks', href: '/calendar', icon: Calendar },
  { name: 'Companies', href: '/companies', icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState(DEFAULT_NAME);
  const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATAR);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('applytrack_user_name');
    const savedAvatar = localStorage.getItem('applytrack_user_avatar');

    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);

    // Auto-collapse sidebar on narrow windows (< 1024px) for maximum workspace space
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveProfile = (newName: string, newAvatar: string) => {
    setUserName(newName);
    setUserAvatar(newAvatar);
    localStorage.setItem('applytrack_user_name', newName);
    localStorage.setItem('applytrack_user_avatar', newAvatar);
  };

  return (
    <>
      <aside
        className={cn(
          "h-screen sticky top-0 bg-[#0A0A0A] border-r border-white/5 flex flex-col justify-between p-3 z-40 transition-all duration-300 shrink-0",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        <div>
          {/* Brand Header with Toggle Button */}
          <div className={cn("flex items-center mb-6 px-1.5 py-2", isCollapsed ? "justify-center" : "justify-between")}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C3195D]/15 border border-[#C3195D]/30 flex items-center justify-center text-[#C3195D] shrink-0 shadow-sm">
                <Target className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="font-bold text-sm text-[#EFECEC] tracking-tight">ApplyTrack</h1>
                  <p className="text-[10px] text-[#BFC3C7]">Career Workspace</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="p-1.5 rounded-lg text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-white/5 transition"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative",
                    isCollapsed ? "justify-center" : "justify-between",
                    isActive
                      ? "text-[#C3195D] font-bold bg-[#C3195D]/10 border border-[#C3195D]/25"
                      : "text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4 transition-colors shrink-0", isActive ? "text-[#C3195D]" : "text-[#BFC3C7] group-hover:text-[#EFECEC]")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="pt-3 border-t border-white/5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            title="Click to edit profile"
            className={cn(
              "flex items-center gap-2.5 p-2 rounded-xl bg-[#1A1A1A] border border-white/5 w-full text-left cursor-pointer hover:border-[#C3195D]/40 hover:bg-[#242424] transition group relative",
              isCollapsed && "justify-center"
            )}
          >
            <img
              src={userAvatar}
              alt={userName}
              className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:border-[#C3195D] transition shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#EFECEC] truncate group-hover:text-[#C3195D] transition flex items-center justify-between">
                  <span className="truncate">{userName}</span>
                  <Edit3 className="w-3 h-3 text-[#737373] group-hover:text-[#C3195D] transition shrink-0 ml-1 opacity-0 group-hover:opacity-100" />
                </p>
                <p className="text-[10px] text-[#BFC3C7] truncate">Workspace Active</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={userName}
        currentAvatar={userAvatar}
        onSave={handleSaveProfile}
      />
    </>
  );
}
