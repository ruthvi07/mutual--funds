export const mutualFunds = [
  {
    id: 1,
    name: "Axis Bluechip Fund",
    category: "Large Cap",
    fundType: "Equity",
    risk: "Moderate",
    returns1Y: 18.6,
    returns3Y: 16.2,
    returns5Y: 14.8,
    expenseRatio: 0.72,
    aum: 33450,
    avgMonthlyIncome: 7800,
    roiScore: 84,
    rating: 4.4,
    reviewCount: 324,
    fundManager: "Shreyash Devalkar",
    exitLoad: "1% if redeemed within 12 months",
    lockIn: "No lock-in",
    contractType: "Open-ended equity contract with SIP flexibility",
    fundHouse: "Axis Mutual Fund",
    companies: ["HDFC Bank", "Infosys", "ICICI Bank", "TCS"],
    sectorAllocation: { Banking: 31, IT: 24, FMCG: 18, Auto: 14, Others: 13 },
    growthPoints: [8, 12, 16, 18, 21, 25, 24, 27, 31, 35, 39, 43],
    riskMetrics: { stdDev: 12.4, beta: 0.94, sharpe: 0.82, alpha: 2.8 },
    reviews: [
      "Stable fund for long-term SIP.",
      "Good downside protection in correction periods.",
      "Expense ratio is reasonable for category."
    ]
  },
  {
    id: 2,
    name: "Parag Parikh Flexi Cap Fund",
    category: "Flexi Cap",
    fundType: "Equity",
    risk: "Moderate to High",
    returns1Y: 21.4,
    returns3Y: 19.1,
    returns5Y: 18.3,
    expenseRatio: 0.79,
    aum: 67210,
    avgMonthlyIncome: 8900,
    roiScore: 90,
    rating: 4.7,
    reviewCount: 516,
    fundManager: "Rajeev Thakkar",
    exitLoad: "2% if redeemed within 12 months",
    lockIn: "No lock-in",
    contractType: "Open-ended flexi allocation with foreign equity exposure",
    fundHouse: "PPFAS Mutual Fund",
    companies: ["Alphabet", "Meta", "HDFC Bank", "Bajaj Finance"],
    sectorAllocation: { Banking: 22, Technology: 30, Pharma: 10, Consumer: 19, Others: 19 },
    growthPoints: [9, 14, 20, 26, 24, 29, 35, 39, 45, 50, 57, 61],
    riskMetrics: { stdDev: 14.8, beta: 1.08, sharpe: 0.91, alpha: 3.9 },
    reviews: [
      "Excellent risk-adjusted returns.",
      "Diversification strategy is strong.",
      "Good option for 5+ year horizon."
    ]
  },
  {
    id: 3,
    name: "SBI Small Cap Fund",
    category: "Small Cap",
    fundType: "Equity",
    risk: "High",
    returns1Y: 24.7,
    returns3Y: 22.9,
    returns5Y: 21.8,
    expenseRatio: 0.94,
    aum: 27980,
    avgMonthlyIncome: 10100,
    roiScore: 93,
    rating: 4.6,
    reviewCount: 411,
    fundManager: "R Srinivasan",
    exitLoad: "1% if redeemed within 1 year",
    lockIn: "No lock-in",
    contractType: "Open-ended small-cap growth contract",
    fundHouse: "SBI Mutual Fund",
    companies: ["Apar Industries", "Kirloskar Oil", "Blue Star", "Sudarshan Chem"],
    sectorAllocation: { Industrials: 28, Chemicals: 24, Engineering: 19, Finance: 14, Others: 15 },
    growthPoints: [6, 11, 9, 15, 22, 18, 27, 34, 32, 41, 52, 60],
    riskMetrics: { stdDev: 18.1, beta: 1.21, sharpe: 0.88, alpha: 4.2 },
    reviews: [
      "High growth potential but volatile.",
      "Needs strong risk appetite.",
      "Good returns over long cycles."
    ]
  },
  {
    id: 4,
    name: "HDFC Hybrid Equity Fund",
    category: "Aggressive Hybrid",
    fundType: "Hybrid",
    risk: "Moderate",
    returns1Y: 15.3,
    returns3Y: 13.8,
    returns5Y: 12.6,
    expenseRatio: 0.88,
    aum: 19340,
    avgMonthlyIncome: 6200,
    roiScore: 78,
    rating: 4.1,
    reviewCount: 208,
    fundManager: "Anil Bamboli",
    exitLoad: "1% if redeemed within 18 months",
    lockIn: "No lock-in",
    contractType: "Hybrid contract balancing equity and debt positions",
    fundHouse: "HDFC Mutual Fund",
    companies: ["Reliance", "L&T", "SBI", "NTPC"],
    sectorAllocation: { Banking: 18, Energy: 16, Infrastructure: 21, Bonds: 25, Others: 20 },
    growthPoints: [7, 9, 12, 14, 15, 19, 21, 23, 25, 28, 30, 33],
    riskMetrics: { stdDev: 10.2, beta: 0.78, sharpe: 0.73, alpha: 1.7 },
    reviews: [
      "Balanced risk profile for moderate investors.",
      "Return consistency is decent.",
      "Useful for conservative growth allocation."
    ]
  },
  {
    id: 5,
    name: "ICICI Prudential Corporate Bond Fund",
    category: "Corporate Bond",
    fundType: "Debt",
    risk: "Low to Moderate",
    returns1Y: 8.4,
    returns3Y: 7.3,
    returns5Y: 7.8,
    expenseRatio: 0.52,
    aum: 14220,
    avgMonthlyIncome: 4200,
    roiScore: 68,
    rating: 4.0,
    reviewCount: 188,
    fundManager: "Manish Banthia",
    exitLoad: "Nil",
    lockIn: "No lock-in",
    contractType: "Open-ended debt contract focused on high quality corporate debt",
    fundHouse: "ICICI Prudential Mutual Fund",
    companies: ["REC", "PFC", "LIC Housing", "NABARD"],
    sectorAllocation: { AAA_Bonds: 64, PSU_Bonds: 18, SDL: 10, Cash: 8 },
    growthPoints: [4, 6, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15],
    riskMetrics: { stdDev: 4.2, beta: 0.31, sharpe: 0.66, alpha: 0.8 },
    reviews: [
      "Good for low volatility investors.",
      "Steady returns with lower drawdowns.",
      "Works in conservative portfolios."
    ]
  },
  {
    id: 6,
    name: "Mirae Asset ELSS Tax Saver Fund",
    category: "ELSS",
    fundType: "ELSS",
    risk: "Moderate to High",
    returns1Y: 20.2,
    returns3Y: 18.4,
    returns5Y: 16.9,
    expenseRatio: 0.71,
    aum: 23610,
    avgMonthlyIncome: 7600,
    roiScore: 86,
    rating: 4.5,
    reviewCount: 267,
    fundManager: "Neelesh Surana",
    exitLoad: "Nil",
    lockIn: "3 years",
    contractType: "Tax-saving ELSS contract under Sec 80C with mandatory lock-in",
    fundHouse: "Mirae Asset Mutual Fund",
    companies: ["Infosys", "Axis Bank", "Avenue Supermarts", "Larsen & Toubro"],
    sectorAllocation: { Banking: 26, IT: 20, Consumer: 17, Industrials: 18, Others: 19 },
    growthPoints: [8, 10, 14, 19, 22, 25, 27, 33, 36, 40, 44, 48],
    riskMetrics: { stdDev: 13.7, beta: 1.03, sharpe: 0.84, alpha: 3.2 },
    reviews: [
      "Great option for tax saving with growth.",
      "3-year lock-in encourages discipline.",
      "Fund house consistency is strong."
    ]
  }
];

