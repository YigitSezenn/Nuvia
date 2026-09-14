type Listener = () => void;

const listeners = new Set<Listener>();

/** Habits / check-ins değişince tüm hook instance'larını yenile. */
export function subscribeDataChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitDataChange(): void {
  listeners.forEach((listener) => listener());
}
