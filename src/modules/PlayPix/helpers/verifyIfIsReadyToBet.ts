import { PlayPix } from "../index";
import SettingsNS from "../../../configs/settings.namespace";
import { timeout } from "../../../helpers/timeout";

export async function verifyIfIsReadyToBet(instance: PlayPix) {
  const readyToBet = await instance.selectReadyToBet();

  if (!readyToBet) {
    await timeout(500);

    await verifyIfIsReadyToBet(instance);
  } else {
    SettingsNS.isReadyToBet = readyToBet;
    return;
  }
}
