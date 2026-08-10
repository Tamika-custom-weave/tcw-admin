"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-zinc-50 sm:rounded-2xl shadow-xl w-full max-w-5xl h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 sm:zoom-in-95 duration-200 rounded-t-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-serif font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
          {children}
        </div>
      </div>
    </div>
  );
}
