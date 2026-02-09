import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const phones = await prisma.phone.findMany({
    where: {
      purchaseDate: { gte: startOfMonth, lte: endOfMonth }
    }
  });

  const purchasedCount = phones.length;
  const soldCount = phones.filter((phone) => phone.isSold).length;
  const totalPurchase = phones.reduce(
    (sum, phone) => sum + phone.purchasePrice,
    0
  );
  const totalProfit = phones.reduce((sum, phone) => {
    if (!phone.isSold || phone.salePrice === null) return sum;
    return sum + (phone.salePrice - phone.purchasePrice);
  }, 0);

  return NextResponse.json({
    purchasedCount,
    soldCount,
    totalPurchase,
    totalProfit
  });
}
