import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Check, ChevronDown, ChevronRight, Lightbulb, FileText, Printer } from 'lucide-react';
import { getCheatSheetBySlug } from '../data/cheatSheets';
import { SEOHead } from './SEOHead';
import type { CheatSheetItem } from '../types';

interface CheatSheetViewProps {
  slug: string;
  onBack: () => void;
}

export function CheatSheetView({ slug, onBack }: CheatSheetViewProps) {
  const sheet = getCheatSheetBySlug(slug);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(Array.from({ length: 20 }, (_, i) => i)) // all open by default
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!sheet) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Cheat sheet not found</h2>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Cheat Sheets
        </button>
      </div>
    );
  }

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalItems = sheet.sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl print:max-w-none print:px-2 print:py-2">
      <SEOHead
        seo={{
          title: `${sheet.title} Cheat Sheet — NeuralCards`,
          description: sheet.description,
          canonical: `https://neuralcards.com/cheatsheets/${sheet.slug}`,
        }}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Cheat Sheets
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{sheet.icon}</span>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{sheet.title}</h1>
            <p className="text-muted-foreground mt-1">{sheet.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {sheet.sections.length} sections
          </span>
          <span>·</span>
          <span>{totalItems} items</span>
          <span>·</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${sheet.color} text-white`}
          >
            {sheet.category}
          </span>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {sheet.sections.map((section, sIdx) => {
          const isOpen = expandedSections.has(sIdx);
          return (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sIdx * 0.05 }}
              className="rounded-2xl border border-border bg-card overflow-hidden print:border-gray-300"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sIdx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors print:bg-gray-100"
              >
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg bg-gradient-to-r ${sheet.color} text-white text-xs flex items-center justify-center font-bold`}
                  >
                    {sIdx + 1}
                  </span>
                  {section.title}
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    ({section.items.length})
                  </span>
                </h2>
                <span className="print:hidden">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </span>
              </button>

              {/* Section Body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 divide-y divide-border">
                      {section.items.map((item, iIdx) => (
                        <CheatSheetItemCard
                          key={iIdx}
                          item={item}
                          id={`${sIdx}-${iIdx}`}
                          copiedId={copiedId}
                          onCopy={handleCopy}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Back button at bottom */}
      <div className="mt-12 text-center print:hidden">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
        >
          ← Back to All Cheat Sheets
        </button>
      </div>
    </div>
  );
}

// Individual item row
function CheatSheetItemCard({
  item,
  id,
  copiedId,
  onCopy,
}: {
  item: CheatSheetItem;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="py-4 first:pt-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Term */}
          <h3 className="font-semibold text-foreground text-sm">{item.term}</h3>
          {/* Definition */}
          <p className="text-sm text-muted-foreground mt-0.5">{item.definition}</p>
        </div>
      </div>

      {/* Syntax / Code block */}
      {item.syntax && (
        <div className="mt-2 relative group">
          <pre className="bg-muted/70 dark:bg-muted/30 rounded-lg px-4 py-2.5 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap border border-border/50 print:bg-gray-100 print:border-gray-300">
            {item.syntax}
          </pre>
          <button
            onClick={() => onCopy(item.syntax!, id)}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-100 dark:hover:bg-purple-900/30 print:hidden"
            title="Copy"
          >
            {copiedId === id ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Example */}
      {item.example && (
        <div className="mt-2">
          <pre className="bg-green-50 dark:bg-green-900/10 rounded-lg px-4 py-2.5 text-xs font-mono text-green-800 dark:text-green-300 overflow-x-auto whitespace-pre-wrap border border-green-200 dark:border-green-800/30 print:bg-green-50">
            {item.example}
          </pre>
        </div>
      )}

      {/* Pro Tip */}
      {item.tip && (
        <div className="mt-2 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800/30 print:bg-yellow-50">
          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">{item.tip}</p>
        </div>
      )}
    </div>
  );
}
