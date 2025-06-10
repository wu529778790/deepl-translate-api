import { translate } from "./lib/main.js";

(async () => {
  await translate("how are you?", "en", "zh", "", false, true);
})();
