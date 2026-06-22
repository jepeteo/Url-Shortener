"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

export function QRModal({ shortCode, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`;

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qrCodeModalTitle"
        className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="qrCodeModalTitle" className="mb-4 text-lg font-semibold">
          QR Code
        </h2>
        <div className="flex justify-center">
          <QRCodeSVG value={url} size={200} />
        </div>
        <p className="mt-4 break-all text-center text-sm text-muted-foreground">{url}</p>
        <Button ref={closeButtonRef} onClick={onClose} className="mt-4 w-full">
          Close
        </Button>
      </div>
    </div>
  );
}
