export type AuthEvent =
  | {
      type: "login";
      sessionId: string;
      basketId: string | null;
      customerId?: string | null;
    }
  | {
      type: "logout";
    };

type Listener = (event: AuthEvent) => void;

const listeners = new Set<Listener>();

export const emitAuthEvent = (event: AuthEvent) => {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // ignore
    }
  }
};

export const subscribeAuthEvents = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
