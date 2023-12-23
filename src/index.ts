import SettingsNS from "./configs/settings.namespace";
import StatisticsNS from "./configs/statistics.namespace";
import { timeout } from "./helpers/timeout";
import { PlayPix } from "./modules/PlayPix";
import { galeFlow } from "./modules/PlayPix/helpers/galeFlow";
import { getInitialBetHistory } from "./modules/PlayPix/helpers/getInitialBetHistory";
import { rouletteRows } from "./modules/PlayPix/helpers/rows";
import { updateBetHistory } from "./modules/PlayPix/helpers/updateBetHistory";
import { verifyBetResultValue } from "./modules/PlayPix/helpers/verifyBetResultValue";
import { verifyIfIsReadyToBet } from "./modules/PlayPix/helpers/verifyIfIsReadyToBet";
import { DiscordWebhook } from "./modules/Webhook";
import { presetOne } from "./modules/PlayPix/helpers/betPresets";
import PreferencesNS from "./configs/preferences.namespace";
import { verifyStopPreferences } from "./helpers/verifyStopPreferences";

let playPix: PlayPix;
let wb: DiscordWebhook;

async function reloadPage() {
  await playPix.reloadPage();

  await timeout(12_000);

  StatisticsNS.rouletteDiagramStatistics = [];
  await playPix.openStatisticModal();

  await restartBot();
}

export async function restartBot() {
  await timeout(1_000);

  SettingsNS.isReadyToBet = false;
  SettingsNS.betResult = null;

  await initBot();
}

async function initBot() {
  try {
    // Caso seja o primeiro start, inicia as instancias
    if (!playPix || !wb) {
      playPix = new PlayPix();
      wb = new DiscordWebhook();

      await playPix.launch();

      console.log("[BOT] - Inicializado com sucesso!");

      await timeout(12_000);

      await playPix.openStatisticModal();
    }

    // Verifica as preferencias de win/stop
    verifyStopPreferences();

    // Verifica se houve algum gale
    if (StatisticsNS.galeCount > 0) await galeFlow(playPix, wb);

    // Inicia o bot após algum resultado de rodada
    if (!SettingsNS.betResult) await verifyBetResultValue(playPix);

    // Verifica se o histórico de apostas está vazio
    const notHasLocalBetHistory =
      SettingsNS.betHistory.length === 0 || !SettingsNS.betHistory;

    if (notHasLocalBetHistory) await getInitialBetHistory(playPix);

    // Atualiza o historico de partidas
    updateBetHistory();

    // Verifica se está pronto para apostar
    if (!SettingsNS.isReadyToBet) await verifyIfIsReadyToBet(playPix);

    // Verifica se é possivel apostar
    const allNumbersInTheSameRow = () => {
      for (const row in rouletteRows) {
        if (
          rouletteRows[row].includes(SettingsNS.betHistory[0]) &&
          rouletteRows[row].includes(SettingsNS.betHistory[1]) &&
          rouletteRows[row].includes(SettingsNS.betHistory[2])
        ) {
          SettingsNS.repeatedRow = row;
          return true;
        }
      }
    };

    if (!allNumbersInTheSameRow()) {
      await reloadPage();
    }

    // Valida se a row que repetiu é a com menor porcentagem
    let lowestPercentage = 100;
    let rowWithLowerPercentage = "";

    StatisticsNS.rouletteDiagramStatistics.forEach((item) => {
      const percentage = parseInt(item.percentage);
      if (percentage < lowestPercentage) {
        lowestPercentage = percentage;
        rowWithLowerPercentage = item.column;
      }
    });

    if (rowWithLowerPercentage !== SettingsNS.repeatedRow) {
      await reloadPage();
    }

    const percentageInThisBet = StatisticsNS.rouletteDiagramStatistics.find(
      (item) => item.column === SettingsNS.repeatedRow
    )!.percentage;

    StatisticsNS.percentageInThisBet = parseInt(percentageInThisBet);

    // Seleciona as colunas para apostar e notifica o usuário
    SettingsNS.betInRows = Object.keys(rouletteRows).filter(
      (row) => row !== SettingsNS.repeatedRow
    );

    StatisticsNS.betCount += 1;
    wb.sendSinal(SettingsNS.betInRows, SettingsNS.betHistory[0]);

    SettingsNS.betResult = null;

    // A aposta deve ser feita aqui

    if (PreferencesNS.betIn) {
      const boardFields = await playPix.selectBoardFields();

      const betChips = await playPix.selectBetChips();

      await presetOne(betChips, boardFields, false);

      playPix.printScreen(
        `./screenshots/${wb.sessionHash}-bet${StatisticsNS.betCount}.png`
      );
    }

    // Verifica se a rodada já acabou
    if (!SettingsNS.betResult) await verifyBetResultValue(playPix);

    // Verifica se ganhou ou perdeu
    const won = !rouletteRows[SettingsNS.repeatedRow!].includes(
      Number(SettingsNS.betResult)
    );

    // Caso tenha ganhado, atualiza os dados, se não marca um gale e reinicia o bot
    if (won) {
      wb.sendSinalResult(won, Number(SettingsNS.betResult));

      SettingsNS.repeatedRow = null;
      StatisticsNS.winRate.wins += 1;
      StatisticsNS.bestStreak += 1;

      wb.sendWR();
    } else {
      wb.sendGale();
      StatisticsNS.galeCount = 1;
    }

    await restartBot();
  } catch (error) {
    console.error(error);
  }
}

initBot();
