"use client";

import React, { useEffect } from "react";
import { analytics } from "@/util/analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { sessionState } from "./session-data-state";
import { RecoilRoot, useRecoilState } from "recoil";
import { Database } from "@/supabase";

export interface SessionDataProviderProps {
  children: React.ReactNode;
}

function SessionDataProvider({ children }: SessionDataProviderProps) {
  const supabase = createClientComponentClient<Database>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [{ loading: loadingAuth }, setSession] = useRecoilState(sessionState);

  useEffect(() => {
    analytics.page();
  }, [pathname, searchParams]);

  useEffect(() => {});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error(error);
      } else {
        setSession({ session, loading: false });
        if (session?.user) {
          analytics.identify(session.user.id, session.user);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession({
        session,
        loading: false,
      });
      if (session?.user) {
        analytics.identify(session.user.id, session.user);
      }
      console.log(event);
      if (event === "SIGNED_IN") {
        analytics.track("User Signed In");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loadingAuth) return <></>;

  return <>{children}</>;
}

export default (props: SessionDataProviderProps) => (
  <RecoilRoot>
    <SessionDataProvider {...props} />
  </RecoilRoot>
);
