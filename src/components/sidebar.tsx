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
  Edit3
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

  useEffect(() => {
    const savedName = localStorage.getItem('applytrack_user_name');
    const savedAvatar = localStorage.getItem('applytrack_user_avatar');

    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);

  const handleSaveProfile = (newName: string, newAvatar: string) => {
    setUserName(newName);
    setUserAvatar(newAvatar);
    localStorage.setItem('applytrack_user_name', newName);
    localStorage.setItem('applytrack_user_avatar', newAvatar);
  };

  return (
    <>
      <aside className="w-60 h-screen sticky top-0 bg-[#0A0A0A] border-r border-white/5 flex flex-col justify-between p-4 z-40">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
            <div className="w-7 h-7 rounded-lg bg-[#C3195D]/15 border border-[#C3195D]/30 flex items-center justify-center text-[#C3195D]">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-[#EFECEC] tracking-tight">ApplyTrack</h1>
              <p className="text-[10px] text-[#BFC3C7]">Career Workspace</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-normal transition-all group",
                    isActive
                      ? "text-[#C3195D] font-semibold bg-[#C3195D]/10 border border-[#C3195D]/25"
                      : "text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-[#C3195D]" : "text-[#BFC3C7] group-hover:text-[#EFECEC]")} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer (Clickable to Edit Name & Avatar) */}
        <div className="pt-3 border-t border-white/5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            title="Click to change profile picture or name"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#1A1A1A] border border-white/5 w-full text-left cursor-pointer hover:border-[#C3195D]/40 hover:bg-[#242424] transition group relative"
          >
            <img
              src={userAvatar}
              alt={userName}
              className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:border-[#C3195D] transition shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#EFECEC] truncate group-hover:text-[#C3195D] transition flex items-center justify-between">
                <span className="truncate">{userName}</span>
                <Edit3 className="w-3 h-3 text-[#737373] group-hover:text-[#C3195D] transition shrink-0 ml-1 opacity-0 group-hover:opacity-100" />
              </p>
              <p className="text-[10px] text-[#BFC3C7] truncate">Workspace Active</p>
            </div>
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
