import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";

export function AccountChip() {
  const { user } = useCurrentUserState();
  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        Sign in
      </Link>
    );
  }
  return (
    <div className="max-w-[11rem] truncate [&_span]:max-w-[6.5rem] [&_span]:truncate">
      <UserButton />
    </div>
  );
}
