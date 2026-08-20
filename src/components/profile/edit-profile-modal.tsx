"use client";

import { useState, useRef } from 'react';
import { X, Camera, Check, User } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatar: string;
  onSave: (newName: string, newAvatar: string) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentAvatar,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1A1A1A] border border-white/5 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#C3195D]/15 text-[#C3195D] flex items-center justify-center border border-[#C3195D]/30">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#EFECEC]">Edit User Profile</h2>
              <p className="text-[11px] text-[#BFC3C7]">Customize your workspace avatar & display name</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#1A1A1A] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Avatar Upload Preview Section */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={avatar}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#C3195D]/40 group-hover:border-[#C3195D] transition shadow-md"
              />
              <div className="absolute inset-0 rounded-full bg-[#0A0A0A]/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-5 h-5 text-[#EFECEC]" />
                <span className="text-[9px] font-medium text-[#EFECEC] mt-0.5">Upload</span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-[#C3195D] hover:text-[#EFECEC] transition flex items-center gap-1.5 bg-[#0A0A0A] px-3 py-1.5 rounded-xl border border-white/5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Choose Photo from Device</span>
            </button>
          </div>

          {/* Name Input Section */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#EFECEC]">
              Workspace Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Smriti Priya Singh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-white/5 rounded-xl text-xs text-[#EFECEC] placeholder-[#737373] focus:outline-none focus:border-[#C3195D] transition"
            />
            <p className="text-[10px] text-[#737373]">
              This name will be reflected across your sidebar and career records.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#BFC3C7] hover:text-[#EFECEC] hover:bg-[#0A0A0A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#C3195D] hover:bg-[#a5134d] text-[#EFECEC] text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