export const insightCards = [
  {
    title: "What influences your fund choice?",
    description: "Risk appetite, investment duration, expense ratio, and fund manager track record are key selection drivers."
  },
  {
    title: "How are mutual funds structured?",
    description: "An AMC pools investor money and allocates assets across equity, debt, or hybrid instruments based on scheme objective."
  },
  {
    title: "How to read risk metrics",
    description: "Use standard deviation, beta, sharpe and alpha to evaluate volatility and risk-adjusted performance."
  }
];

export const fundTypes = [
  {
    type: "Equity Funds",
    description: "Invest primarily in company stocks. High growth potential with market-linked volatility.",
    risk: "Moderate to High"
  },
  {
    type: "Debt Funds",
    description: "Invest in bonds and fixed-income securities. Lower risk with relatively stable returns.",
    risk: "Low to Moderate"
  },
  {
    type: "Hybrid Funds",
    description: "Combine equity and debt for balance between growth and stability.",
    risk: "Moderate"
  },
  {
    type: "Index Funds",
    description: "Track a benchmark index such as Nifty 50. Passive strategy with low cost.",
    risk: "Moderate"
  },
  {
    type: "ELSS (Tax Saving)",
    description: "Equity-linked savings scheme with 3-year lock-in and Section 80C tax benefit.",
    risk: "Moderate to High"
  }
];

export const advisorEducationSeed = [
  {
    id: 1,
    title: "How to Pick Mutual Funds by Risk Profile",
    type: "Article",
    summary: "Simple framework to shortlist funds using risk tolerance and time horizon.",
    likes: 21,
    comments: ["Very useful", "Please add examples for debt funds"]
  },
  {
    id: 2,
    title: "SIP Discipline During Volatility",
    type: "Video",
    summary: "Why continuing SIP during market corrections helps long-term wealth creation.",
    likes: 14,
    comments: ["Clear explanation", "Good for beginners"]
  },
  {
    id: 3,
    title: "Monthly Market Pulse",
    type: "Market Analysis",
    summary: "Category flows, valuation trends, and risk indicators for the month.",
    likes: 9,
    comments: ["Can you compare to last quarter?"]
  }
];
