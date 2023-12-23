import { EmbedBuilder, WebhookClient } from "discord.js";
import { generateSession } from "../../helpers/generateSession";
import WebhookNS from "../../configs/webhook.namespace";
import StatisticsNS from "../../configs/statistics.namespace";
import PreferencesNS from "../../configs/preferences.namespace";

export class DiscordWebhook {
  sinalsWebhook: WebhookClient;
  wrWebhook: WebhookClient;
  sessionHash: string;

  constructor() {
    this.sinalsWebhook = new WebhookClient({
      url: WebhookNS.sinalsRoom.url,
    });

    this.wrWebhook = new WebhookClient({
      url: WebhookNS.wrRoom.url,
    });

    this.sessionHash = generateSession();
  }

  async sendSinal(rows: Array<string>, lastNumber: number) {
    const embed = new EmbedBuilder()
      .setTitle("🎡 Entrada confirmada!")
      .setDescription(
        `
        📊 Sessão: ${this.sessionHash}.
        🎰 Quantidade de apostas: ${StatisticsNS.betCount}.
         ${PreferencesNS.betIn ? "🎲 Aposta automática 🎲" : ""}

        📈 Porcentagem da coluna que repetiu: ${
          StatisticsNS.percentageInThisBet
        }%
        🚩 Entrar na **${rows[0]}ª** e **${rows[1]}ª** fileira e no **zero**.
        🎲 Último número: ${lastNumber}.
        
        📍 Faça apenas um gale.

      `
      )
      .setColor("#007FFF")
      .setTimestamp();

    await this.sinalsWebhook.send({
      username: WebhookNS.sinalsRoom.username,
      avatarURL: WebhookNS.avatarURL,
      embeds: [embed],
    });
  }

  async sendSinalResult(won: boolean, betResult: number) {
    const title = won ? "🎉 Vitória!" : "😢 Derrota!";

    const description =
      betResult === 0
        ? "🎲 Zerinhoooooo 🎲"
        : `🎲 Último número: ${betResult}.`;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("#EEAD2D")
      .setTimestamp();

    await this.sinalsWebhook.send({
      username: WebhookNS.sinalsRoom.username,
      avatarURL: WebhookNS.avatarURL,
      embeds: [embed],
    });
  }

  async sendGale() {
    const embed = new EmbedBuilder()
      .setTitle("🎲 Entrada de Gale.")
      .setColor("#FF6600")
      .setTimestamp();

    await this.sinalsWebhook.send({
      username: WebhookNS.sinalsRoom.username,
      avatarURL: WebhookNS.avatarURL,
      embeds: [embed],
    });
  }

  async sendWR() {
    const wins = StatisticsNS.winRate.wins;
    const losses = StatisticsNS.winRate.losses;
    const bestStreak = StatisticsNS.bestStreak;

    const embed = new EmbedBuilder()
      .setTitle("Atualização da taxa de vitória:")
      .setDescription(
        `
        📊 Sessão: ${this.sessionHash}.

        🏆 Quantidade: ${wins}/${losses}
        🎲 Porcentagem: **${((wins / (wins + losses)) * 100).toFixed()}%**
        📈 Melhor sequência: ${bestStreak} vitórias.
        `
      )
      .setColor("#39FF14")
      .setTimestamp();

    await this.wrWebhook.send({
      username: WebhookNS.wrRoom.username,
      avatarURL: WebhookNS.avatarURL,
      embeds: [embed],
    });
  }
}
