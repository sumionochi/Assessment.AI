import {
  createAssessSchema,
  updateAssessSchema,
  deleteAssessSchema,
} from "@/lib/validation/dashboard";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const result = createAssessSchema.safeParse(body);
    if (!result.success) {
      console.error(result.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const {
      name,
      jobProfile,
      jobtype,
      companyName,
      jobRequirements,
      level,
      questions,
    } = result.data;

    const { userId } = auth();
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const assess = await prisma.assess.create({
      data: {
        name,
        jobProfile,
        jobtype,
        companyName,
        jobRequirements,
        level,
        questions,
        userId,
      },
    });
    return Response.json({ assess }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updateAssessSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const {
      id,
      name,
      jobProfile,
      jobtype,
      companyName,
      jobRequirements,
      level,
      questions,
    } = parseResult.data;

    const assess = await prisma.assess.findUnique({ where: { id } });

    if (!assess) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== assess.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.assess.update({
        where: { id },
        data: {
          name,
          jobProfile,
          jobtype,
          companyName,
          jobRequirements,
          level,
          questions,
          userId,
        },
      });

      return updatedTask;
    });

    return Response.json({ updatedTask }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const parseResult = deleteAssessSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id } = parseResult.data;

    const assess = await prisma.assess.findUnique({ where: { id } });

    if (!assess) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== assess.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.assess.delete({ where: { id } });
    });

    return Response.json({ message: "Event deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
