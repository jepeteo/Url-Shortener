"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function BuyMeACoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/theodorosm"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png"
        alt="Buy Me A Coffee"
        width={131}
        height={36}
      />
    </a>
  );
}
