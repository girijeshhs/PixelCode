import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: [{ totalXp: "desc" }, { streak: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        displayName: true,
        leetcodeUsername: true,
        totalXp: true,
        level: true,
        streak: true
      }
    }),
    prisma.user.count()
  ]);

  return NextResponse.json({
    page,
    pageSize,
    total,
    items
  });
}
