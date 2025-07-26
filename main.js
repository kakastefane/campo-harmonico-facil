document.addEventListener('DOMContentLoaded', () => {
  // --- DATA ---
  const notesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const notesFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  // Major scale structure: W-W-H-W-W-W-H (Whole, Whole, Half, etc.)
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11]; // In semitones from root

  // Chord qualities for the major harmonic field
  const chordQualities = ["", "m", "m", "", "", "m", "°"];

  // Roman numerals for degrees
  const degreeNames = ["I", "II", "III", "IV", "V", "VI", "VII"];

  // Functional harmony names in Portuguese
  const degreeFunctions = [
    "Tônica (Maior)",
    "Supertônica (Menor)",
    "Mediante (Menor)",
    "Subdominante (Maior)",
    "Dominante (Maior)",
    "Superdominante (Relativo Menor)",
    "Sensível (Diminuto)"
  ];

  // --- STATE ---
  let currentKeyIndex = 0; // C is the default key at index 0

  // --- DOM ELEMENTS ---
  const keySelector = document.getElementById('key-selector');
  const semitoneUpBtn = document.getElementById('semitone-up');
  const semitoneDownBtn = document.getElementById('semitone-down');
  const currentKeyDisplay = document.getElementById('current-key-display');
  const harmonicFieldGrid = document.getElementById('harmonic-field-grid');

  // --- FUNCTIONS ---

  /**
   * Generates the harmonic field for a given root note index.
   * @param {number} rootNoteIndex - The index of the root note (0-11).
   * @returns {Array<Object>} An array of objects, each representing a degree of the harmonic field.
   */
  function getHarmonicField(rootNoteIndex) {
    const field = [];
    const useFlat = notesFlat[rootNoteIndex].includes('b'); // Use flat names if the key is flat

    for (let i = 0; i < 7; i++) {
      const noteInterval = majorScaleIntervals[i];
      const currentNoteIndex = (rootNoteIndex + noteInterval) % 12;

      // Decide whether to show sharp or flat version of the note
      const noteName = useFlat ? notesFlat[currentNoteIndex] : notesSharp[currentNoteIndex];

      const chordName = noteName + chordQualities[i];

      field.push({
        degree: degreeNames[i],
        chord: chordName,
        characteristic: degreeFunctions[i]
      });
    }
    return field;
  }

  /**
   * Renders the harmonic field cards into the DOM.
   */
  function renderHarmonicField() {
    // Determine the name of the key to display
    const keyName = notesFlat[currentKeyIndex] === notesSharp[currentKeyIndex]
      ? notesSharp[currentKeyIndex]
      : `${notesSharp[currentKeyIndex]} / ${notesFlat[currentKeyIndex]}`;

    currentKeyDisplay.textContent = keyName;
    // Add a little animation on change
    currentKeyDisplay.classList.add('scale-110', 'opacity-50');
    setTimeout(() => currentKeyDisplay.classList.remove('scale-110', 'opacity-50'), 150);


    const field = getHarmonicField(currentKeyIndex);

    harmonicFieldGrid.innerHTML = ''; // Clear previous cards

    field.forEach((degreeInfo, index) => {
      const card = document.createElement('div');
      card.className = 'bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105 hover:border-blue-500';
      card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.05}s both`;

      card.innerHTML = `
        <div class="text-5xl font-bold text-blue-400 mb-2">${degreeInfo.chord}</div>
        <div class="text-2xl text-gray-300 mb-4">${degreeInfo.degree}</div>
        <div class="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">${degreeInfo.characteristic}</div>
      `;
      harmonicFieldGrid.appendChild(card);
    });
  }

  /**
   * Populates the key selector dropdown with all possible keys.
   */
  function populateSelector() {
    notesSharp.forEach((note, index) => {
      const option = document.createElement('option');
      option.value = index;

      // Display both sharp and flat names where they differ
      const displayName = notesFlat[index] === notesSharp[index]
        ? notesSharp[index]
        : `${notesSharp[index]} / ${notesFlat[index]}`;

      option.textContent = displayName;
      keySelector.appendChild(option);
    });
  }

  /**
   * Updates the application state and UI based on the currentKeyIndex.
   */
  function updateApp() {
    keySelector.value = currentKeyIndex;
    renderHarmonicField();
  }

  // --- EVENT LISTENERS ---
  keySelector.addEventListener('change', (e) => {
    currentKeyIndex = parseInt(e.target.value);
    updateApp();
  });

  semitoneUpBtn.addEventListener('click', () => {
    currentKeyIndex = (currentKeyIndex + 1) % 12;
    updateApp();
  });

  semitoneDownBtn.addEventListener('click', () => {
    currentKeyIndex = (currentKeyIndex - 1 + 12) % 12;
    updateApp();
  });

  // --- INITIALIZATION ---
  populateSelector();
  updateApp(); // Initial render with C major

  // Add CSS animation keyframes dynamically
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(styleSheet);
});

// --- SERVICE WORKER REGISTRATION FOR PWA ---
if ('serviceWorker' in navigator) {
  const swContent = `
    const CACHE_NAME = 'harmonic-field-cache-v1';
    const urlsToCache = [
        '/',
        'https://cdn.tailwindcss.com',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'
    ];

    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
          })
      );
    });

    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            return fetch(event.request);
          }
        )
      );
    });
  `;
  const swBlob = new Blob([swContent], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(swBlob);

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}