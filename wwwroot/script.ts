const version = '1.0.0';
const settingsStorageName = `settings-${version}`;

var capitalCheckbox: HTMLInputElement;
var randomnessCheckbox: HTMLInputElement;
var regenerateButton: HTMLButtonElement;
var randomOptionsDiv: HTMLDivElement;
var inputTextBox: HTMLInputElement;
var randomRatioBox: HTMLInputElement;
var outputTextBox: HTMLInputElement;
var tooltip: HTMLSpanElement;

type Settings = {
  capital: boolean,
  randomness: boolean,
  randomRatio: string
}

document.addEventListener('DOMContentLoaded', () => {
  capitalCheckbox = document.getElementById('capitalCheckbox') as HTMLInputElement;
  randomnessCheckbox = document.getElementById('randomnessCheckbox') as HTMLInputElement;
  regenerateButton = document.getElementById('regenerateButton') as HTMLButtonElement;
  randomOptionsDiv = document.getElementById('randomOptions') as HTMLDivElement;
  inputTextBox = document.getElementById('textInput') as HTMLInputElement;
  randomRatioBox = document.getElementById('randomRatio') as HTMLInputElement;
  outputTextBox = document.getElementById('textOutput') as HTMLInputElement;
  tooltip = document.getElementById('tooltip') as HTMLSpanElement;
  const settings = localStorage.getItem(settingsStorageName);
  if (settings) {
    const parsedSettings: Settings = JSON.parse(settings);
    capitalCheckbox.checked = parsedSettings.capital;
    randomnessCheckbox.checked = parsedSettings.randomness;
    randomRatioBox.value = parsedSettings.randomRatio;
    // Update UI to reflect loaded settings
    alternateCaps();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

function alternateCaps(): void {
  const introduceRandomness = randomnessCheckbox.checked;
  // Hide the random options if randomness is not selected
  regenerateButton.hidden = !introduceRandomness;
  randomOptionsDiv.hidden = !introduceRandomness;

  // Using 'let' instead of 'const' because the value of 'startWithCapital' can change 
  // based on the randomness checkbox
  let startWithCapital = capitalCheckbox.checked;
  const input = inputTextBox.value;
  let result = '';
  let j = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (!isLetter(c)) {
      // Don't increment counter when whitespace is encountered
      result += c;
    } else {
      if (!(i === 0 && startWithCapital) && // only introduce randomness on first iteration if not startWithCapital
          introduceRandomness) {
        const randomVal = parseInt(randomRatioBox.value);
        if (randomVal > 100) {
          randomRatioBox.value = '100';
        } else if (randomVal < 0) {
          randomRatioBox.value = '0';
        }
        const randomnessRatio = randomVal / 100;
        if (Math.random() < randomnessRatio) {
          // Flip the value of 'startWithCapital' based on randomness
          startWithCapital = !startWithCapital;
        }
      }

      // Alternate between upper and lower case based on the value of 'startWithCapital'
      result += (j % 2 === 0) === startWithCapital ? c.toUpperCase() : c.toLowerCase();
      // if (startWithCapital) {
      //   result += j % 2 === 0 ? c.toUpperCase() : c.toLowerCase();
      // } else {
      //   result += j % 2 === 0 ? c.toLowerCase() : c.toUpperCase();
      // }
      j++;
    }
  }
  outputTextBox.value = result;
}

function saveSettings(): void {
  const settings: Settings = {
    capital: capitalCheckbox.checked,
    randomness: randomnessCheckbox.checked,
    randomRatio: randomRatioBox.value
  };
  localStorage.setItem(settingsStorageName, JSON.stringify(settings));
}

function isLetter(char: string): boolean {
  return /[a-zA-Z]/.test(char);
}

var timeoutHandle: number | undefined;
async function copyToClipboard(): Promise<void> {
  outputTextBox.select();
  await navigator.clipboard.writeText(outputTextBox.value);
  tooltip.style.opacity = '1';
  clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(() => {
    tooltip.style.opacity = '0';
  }, 2000);
}

function checkboxChanged(el: HTMLInputElement): void {
  saveSettings();
  alternateCaps();
}

// Ensure the random ratio is between 0 and 100
function randomRatioChanged(): void {
  if (!randomRatioBox.value) {
    randomRatioBox.value = '15';
  }
  const val = parseInt(randomRatioBox.value);
  if (val > 100) {
    randomRatioBox.value = '100';
  } else if (val < 0) {
    randomRatioBox.value = '0';
  }
  saveSettings();
  alternateCaps();
}
