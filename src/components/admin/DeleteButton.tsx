"use client";

export function DeleteButton({
  label = "Видалити товар",
  message = "Видалити цей товар назавжди? Замовлення, у яких він був, збережуться.",
}: {
  label?: string;
  message?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className="text-[13px] text-red underline underline-offset-4"
    >
      {label}
    </button>
  );
}
