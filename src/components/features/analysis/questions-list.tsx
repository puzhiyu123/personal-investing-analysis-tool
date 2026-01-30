"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

interface Question {
  question: string;
  category: string;
  answered: boolean;
}

interface QuestionsListProps {
  analysisId: string;
  questions: Question[];
}

export function QuestionsList({
  analysisId,
  questions: initialQuestions,
}: QuestionsListProps) {
  const [questions, setQuestions] = useState(initialQuestions);

  async function toggleQuestion(index: number) {
    const updated = [...questions];
    updated[index] = { ...updated[index], answered: !updated[index].answered };
    setQuestions(updated);

    try {
      await fetch(`/api/analyze/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedQuestions: updated }),
      });
    } catch (error) {
      console.error("Failed to update questions:", error);
      // Revert
      setQuestions(initialQuestions);
    }
  }

  // Group by category
  const grouped: Record<string, Array<{ question: Question; index: number }>> =
    {};
  questions.forEach((q, i) => {
    if (!grouped[q.category]) grouped[q.category] = [];
    grouped[q.category].push({ question: q, index: i });
  });

  const answeredCount = questions.filter((q) => q.answered).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary-500" />
            Research Questions
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-foreground mb-2">
              {category}
            </h4>
            <ul className="space-y-2">
              {items.map(({ question: q, index }) => (
                <li key={index} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={q.answered}
                    onChange={() => toggleQuestion(index)}
                    className="mt-1 h-4 w-4 rounded border-sand-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span
                    className={`text-sm ${
                      q.answered
                        ? "text-muted-foreground line-through"
                        : "text-sand-700"
                    }`}
                  >
                    {q.question}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
