import PhoneForm from "@/components/PhoneForm";
import PhoneTable, { type PhoneRow } from "@/components/PhoneTable";
import { formatMoney } from "@/lib/batches";
import { prisma } from "@/lib/prisma";

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

export default async function HomePage() {
  const { start, end } = getMonthRange();

  const phones = await prisma.phone.findMany({
    include: { batch: true },
    orderBy: { purchaseDate: "desc" }
  });

  const monthPhones = phones.filter((phone) => {
    return phone.purchaseDate >= start && phone.purchaseDate <= end;
  });

  const purchasedCount = monthPhones.length;
  const soldCount = monthPhones.filter((phone) => phone.isSold).length;
  const totalPurchase = monthPhones.reduce(
    (sum, phone) => sum + phone.purchasePrice,
    0
  );
  const totalProfit = monthPhones.reduce((sum, phone) => {
    if (!phone.isSold || phone.salePrice === null) return sum;
    return sum + (phone.salePrice - phone.purchasePrice);
  }, 0);

  const serializedPhones: PhoneRow[] = phones.map((phone) => ({
    ...phone,
    purchaseDate: phone.purchaseDate.toISOString(),
    saleDate: phone.saleDate ? phone.saleDate.toISOString() : null,
    batch: {
      sunday: phone.batch.sunday.toISOString()
    }
  }));

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Закупок за месяц</p>
          <p className="mt-2 text-2xl font-semibold">{purchasedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Продано за месяц</p>
          <p className="mt-2 text-2xl font-semibold">{soldCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Сумма закупки</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatMoney(totalPurchase)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Прибыль за месяц</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {formatMoney(totalProfit)}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <PhoneForm />
        <PhoneTable phones={serializedPhones} />
      </section>
    </div>
  );
}
