"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PhoneForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [model, setModel] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const priceValue = Number(purchasePrice);
    if (!model || !priceValue) {
      setError("Заполните модель и цену закупки");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          purchasePrice: priceValue
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Не удалось сохранить");
        return;
      }

      setModel("");
      setPurchasePrice("");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">Новая закупка</h2>
        <p className="text-sm text-slate-400">
          Партия определяется автоматически по ближайшему воскресенью.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          Модель телефона
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="iPhone 13 128GB"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Цена закупки (₽)
          <input
            type="number"
            min="0"
            value={purchasePrice}
            onChange={(event) => setPurchasePrice(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="45000"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700"
      >
        {isPending ? "Сохраняю..." : "Добавить закупку"}
      </button>
    </form>
  );
}
