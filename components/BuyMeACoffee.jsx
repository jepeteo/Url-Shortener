
import { useEffect } from 'react';

export default function BuyMeACoffee() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
    script.setAttribute('data-name', 'bmc-button');
    script.setAttribute('data-slug', 'theodorosm');
    script.setAttribute('data-color', '#FFDD00');
    script.setAttribute('data-emoji', '☕');
    script.setAttribute('data-font', 'Cookie');
    script.setAttribute('data-text', 'Buy me a coffee');
    script.setAttribute('data-outline-color', '#000000');
    script.setAttribute('data-font-color', '#000000');
    script.setAttribute('data-coffee-color', '#ffffff');
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="buy-me-a-coffee-container"></div>;
}
