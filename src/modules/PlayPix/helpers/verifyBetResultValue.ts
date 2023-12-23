import { PlayPix } from "../index";
import SettingsNS from "../../../configs/settings.namespace";
import { timeout } from "../../../helpers/timeout";

export async function verifyBetResultValue(instance: PlayPix) {
  const betResultValue = await instance.selectBetResult();

  if (!betResultValue) {
    await timeout(500);

    await verifyBetResultValue(instance);
  } else {
    SettingsNS.betResult = betResultValue;
    return;
  }
}
