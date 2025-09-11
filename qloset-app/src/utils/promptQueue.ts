// qloset-app/src/utils/promptQueue.ts
import { Alert } from "react-native";

/** Options for a standard yes/no confirmation dialog */
export type ConfirmOptions = {
  title: string;
  message: string;
  /** Right button */
  confirmText?: string;
  /** Left button */
  cancelText?: string;
  /** If true, the cancel button is styled as "destructive" on iOS */
  cancelDestructive?: boolean;
};

/**
 * Internal global chain. Each prompt waits for the previous one to finish.
 * We keep this in module scope so all imports share the same queue.
 */
let chain: Promise<unknown> = Promise.resolve();

/**
 * Show a confirmation dialog **sequentially** (queued).
 * Returns a Promise<boolean> that resolves to:
 *  - true  -> user pressed the confirm button
 *  - false -> user pressed cancel (or dismissed)
 */
export function confirmSequential(opts: ConfirmOptions): Promise<boolean> {
  const run = () =>
    new Promise<boolean>((resolve) => {
      const onConfirm = () => resolve(true);
      const onCancel = () => resolve(false);

      Alert.alert(
        opts.title,
        opts.message,
        [
          {
            text: opts.cancelText ?? "Not now",
            style: opts.cancelDestructive ? "destructive" : "cancel",
            onPress: onCancel,
          },
          {
            text: opts.confirmText ?? "Yes",
            onPress: onConfirm,
          },
        ],
        { cancelable: false } // don’t allow tap-outside to skip the queue
      );
    });

  // Chain the new dialog after whatever is already in-flight.
  // If a previous step threw, still run this one.
  chain = chain.then(run, run);
  return chain as Promise<boolean>;
}
