import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateClaudeCompletion } from "@/lib/ai/claude";
import { buildReportContext } from "@/lib/ai/report-context";

interface ChatRequest {
  reportId: string;
  question: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { reportId, question, history } = body;

    if (!reportId || !question) {
      return NextResponse.json(
        { error: "reportId and question are required" },
        { status: 400 }
      );
    }

    const report = await prisma.macroReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== "COMPLETE") {
      return NextResponse.json(
        { error: "Report is not complete" },
        { status: 400 }
      );
    }

    // Build report context for the system prompt
    const reportContext = buildReportContext(report);

    const systemPrompt = `You are a macro research assistant. The user has received a Dalio-style macro report. Answer their follow-up questions based on the report data below. Be conversational, clear, and specific. Reference specific data points from the report when relevant.

--- MACRO REPORT DATA ---
${reportContext}
--- END REPORT DATA ---`;

    // Build messages array with conversation history
    const messages = [
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: question },
    ];

    const answer = await generateClaudeCompletion(messages, {
      system: systemPrompt,
      maxTokens: 4096,
      temperature: 0.5,
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error in macro chat:", error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}
