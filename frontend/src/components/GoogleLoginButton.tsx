'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initGoogleBtn = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        setSdkLoaded(true);
        clearInterval(interval);

        const google = (window as any).google;

        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Failed to retrieve Google credential token');
            }
          },
        });

        google.accounts.id.renderButton(
          buttonRef.current,
          { 
            theme: 'outline', 
            size: 'large', 
            width: 390, 
            shape: 'pill',
            logo_alignment: 'left'
          }
        );
      }
    };

    // Try initializing immediately
    initGoogleBtn();

    // Set fallback polling in case the script takes a few ms to load
    interval = setInterval(initGoogleBtn, 150);

    return () => clearInterval(interval);
  }, [onSuccess, onError]);

  return (
    <div className="w-full flex justify-center min-h-[44px] mb-4">
      <div ref={buttonRef} className="w-full max-w-[390px]" />
      {!sdkLoaded && (
        <div className="w-full max-w-[390px] min-h-[44px] flex items-center justify-center border border-[#E5E7EB] rounded-full text-xs font-semibold text-[#9CA3AF] bg-white gap-2">
          <div className="w-4 h-4 border-2 border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
          Loading Google Sign-in...
        </div>
      )}
    </div>
  );
}
