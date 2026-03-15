import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSunday } from "@/lib/batches";

export async function GET() {
  const phones = await prisma.phone.findMany({
    orderBy: { purchaseDate: "desc" },
    include: { batch: true }
  });

  return NextResponse.json(
    phones.map((phone) => ({
      ...phone,
      profit:
        phone.salePrice !== null
          ? phone.salePrice - phone.purchasePrice
          : null
    }))
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    model?: string;
    purchasePrice?: number;
    purchaseDate?: string;
  };

  if (!body.model || !body.purchasePrice) {
    return NextResponse.json(
      { error: "Укажите модель и цену закупки" },
      { status: 400 }
    );
  }

  const purchaseDate = body.purchaseDate
    ? new Date(body.purchaseDate)
    : new Date();
  const sunday = getSunday(purchaseDate);

  const batch = await prisma.batch.upsert({
    where: { sunday },
    update: {},
    create: { sunday }
  });

  const phone = await prisma.phone.create({
    data: {
      model: body.model,
      purchasePrice: body.purchasePrice,
      purchaseDate,
      batchId: batch.id
    }
  });

  return NextResponse.json(phone, { status: 201 });
}
