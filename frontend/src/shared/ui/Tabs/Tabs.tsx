// src/shared/ui/Tabs/Tabs.tsx

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex gap-4 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar pb-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={`whitespace-nowrap px-2 py-1 text-sm transition-colors border-b-2 ${
            tab.disabled
              ? 'text-gray-600 cursor-not-allowed border-transparent'
              : activeTab === tab.id
              ? 'border-blue-500 text-blue-400 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          {tab.label} 
        </button>
      ))}
    </div>
  );
}