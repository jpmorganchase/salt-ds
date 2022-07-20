import { BehaviorSubject } from "rxjs";
import { useEffect, useState } from "react";

export function useObservable<T>(source$: BehaviorSubject<T>): T {
  const [value, setValue] = useState<T>(() => source$.getValue());
  useEffect(() => {
    const sub = source$.subscribe({ next: (x) => setValue(() => x) });
    return () => sub.unsubscribe();
  });
  return value!;
}
