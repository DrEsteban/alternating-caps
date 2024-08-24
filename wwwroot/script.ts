function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

function alternateCaps(): void {
  let startsWithCapital = (document.getElementById('capitalCheckbox') as HTMLInputElement).checked;
  const introduceRandomness = (document.getElementById('randomnessCheckbox') as HTMLInputElement).checked;
  const input = (document.getElementById('textInput') as HTMLInputElement).value;
  let result = '';
  let j = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (isWhitespace(c)) {
      result += c;
    } else {
      if (introduceRandomness && Math.random() < 0.1) {
        startsWithCapital = !startsWithCapital;
      }
      if (startsWithCapital) {
        result += j % 2 === 0 ? c.toUpperCase() : c.toLowerCase();
      } else {
        result += j % 2 === 0 ? c.toLowerCase() : c.toUpperCase();
      }
      j++;
    }
  }
  (document.getElementById('textOutput') as HTMLInputElement).value = result;
}

async function copyToClipboard(): Promise<void> {
  const copyText = document.getElementById('textOutput') as HTMLInputElement;
  copyText.select();
  await navigator.clipboard.writeText(copyText.value);
  const tooltip = document.getElementById('myTooltip') as HTMLElement;
  tooltip.style.opacity = '1';
  setTimeout(() => {
    tooltip.style.opacity = '0';
  }, 2000);
}