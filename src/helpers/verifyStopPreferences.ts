import PreferencesNS from "../configs/preferences.namespace";
import StatisticsNS from "../configs/statistics.namespace";

export function verifyStopPreferences() {
  if (!PreferencesNS.betIn) return;

  if (StatisticsNS.winRate.losses >= PreferencesNS.stopLoss) {
    if (PreferencesNS.useStopLossIfWinsNotCompenseLosses) {
      const hasMinimumWinsToCompensateLosses =
        StatisticsNS.winRate.wins / 11 >= PreferencesNS.stopLoss;

      if (!hasMinimumWinsToCompensateLosses) {
        console.log("[BOT] - Stop Loss atingido!");
        process.exit();
      }
    } else {
      console.log("[BOT] - Stop Loss atingido!");
      process.exit();
    }
  }

  if (StatisticsNS.winRate.wins >= PreferencesNS.stopWin) {
    console.log("[BOT] - Stop Win atingido!");
    process.exit();
  }

  return;
}
