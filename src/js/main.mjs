import { initNavigation } from "./navigation.mjs";
import { initTerminal } from "./terminal.mjs";

document.documentElement.dataset.js = "true";
initNavigation({ document, window });
initTerminal({ document, window });
