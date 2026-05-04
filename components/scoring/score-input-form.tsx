'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/dashboard/ui-components/feedback-toast';

interface AssessmentItem {
  id: string;
  label: string;
  display_number: string;
  allowed_values: number[];
}

interface AssessmentGroup {
  id: string;
  title: string;
  items: AssessmentItem[];
}

interface AssessmentSection {
  id: string;
  title: string;
  weight_percentage: number;
  groups: AssessmentGroup[];
}

interface AssessmentSchema {
  sections: AssessmentSection[];
}

interface ScoreInputFormProps {
  schema: AssessmentSchema;
  teamId: string;
  judgeId: string;
  onSubmit: (scores: Record<string, number>) => Promise<void>;
  isSubmitting: boolean;
}

const DRAFT_KEY = (teamId: string, judgeId: string) =>
  `evora:draft:${teamId}:${judgeId}`;

export function ScoreInputForm({
  schema,
  teamId,
  judgeId,
  onSubmit,
  isSubmitting,
}: ScoreInputFormProps) {
  const { addToast } = useToast();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Calculate totals
  const totalItems = schema.sections.reduce(
    (sum, s) => sum + s.groups.reduce((gSum, g) => gSum + g.items.length, 0),
    0
  );
  const completedCount = Object.keys(scores).length;

  // Calculate estimated total score
  const estimatedTotal = schema.sections.reduce((total, section) => {
    const sectionScore = section.groups.reduce((groupSum, group) => {
      return groupSum + group.items.reduce((itemSum, item) => {
        const score = scores[item.id];
        return itemSum + (score || 0);
      }, 0);
    }, 0);
    return total + sectionScore * (section.weight_percentage / 100);
  }, 0);

  // Build schema map for validation
  const schemaMap = new Map(
    schema.sections.flatMap(s =>
      s.groups.flatMap(g =>
        g.items.map(item => [item.id, new Set(item.allowed_values)])
      )
    )
  );

  // Auto-save draft every 30 seconds and on every score change
  useEffect(() => {
    if (Object.keys(scores).length === 0) return;
    localStorage.setItem(DRAFT_KEY(teamId, judgeId), JSON.stringify(scores));
  }, [scores, teamId, judgeId]);

  // Restore draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY(teamId, judgeId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScores(parsed);
        addToast('success', 'Draft restored: Your previous scoring session has been restored.');
      } catch {
        localStorage.removeItem(DRAFT_KEY(teamId, judgeId));
      }
    }
  }, [teamId, judgeId]);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const setScore = useCallback((itemId: string, value: number) => {
    setScores(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const getSectionProgress = useCallback((sectionId: string) => {
    const section = schema.sections.find(s => s.id === sectionId);
    if (!section) return '0/0';
    const sectionItems = section.groups.reduce((sum, g) => sum + g.items.length, 0);
    const sectionCompleted = section.groups.reduce(
      (sum, g) => sum + g.items.filter(i => scores[i.id] !== undefined).length,
      0
    );
    return `${sectionCompleted}/${sectionItems}`;
  }, [schema.sections, scores]);

  const handleSubmit = async () => {
    // Validate all scores against allowed values
    for (const [itemId, value] of Object.entries(scores)) {
      const allowed = schemaMap.get(itemId);
      if (!allowed || !allowed.has(value)) {
        addToast('error', `Invalid score ${value} for item ${itemId}.`);
        return;
      }
    }

    await onSubmit(scores);
    // Clear draft after successful submission
    localStorage.removeItem(DRAFT_KEY(teamId, judgeId));
  };

  return (
    <div className="space-y-4 pb-24">
      {schema.sections.map((section) => (
        <div key={section.id} className="border rounded-lg overflow-hidden">
          {/* Section header */}
          <button
            className="w-full flex justify-between items-center p-4 font-semibold text-left bg-muted/30 hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection(section.id)}
          >
            <span>{section.title}</span>
            <span className="text-muted-foreground text-sm">
              Weight: {section.weight_percentage}% · Completed: {getSectionProgress(section.id)}
            </span>
          </button>

          {/* Section body */}
          {openSections.has(section.id) && (
            <div className="p-4 space-y-6">
              {section.groups.map((group) => (
                <div key={group.id}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {group.title}
                  </h4>
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 mb-3">
                      <span className="text-sm text-muted-foreground min-w-[2rem]">
                        {item.display_number}.
                      </span>
                      <div className="flex-1">
                        <p className="text-sm mb-2">{item.label}</p>
                        {/* Button group for allowed values */}
                        <div className="flex flex-wrap gap-2">
                          {item.allowed_values.map((val) => (
                            <button
                              key={val}
                              onClick={() => setScore(item.id, val)}
                              className={cn(
                                'px-3 py-1 text-sm rounded border transition-colors',
                                scores[item.id] === val
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:border-primary hover:bg-muted',
                              )}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Score summary bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center z-50">
        <div className="flex gap-6">
          <span className="text-sm">
            Items completed: <strong>{completedCount} / {totalItems}</strong>
          </span>
          <span className="text-sm">
            Estimated score: <strong>{estimatedTotal.toFixed(2)}</strong>
          </span>
        </div>
        <Button
          disabled={completedCount < totalItems || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Score Sheet'}
        </Button>
      </div>
    </div>
  );
}
