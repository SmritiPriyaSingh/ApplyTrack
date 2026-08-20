"use client";

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { NewApplicationModal } from '@/components/applications/new-application-modal';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <>
      <header className="h-14 border-b border-white/5 bg-[#0A0A0A] px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Search Input */}
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-[#BFC3C7] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workspace..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs text-[#EFECEC] placeholder-[#BFC3C7] focus:outline-none focus:border-[#C3195D] transition"
          />
        </div>

        {/* Primary CTA Button (#C3195D Signature Brand Color) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Application</span>
          </button>
        </div>
      </header>

      {/* New Application Modal */}
      {isModalOpen && (
        <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
