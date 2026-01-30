"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const progressPercent =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary-500" />
            Research Questions
          </CardTitle>
          <Badge
            variant={progressPercent === 100 ? "success" : "outline"}
            size="lg"
          >
            {answeredCount}/{questions.length} answered
          </Badge>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => {
          const categoryAnswered = items.filter(
            (i) => i.question.answered
          ).length;
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-foreground">
                  {category}
                </h4>
                <span className="text-base text-muted-foreground">
                  {categoryAnswered}/{items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {items.map(({ question: q, index }) => (
                  <li
                    key={index}
                    className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      q.answered ? "bg-muted/50" : "hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={q.answered}
                      onChange={() => toggleQuestion(index)}
                      className="mt-0.5 h-4.5 w-4.5 rounded border-border text-primary-500 focus:ring-primary-500 cursor-pointer"
                    />
                    <span
                      className={`text-lg leading-relaxed ${
                        q.answered
                          ? "text-muted-foreground line-through"
                          : "text-foreground/80"
                      }`}
                    >
                      {q.question}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
