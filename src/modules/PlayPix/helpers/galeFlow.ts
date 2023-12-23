import { restartBot } from "../../../index";
import { timeout } from "../../../helpers/timeout";
import { rouletteRows } from "./rows";
import { verifyBetResultValue } from "./verifyBetResultValue";
import { PlayPix } from "../index";
import { DiscordWebhook } from "../../Webhook";

import SettingsNS from "../../../configs/settings.namespace";
import StatisticsNS from "../../../configs/statistics.namespace";
import { verifyIfIsReadyToBet } from "./verifyIfIsReadyToBet";
import { presetOne } from "./betPresets";
import PreferencesNS from "../../../configs/preferences.namespace";

export async function galeFlow(instance: PlayPix, wbInstance: DiscordWebhook) {
  if (!SettingsNS.isReadyToBet) await verifyIfIsReadyToBet(instance);

  if (PreferencesNS.betIn) {
    await timeout(1_000);

    const boardFields = await instance.selectBoardFields();
    const betChips = await instance.selectBetChips();
    await presetOne(betChips, boardFields, true);
    instance.printScreen(
      `./screenshots/${wbInstance.sessionHash}-bet${StatisticsNS.betCount}-gale.png`
    );
  }

  await timeout(25_000);

  if (!SettingsNS.betResult) await verifyBetResultValue(instance);

  const won = !rouletteRows[SettingsNS.repeatedRow!].includes(
    Number(SettingsNS.betResult!)
  );

  if (won) {
    wbInstance.sendSinalResult(won, Number(SettingsNS.betResult));

    SettingsNS.repeatedRow = null;
    StatisticsNS.winRate.wins += 1;
    StatisticsNS.bestStreak += 1;

    wbInstance.sendWR();
  } else {
    wbInstance.sendSinalResult(won, Number(SettingsNS.betResult));

    SettingsNS.repeatedRow = null;
    StatisticsNS.winRate.losses += 1;
    StatisticsNS.bestStreak = 0;

    wbInstance.sendWR();
  }

  StatisticsNS.galeCount = 0;

  await restartBot();
}
