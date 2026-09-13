import { type ChangeEvent, type ReactNode, type RefObject } from "react";
import { capturePackFile } from "@/lib/scan/image";
import { cn } from "@/lib/utils";

const ACCEPT = "image/*,.heic,.heif,image/heic,image/heif";

export function ReadingOverlay({
  title = "Reading the pack",
  body = "We’ll match the name even if this barcode isn’t in the index yet.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-fg/86 px-6 text-center text-accent-fg"
      role="status"
      aria-live="polite"
    >
      <p className="font-display text-2xl font-bold tracking-[-0.04em]">{title}</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-accent-fg/75">{body}</p>
    </div>
  );
}

/**
 * The file input IS the tap target. iOS blocks programmatic .click() on hidden
 * inputs, which is why camera-roll saves were flaky.
 */
export function FileHitArea({
  capture,
  onFile,
  onStart,
  onEmpty,
  disabled,
  className,
  children,
  label,
}: {
  capture?: boolean;
  onFile: (file: File) => void;
  onStart?: () => void;
  onEmpty?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  label: string;
}) {
  async function grab(e: ChangeEvent<HTMLInputElement>) {
    onStart?.();
    const file = await capturePackFile(e.currentTarget);
    if (file) onFile(file);
    else onEmpty?.();
  }

  return (
    <label
      className={cn(
        "relative flex cursor-pointer overflow-hidden",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      {children}
      <input
        type="file"
        accept={capture ? "image/*" : ACCEPT}
        capture={capture ? "environment" : undefined}
        disabled={disabled}
        className="file-ghost"
        aria-label={label}
        onChange={(e) => void grab(e)}
      />
    </label>
  );
}

/** Kept for the live scanner sheet — still uses refs, but inputs overlay the buttons. */
export function PackFileInputs({
  libraryRef,
  cameraRef,
  onFile,
  onStart,
  onEmpty,
}: {
  libraryRef: RefObject<HTMLInputElement | null>;
  cameraRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onStart?: () => void;
  onEmpty?: () => void;
}) {
  async function grab(e: ChangeEvent<HTMLInputElement>) {
    onStart?.();
    const file = await capturePackFile(e.currentTarget);
    if (file) onFile(file);
    else onEmpty?.();
  }

  return (
    <>
      <input
        ref={libraryRef}
        type="file"
        accept={ACCEPT}
        className="file-ghost"
        aria-label="Upload a pack photo from your camera roll"
        onChange={(e) => void grab(e)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="file-ghost"
        aria-label="Take a photo of the pack"
        onChange={(e) => void grab(e)}
      />
    </>
  );
}
