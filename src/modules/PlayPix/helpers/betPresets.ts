import { ElementHandle } from "puppeteer";
import { timeout } from "../../../helpers/timeout";
import SettingsNS from "../../../configs/settings.namespace";

export type IRows = "1" | "2" | "3";

interface IBoardFields {
  zero: ElementHandle<Element>;
  "3": ElementHandle<Element>;
  "2": ElementHandle<Element>;
  "1": ElementHandle<Element>;
}

export async function presetOne(
  chips: Array<ElementHandle<Element>>,
  fields: IBoardFields,
  isGale: boolean
) {
  const betRows = SettingsNS.betInRows! as Array<IRows>;

  if (isGale) {
    // Selecionar 0.5
    chips[0].click();
    await timeout(310);

    fields.zero.click();
    await timeout(310);

    fields.zero.click();
    await timeout(310);

    // Selecionar 1.5
    chips[1].click();
    await timeout(310);

    betRows.forEach((row) => fields[row].click());
    await timeout(310);

    // Selecionar 5
    chips[3].click();
    await timeout(310);

    betRows.forEach((row) => fields[row].click());
    await timeout(310);

    betRows.forEach((row) => fields[row].click());
    await timeout(310);
  } else {
    // Selecionar 0.5
    chips[0].click();
    await timeout(310);

    fields.zero.click();
    await timeout(310);

    betRows.forEach((row) => fields[row].click());
    await timeout(310);

    // Selecionar 1.5
    chips[1].click();
    await timeout(310);

    betRows.forEach((row) => fields[row].click());
    await timeout(310);

    betRows.forEach((row) => fields[row].click());
    await timeout(310);
  }
}
