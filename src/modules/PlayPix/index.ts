import puppeteer, { Browser, Page } from "puppeteer";
import { timeout } from "../../helpers/timeout";
import StatisticsNS from "../../configs/statistics.namespace";

export class PlayPix {
  browser: Browser | null;
  page: Page | null;

  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launch() {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      channel: "chrome",
      headless: "new",
      args: ["--enable-features=UseOzonePlatform"],
    });

    this.page = (await this.browser.pages())[0];

    await this.page.goto(
      "https://rgs-livedealerwebclient.playpix.com/pb/18750115/105"
    );

    return this.page;
  }

  async selectRouletteHistory() {
    if (!this.page) return;

    const rouletteHistoryElement = await this.page.$(
      "#app .game-layout .roulette-desktop .statistics-layout .mini-statistics"
    );

    if (!rouletteHistoryElement) return;

    const spans = await rouletteHistoryElement.$$("span");

    const rouletteHistory = [];

    for (const span of spans) {
      const currentNumber = await this.page.evaluate(
        (el: any) => el.textContent,
        span
      );

      rouletteHistory.push(Number(currentNumber));
    }

    return rouletteHistory;
  }

  async selectReadyToBet() {
    if (!this.page) return;

    const readyToBetTextElement = await this.page.$(
      "#app .game-layout .roulette-desktop .betting-time"
    );

    return !!readyToBetTextElement;
  }

  async selectBetResult() {
    if (!this.page) return;

    const betResultElement = await this.page.$(
      "#app .game-layout .roulette-desktop .results-layout .results-layout-in .results-top .results-top-in .results-svg"
    );

    if (!betResultElement) return false;

    const betResultText = await this.page.evaluate((element) => {
      const svg = element.querySelector("svg"); // Seleciona o elemento <svg>
      if (!svg) return null;

      const gElement = svg.querySelectorAll("g"); // Seleciona o elemento <g> dentro do SVG
      if (!gElement) return null;

      const textElement = gElement.item(1).querySelector("text"); // Seleciona o elemento <text> dentro do <g>
      if (!textElement) return null;

      return textElement.textContent; // Retorna o texto dentro do elemento <text>
    }, betResultElement);

    return betResultText;
  }

  async selectBalance() {
    if (!this.page) return;

    const currencyElement = await this.page.$(
      "#app .game-layout .roulette-desktop .balance-layout .balance-button .balance-button-text"
    );

    if (!currencyElement) return;

    const currencyText = await currencyElement.evaluate((element) => {
      const strongElements = Array.from(element.querySelectorAll("strong"));
      return strongElements.flatMap((strongElement) => strongElement.innerText);
    });

    const currency = Number(currencyText[0].replace(/[^0-9]/g, ""));

    return currency;
  }

  async reloadPage() {
    if (!this.page) return;

    await this.page.reload();
  }

  async selectBoardFields() {
    const zeroField = await this.page!.$$(
      "#app .game-layout .roulette-desktop .board-wrapper-layout .board-layout .classic .board-in .board-center .green .board-cell-in .bet-chip-area.center-center"
    );

    const columnsFields = await this.page!.$$(
      "#app .game-layout .roulette-desktop .board-wrapper-layout .board-layout .classic .board-in .board-right .board-cell"
    );

    const fields = {
      zero: zeroField[0],

      "3": columnsFields[0],
      "2": columnsFields[1],
      "1": columnsFields[2],
    };

    return fields;
  }

  async selectBetChips() {
    const betChips = await this.page!.$$(
      "#app .game-layout .roulette-desktop .betting-time .state-actions-wrapper-in .chip-slider .chip-slider-in .chip-slider-inner .chip-slider-section .chip-slider-section-in .bet-chip-holder"
    );

    return betChips;
  }

  async openStatisticModal() {
    if (!this.page) return;

    const statisticsPopup = await this.page!.$$(
      "#app .game-layout .roulette-desktop .statistics-layout .statistics-right .statistics .game-popup-toggle"
    );

    statisticsPopup[0].click();
    await timeout(1_000);

    const statisticsPopupHeader = await this.page!.$$(
      "#app .game-layout .roulette-desktop .statistics-layout .statistics-right .statistics .game-popup.statistics .game-popup-header ul li"
    );

    const diagramButton = await statisticsPopupHeader[1].$$("button");

    diagramButton[0].click();
    await timeout(500);

    const statisticsBasedInlastXRoundsInputElement = await this.page!.$(
      "#app .game-layout .roulette-desktop .statistics-layout .statistics-right .statistics .game-popup.statistics .game-popup-footer .statistics-rounds .statistics-rounds-range input"
    );

    const boundingBox =
      await statisticsBasedInlastXRoundsInputElement!.boundingBox();

    await this.page!.mouse.click(boundingBox!.x, boundingBox!.y);

    await timeout(500);

    const diagramStatisticsElement = await this.page!.$$(
      "#app .game-layout .roulette-desktop .statistics-layout .statistics-right .statistics .game-popup.statistics .game-popup-body .diagrams .diagrams-in"
    );

    const diagramStatisticsPercentages = await diagramStatisticsElement[2].$$(
      ".diagrams-dc"
    );

    const diagramStatisticsPercentagesOfColumns =
      await diagramStatisticsPercentages[1].$$(
        ".diagrams-dc-body .diagrams-dc-item"
      );

    for (const column of diagramStatisticsPercentagesOfColumns) {
      const stats = await column.evaluate((element) => {
        const span = Array.from(element.querySelectorAll("span"));
        return { column: span[0].innerText, percentage: span[1].innerText };
      });

      StatisticsNS.rouletteDiagramStatistics.push(stats);
    }

    return;
  }

  printScreen(path: string) {
    if (!this.page) return;

    return this.page.screenshot({ path });
  }
}
