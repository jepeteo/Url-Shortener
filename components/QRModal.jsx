"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { qrExpiryWarning, qrUpgradeLabel } from "@/lib/expiry/display";

function downloadBlob(blob, filename) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

export function QRModal({ shortCode, expiresAt = null, plan = "free", onClose }) {
  const closeButtonRef = useRef(null);
  const svgWrapRef = useRef(null);
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`;
  const warning = qrExpiryWarning(expiresAt, new Date(), undefined, plan);
  const upgradeLabel = qrUpgradeLabel(plan, expiresAt);
  const filename = `mikrouli-${shortCode}`;

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

  function serializeSvg() {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) {
      return null;
    }
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    return new XMLSerializer().serializeToString(svg);
  }

  function downloadSvg() {
    const markup = serializeSvg();
    if (!markup) {
      return;
    }
    downloadBlob(new Blob([markup], { type: "image/svg+xml" }), `${filename}.svg`);
  }

  function downloadPng() {
    const markup = serializeSvg();
    if (!markup) {
      return;
    }
    const image = new Image();
    const svgUrl = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
    image.onload = () => {
      const size = 480;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${filename}.png`);
        }
      });
    };
    image.onerror = () => URL.revokeObjectURL(svgUrl);
    image.src = svgUrl;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qrCodeModalTitle"
        className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="qrCodeModalTitle" className="mb-4 text-lg font-semibold">
          QR Code
        </h2>
        {warning && (
          <p
            className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            role="note"
          >
            {warning}
          </p>
        )}
        <div ref={svgWrapRef} className="flex justify-center">
          <QRCodeSVG
            value={url}
            size={200}
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <p className="mt-4 break-all text-center text-sm text-muted-foreground">{url}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          {warning && <p className="text-sm text-amber-800 sm:flex-1">{warning}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={downloadPng}>
              PNG
            </Button>
            <Button type="button" variant="outline" onClick={downloadSvg}>
              SVG
            </Button>
          </div>
        </div>
        {upgradeLabel && (
          <Button asChild className="mt-4 w-full">
            <Link href="/pricing">{upgradeLabel}</Link>
          </Button>
        )}
        <Button ref={closeButtonRef} type="button" onClick={onClose} variant="outline" className="mt-4 w-full">
          Close
        </Button>
      </div>
    </div>
  );
}
