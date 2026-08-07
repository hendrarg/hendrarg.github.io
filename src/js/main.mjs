import { initJourney } from "./journey.mjs";
import { initNavigation } from "./navigation.mjs";
import { initAudioPlayer } from "./player-audio.mjs";
import { initPlayerTilt } from "./player-tilt.mjs";
import { initTerminal } from "./terminal.mjs";

document.documentElement.dataset.js = "true";
initNavigation({ document, window });
initTerminal({ document, window });
initPlayerTilt({ document, window });
initAudioPlayer({ document });
initJourney({ document, window });
