import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateClaudeCompletion } from "@/lib/ai/claude";
import { buildReportContext } from "@/lib/ai/report-context";

interface SimplifyRequest {
  reportId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SimplifyRequest;
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
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

    // Return cached version if available
    if (report.simplifiedReport) {
      return NextResponse.json({ simplified: report.simplifiedReport });
    }

    const reportContext = buildReportContext(report);

    const systemPrompt = `You are a financial writer who makes complex macro-economic analysis accessible to everyday investors. Rewrite the macro report below into a clear, plain-language summary that anyone can understand.

Rules:
- No jargon — if you must use a financial term, explain it in parentheses
- Conversational, friendly tone — like explaining to a smart friend over coffee
- Short paragraphs (2-3 sentences max)
- Use ## headings for each section
- Cover all sections: The Big Picture, Where We Are in the Cycle, Key Economic Numbers, Historical Comparison, What It Means for Your Portfolio, Things to Keep an Eye On
- End with a "## Bottom Line" section that gives a one-paragraph takeaway
- Aim for 800-1200 words total
- Do NOT use bullet points or lists — write in flowing prose
- Do NOT include any disclaimers about not being financial advice`;

    const simplified = await generateClaudeCompletion(
      [
        {
          role: "user",
          content: `Here is the macro report data to simplify:\n\n${reportContext}`,
        },
      ],
      {
        system: systemPrompt,
        maxTokens: 4096,
        temperature: 0.6,
      }
    );

    // Cache the result
    await prisma.macroReport.update({
      where: { id: reportId },
      data: { simplifiedReport: simplified },
    });

    return NextResponse.json({ simplified });
  } catch (error) {
    console.error("Error simplifying macro report:", error);
    return NextResponse.json(
      { error: "Failed to simplify report" },
      { status: 500 }
    );
  }
}
