'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton({ label = 'Print Document' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
