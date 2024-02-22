import {
  createResultSchema,
  CreateResultSchema,
} from "@/lib/validation/dashboard";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createResultSchema.safeParse(body);

    if (!result.success) {
      console.error(result.error);
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
      });
    }

    const {
      name,
      jobProfile,
      jobtype,
      companyName,
      jobRequirements,
      level,
      questions,
      overview,
      analytics,
    } = result.data as CreateResultSchema;

    const { userId } = auth();
    if (!userId)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const results = await prisma.result.create({
      data: {
        name,
        jobProfile,
        jobtype,
        companyName,
        jobRequirements,
        level,
        questions: {
          create: questions.map((q) => ({
            question: q.question,
            answer: q.answer,
            isAI: q.isAI || false,
            strengths: {
              create: q.strengths.map((s) => ({
                feedbackHeading: s.feedbackHeading,
                feedback: s.feedback,
              })),
            },
            improvements: {
              create: q.improvements.map((i) => ({
                feedbackHeading: i.feedbackHeading,
                feedback: i.feedback,
              })),
            },
          })),
        },
        overview,
        analytics: {
          create: analytics.map((a) => ({
            parameter: a.parameter,
            points: a.points,
            maxPoints: a.maxPoints,
          })),
        },
        userId,
      },
    });
    return new Response(JSON.stringify({ results }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
