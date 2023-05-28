"use client";
import { Database } from "@/supabase";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import AuthModal from "../AuthModal/AuthModal";
import ProjectCreationModal from "../ProjectCreationModal/ProjectCreationModal";
import FirstProjectFlow from "../FirstProjectFlow/FirstProjectFlow";

export interface ProjectLaunchpadProps {}

function ProjectLaunchpad({}: ProjectLaunchpadProps) {
  const supabase = createClientComponentClient<Database>();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) return <></>;

  if (session) {
    return <>Logged in</>;
  } else {
    return <FirstProjectFlow />;
  }
}

export default ProjectLaunchpad;
