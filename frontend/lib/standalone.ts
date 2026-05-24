import { initRUM } from "./rum";

// Initialize the RUM agent automatically when this script is loaded.
if (typeof window !== "undefined") {
  initRUM();
}
