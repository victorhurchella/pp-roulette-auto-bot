namespace StatisticsNS {
  export let bestStreak = 0;
  export let galeCount = 0;
  export let betCount = 0;
  export let percentageInThisBet = 0;
  export let winRate = {
    wins: 0,
    losses: 0,
  };
  export let rouletteDiagramStatistics: Array<{
    column: string;
    percentage: string;
  }> = [];
}

export default StatisticsNS;
