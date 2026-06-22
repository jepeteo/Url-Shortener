import Image from "next/image";

export default function BuyMeACoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/theodorosm"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
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
