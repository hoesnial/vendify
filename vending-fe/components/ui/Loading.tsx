"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = "md",
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-teal-600",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
};

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = "Initializing System...",
  size = "lg",
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#f6f8f8] min-h-screen flex flex-col overflow-hidden z-50">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#13daec]/5 blur-3xl"></div>
          <div className="absolute top-[20%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-[#618689]/10 blur-3xl"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#13daec]/5 blur-3xl"></div>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#111718 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col h-full grow items-center justify-center p-6">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl gap-12">
            <div className="flex flex-col items-center gap-8 animate-[float_6s_ease-in-out_infinite]">
              {/* Logo Container */}
              <div className="relative group cursor-default">
                <div className="relative w-48 h-48 bg-white rounded-full shadow-2xl shadow-[#13daec]/10 flex items-center justify-center border border-white/60">
                  <Image
                    src="/MediVendLogo.png"
                    alt="MediVend Logo"
                    width={160}
                    height={160}
                    className="object-contain rounded-full"
                    priority
                  />
                </div>
              </div>

              {/* Title and Tagline */}
              <div className="text-center space-y-3">
                <h1 className="text-[#111718] text-7xl md:text-8xl font-bold tracking-tight leading-none drop-shadow-sm">
                  MediVend
                </h1>
                <p className="text-[#618689] text-xl md:text-2xl font-medium tracking-wide">
                  Smart Health. Made Easy.
                </p>
              </div>
            </div>

            {/* Loader Ring */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="inline-block relative w-16 h-16">
                <div className="box-border block absolute w-[50px] h-[50px] m-1.5 border-3 border-[#13daec] rounded-full animate-[loader-ring_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] border-t-transparent border-r-transparent border-b-transparent [animation-delay:-0.45s]"></div>
                <div className="box-border block absolute w-[50px] h-[50px] m-1.5 border-3 border-[#13daec] rounded-full animate-[loader-ring_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] border-t-transparent border-r-transparent border-b-transparent [animation-delay:-0.3s]"></div>
                <div className="box-border block absolute w-[50px] h-[50px] m-1.5 border-3 border-[#13daec] rounded-full animate-[loader-ring_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] border-t-transparent border-r-transparent border-b-transparent [animation-delay:-0.15s]"></div>
                <div className="box-border block absolute w-[50px] h-[50px] m-1.5 border-3 border-[#13daec] rounded-full animate-[loader-ring_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] border-t-transparent border-r-transparent border-b-transparent"></div>
              </div>
              <p className="text-[#13daec] font-semibold text-md tracking-widest uppercase">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 w-full p-8 flex flex-col items-center pb-8">
          <div className="flex flex-col items-center gap-1 opacity-40">
            <p className="text-[#618689] text-xs font-bold tracking-widest uppercase">
              MediVend System v2.0 • ID: MV-402
            </p>
          </div>
        </div>

        {/* Keyframes */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          @keyframes loader-ring {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size={size} className="mb-4 border-t-teal-600" />
      <p className="text-teal-900 font-medium">{message}</p>
    </div>
  );
};

export { Loading, LoadingSpinner };
