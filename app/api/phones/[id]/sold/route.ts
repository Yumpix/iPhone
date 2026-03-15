import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as { salePrice?: number };

  if (!body.salePrice) {
    return NextResponse.json(
      { error: "Укажите цену продажи" },
      { status: 400 }
    );
  }

  const phone = await prisma.phone.update({
    where: { id: params.id },
    data: {
      isSold: true,
      saleDate: new Date(),
      salePrice: body.salePrice
    }
  });

  return NextResponse.json(phone);
}
