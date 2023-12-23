import SettingsNS from "../../../configs/settings.namespace";
import { restartBot } from "../../../index";
import { PlayPix } from "../index";

export async function getInitialBetHistory(instance: PlayPix) {
  const rouletteHistory = await instance.selectRouletteHistory();

  if (!rouletteHistory) {
    return restartBot();
  }

  SettingsNS.betHistory.push(
    rouletteHistory[0],
    rouletteHistory[1],
    rouletteHistory[2]
  );
}
