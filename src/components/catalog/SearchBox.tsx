import { Search } from "lucide-react";

export function SearchBox({
  defaultValue = "",
  autoFocus = false,
  id = "q",
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  id?: string;
}) {
  return (
    <form action="/search" role="search" className="flex w-full max-w-[640px]">
      <label htmlFor={id} className="sr-only">Пошук товарів</label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder="Пошук товарів"
        className="h-12 min-w-0 flex-1 rounded-l-[4px] border border-line bg-white px-4 text-[15px]"
      />
      <button
        type="submit"
        aria-label="Шукати"
        className="grid h-12 w-14 place-items-center rounded-r-[4px] bg-red text-white"
      >
        <Search size={20} />
      </button>
    </form>
  );
}
