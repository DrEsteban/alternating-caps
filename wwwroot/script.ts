var capitalCheckbox: HTMLInputElement;
var randomnessCheckbox: HTMLInputElement;
var regenerateButton: HTMLButtonElement;
var randomOptionsDiv: HTMLDivElement;
var inputTextBox: HTMLInputElement;
var randomRatioBox: HTMLInputElement;

document.addEventListener('DOMContentLoaded', () => {
  capitalCheckbox = document.getElementById('capitalCheckbox') as HTMLInputElement;
  randomnessCheckbox = document.getElementById('randomnessCheckbox') as HTMLInputElement;
  regenerateButton = document.getElementById('regenerateButton') as HTMLButtonElement;
  randomOptionsDiv = document.getElementById('randomOptions') as HTMLDivElement;
  inputTextBox = document.getElementById('textInput') as HTMLInputElement;
  randomRatioBox = document.getElementById('randomRatio') as HTMLInputElement;
});

function alternateCaps(): void {
  if (capitalCheckbox.checked) {
    randomnessCheckbox.checked = false;
  } else if (randomnessCheckbox.checked) {
    capitalCheckbox.checked = false;
  }

  const introduceRandomness = randomnessCheckbox.checked;
  regenerateButton.hidden = !introduceRandomness;
  randomOptionsDiv.hidden = !introduceRandomness;
  let startWithCapital = capitalCheckbox.checked;
  const input = inputTextBox.value;
  let result = '';
  let j = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (isWhitespace(c)) {
      result += c;
    } else {
      if (introduceRandomness) {
        const randomVal = parseInt(randomRatioBox.value);
        if (randomVal > 100) {
          randomRatioBox.value = '100';
        } else if (randomVal < 0) {
          randomRatioBox.value = '0';
        }
        const randomnessRatio = randomVal / 100;
        if (Math.random() < randomnessRatio) {
          startWithCapital = !startWithCapital;
        }
      }
      if (startWithCapital) {
        result += j % 2 === 0 ? c.toUpperCase() : c.toLowerCase();
      } else {
        result += j % 2 === 0 ? c.toLowerCase() : c.toUpperCase();
      }
      j++;
    }
  }
  (document.getElementById('textOutput') as HTMLInputElement).value = result;
}

function isWhitespace(char: string): boolean {
  return /\s/.test(char);
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
