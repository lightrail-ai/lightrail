"use client";

import React, { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Modal from "../Modal/Modal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

function AuthModal({ visible, onClose }: AuthModalProps) {
  return (
    <Modal
      title="Authenticate"
      visible={visible}
      onClose={onClose}
      content={
        <>
          <Auth
            supabaseClient={supabase}
            redirectTo={process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#9916e9",
                    brandAccent: "#870df1",
                  },
                },
              },
            }}
            providers={["github"]}
          />
        </>
      }
    />
  );
}

export default AuthModal;
