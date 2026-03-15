"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type PhoneRow = {
  id: string;
  model: string;
  purchasePrice: number;
  purchaseDate: string;
  salePrice: number | null;
  saleDate: string | null;
  isSold: boolean;
  batch: {
    sunday: string;
  };
};

export default function PhoneTable({ phones }: { phones: PhoneRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [salePrices, setSalePrices] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSale = (phoneId: string) => {
    setError(null);
    const salePrice = Number(salePrices[phoneId]);
    if (!salePrice) {
      setError("Укажите цену продажи для телефона");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/phones/${phoneId}/sold`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salePrice })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Не удалось обновить");
        return;
      }

      setSalePrices((prev) => ({ ...prev, [phoneId]: "" }));
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Телефоны</h2>
          <p className="text-sm text-slate-400">
            Можно отметить телефон как проданный и сразу увидеть прибыль.
          </p>
        </div>
        <span className="text-sm text-slate-400">Всего: {phones.length}</span>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-700 text-xs uppercase text-slate-400">
            <tr>
              <th className="py-3 pr-4">Модель</th>
              <th className="py-3 pr-4">Закупка</th>
              <th className="py-3 pr-4">Партия (вс)</th>
              <th className="py-3 pr-4">Продажа</th>
              <th className="py-3 pr-4">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {phones.map((phone) => {
              const isSold = phone.isSold;
              return (
                <tr key={phone.id} className="align-top">
                  <td className="py-4 pr-4 font-medium">{phone.model}</td>
                  <td className="py-4 pr-4">{phone.purchasePrice.toLocaleString("ru-RU")} ₽</td>
                  <td className="py-4 pr-4">
                    {new Date(phone.batch.sunday).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="py-4 pr-4">
                    {isSold ? (
                      <div>
                        <div>{phone.salePrice?.toLocaleString("ru-RU")} ₽</div>
                        <div className="text-xs text-emerald-400">
                          прибыль {phone.salePrice ? phone.salePrice - phone.purchasePrice : 0} ₽
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Цена продажи"
                          value={salePrices[phone.id] ?? ""}
                          onChange={(event) =>
                            setSalePrices((prev) => ({
                              ...prev,
                              [phone.id]: event.target.value
                            }))
                          }
                          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleSale(phone.id)}
                          disabled={isPending}
                          className="rounded-md bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-700"
                        >
                          Отметить проданным
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        isSold
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {isSold ? "Продан" : "В продаже"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
