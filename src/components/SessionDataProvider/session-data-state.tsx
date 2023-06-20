import { atom } from "recoil";
import { Session } from "@supabase/auth-helpers-nextjs";

export const sessionState = atom<{
  session: Session | null;
  loading: boolean;
}>({
  key: "sessionState",
  default: {
    session: null,
    loading: true,
  },
});
