"use client";

export function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Видалити цей товар назавжди? Замовлення, у яких він був, збережуться.")) {
          e.preventDefault();
        }
      }}
      className="text-[13px] text-red underline underline-offset-4"
    >
      Видалити товар
    </button>
  );
}
