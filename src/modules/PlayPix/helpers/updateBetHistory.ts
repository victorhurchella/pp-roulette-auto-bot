import SettingsNS from "../../../configs/settings.namespace";

export function updateBetHistory() {
  SettingsNS.betHistory.pop();
  SettingsNS.betHistory.unshift(Number(SettingsNS.betResult));
}
