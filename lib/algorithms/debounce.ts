type AnyArgs = unknown[];

export type DebouncedFunction<TArgs extends AnyArgs> = ((
  ...args: TArgs
) => void) & {
  flush: (...args: TArgs) => void;
  cancel: () => void;
};

export function debounce<TArgs extends AnyArgs>(
  fn: (...args: TArgs) => void,
  waitMs: number,
): DebouncedFunction<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: TArgs) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, waitMs);
  }) as DebouncedFunction<TArgs>;

  debounced.flush = (...args: TArgs) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

