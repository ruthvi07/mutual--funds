package com.mutualfunds.backend.service;

import com.mutualfunds.backend.domain.AlertNotification;
import com.mutualfunds.backend.domain.AppUser;
import com.mutualfunds.backend.domain.Complaint;
import com.mutualfunds.backend.domain.EducationPost;
import com.mutualfunds.backend.domain.GoalPlan;
import com.mutualfunds.backend.domain.MutualFund;
import com.mutualfunds.backend.domain.PortfolioHolding;
import com.mutualfunds.backend.domain.SipPlan;
import com.mutualfunds.backend.domain.UserRole;
import com.mutualfunds.backend.repository.AlertNotificationRepository;
import com.mutualfunds.backend.repository.AppUserRepository;
import com.mutualfunds.backend.repository.ComplaintRepository;
import com.mutualfunds.backend.repository.EducationPostRepository;
import com.mutualfunds.backend.repository.GoalPlanRepository;
import com.mutualfunds.backend.repository.MutualFundRepository;
import com.mutualfunds.backend.repository.PortfolioHoldingRepository;
import com.mutualfunds.backend.repository.SipPlanRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final MutualFundRepository fundRepository;
    private final PortfolioHoldingRepository holdingRepository;
    private final GoalPlanRepository goalPlanRepository;
    private final SipPlanRepository sipPlanRepository;
    private final EducationPostRepository postRepository;
    private final ComplaintRepository complaintRepository;
    private final AlertNotificationRepository alertRepository;
    private final CsvMapper csvMapper;

    @Override
    public void run(String... args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        AppUser investor = userRepository.findByEmail("student@demo.com")
                .orElseGet(() -> createUser("Demo User", "student@demo.com", "123456", "9876543210", UserRole.INVESTOR, "ACTIVE", encoder));
        AppUser admin = userRepository.findByEmail("admin@demo.com")
                .orElseGet(() -> createUser("Admin User", "admin@demo.com", "123456", "9999999999", UserRole.ADMIN, "ACTIVE", encoder));
        AppUser advisor = userRepository.findByEmail("advisor@demo.com")
                .orElseGet(() -> createUser("Meera Advisor", "advisor@demo.com", "123456", "8888888888", UserRole.FINANCIAL_ADVISOR, "PENDING", encoder));
        userRepository.findByEmail("analyst@demo.com")
                .orElseGet(() -> createUser("Ravi Analyst", "analyst@demo.com", "123456", "7777777777", UserRole.DATA_ANALYST, "ACTIVE", encoder));

        MutualFund axis = upsertFund("Axis Bluechip Fund", "Large Cap", "Equity", "Moderate", 18.6, 16.2, 14.8, 0.72, 33450.0, 7800, 84, 4.4, 324, "Shreyash Devalkar", "1% if redeemed within 12 months", "No lock-in", "Open-ended equity contract with SIP flexibility", "Axis Mutual Fund", List.of("HDFC Bank", "Infosys", "ICICI Bank", "TCS"), Map.of("Banking", 31.0, "IT", 24.0, "FMCG", 18.0, "Auto", 14.0, "Others", 13.0), List.of(8.0, 12.0, 16.0, 18.0, 21.0, 25.0, 24.0, 27.0, 31.0, 35.0, 39.0, 43.0), 12.4, 0.94, 0.82, 2.8, List.of("Stable fund for long-term SIP.", "Good downside protection in correction periods.", "Expense ratio is reasonable for category."));
        MutualFund ppfas = upsertFund("Parag Parikh Flexi Cap Fund", "Flexi Cap", "Equity", "Moderate to High", 21.4, 19.1, 18.3, 0.79, 67210.0, 8900, 90, 4.7, 516, "Rajeev Thakkar", "2% if redeemed within 12 months", "No lock-in", "Open-ended flexi allocation with foreign equity exposure", "PPFAS Mutual Fund", List.of("Alphabet", "Meta", "HDFC Bank", "Bajaj Finance"), Map.of("Banking", 22.0, "Technology", 30.0, "Pharma", 10.0, "Consumer", 19.0, "Others", 19.0), List.of(9.0, 14.0, 20.0, 26.0, 24.0, 29.0, 35.0, 39.0, 45.0, 50.0, 57.0, 61.0), 14.8, 1.08, 0.91, 3.9, List.of("Excellent risk-adjusted returns.", "Diversification strategy is strong.", "Good option for 5+ year horizon."));
        MutualFund hdfc = upsertFund("HDFC Hybrid Equity Fund", "Aggressive Hybrid", "Hybrid", "Moderate", 15.3, 13.8, 12.6, 0.88, 19340.0, 6200, 78, 4.1, 208, "Anil Bamboli", "1% if redeemed within 18 months", "No lock-in", "Hybrid contract balancing equity and debt positions", "HDFC Mutual Fund", List.of("Reliance", "L&T", "SBI", "NTPC"), Map.of("Banking", 18.0, "Energy", 16.0, "Infrastructure", 21.0, "Bonds", 25.0, "Others", 20.0), List.of(7.0, 9.0, 12.0, 14.0, 15.0, 19.0, 21.0, 23.0, 25.0, 28.0, 30.0, 33.0), 10.2, 0.78, 0.73, 1.7, List.of("Balanced risk profile for moderate investors.", "Return consistency is decent.", "Useful for conservative growth allocation."));
        upsertFund("Mirae Asset ELSS Tax Saver Fund", "ELSS", "ELSS", "Moderate to High", 20.2, 18.4, 16.9, 0.71, 23610.0, 7600, 86, 4.5, 267, "Neelesh Surana", "Nil", "3 years", "Tax-saving ELSS contract under Sec 80C with mandatory lock-in", "Mirae Asset Mutual Fund", List.of("Infosys", "Axis Bank", "Avenue Supermarts", "Larsen & Toubro"), Map.of("Banking", 26.0, "IT", 20.0, "Consumer", 17.0, "Industrials", 18.0, "Others", 19.0), List.of(8.0, 10.0, 14.0, 19.0, 22.0, 25.0, 27.0, 33.0, 36.0, 40.0, 44.0, 48.0), 13.7, 1.03, 0.84, 3.2, List.of("Great option for tax saving with growth.", "3-year lock-in encourages discipline.", "Fund house consistency is strong."));
        upsertFund("UTI Nifty 50 Index Fund", "Index", "Index", "Moderate", 16.4, 15.1, 13.7, 0.22, 15800.0, 5400, 80, 4.2, 175, "Passive Desk", "Nil", "No lock-in", "Low-cost index tracking strategy for broad market exposure", "UTI Mutual Fund", List.of("HDFC Bank", "Reliance Industries", "Infosys", "ICICI Bank"), Map.of("Banking", 30.0, "IT", 16.0, "Energy", 13.0, "Consumer", 11.0, "Others", 30.0), List.of(7.0, 11.0, 15.0, 17.0, 20.0, 23.0, 25.0, 29.0, 32.0, 34.0, 37.0, 40.0), 11.1, 0.98, 0.81, 2.1, List.of("Good beginner option.", "Low cost and broad diversification.", "Easy to understand and hold."));
        upsertFund("ICICI Prudential Corporate Bond Fund", "Corporate Bond", "Debt", "Low to Moderate", 7.9, 7.2, 7.1, 0.42, 10240.0, 4800, 68, 4.0, 121, "Manish Banthia", "Nil", "No lock-in", "Debt-oriented portfolio focused on high-quality corporate bonds", "ICICI Prudential Mutual Fund", List.of("AAA PSU Bond", "HDFC Ltd Bond", "NABARD Bond", "REC Bond"), Map.of("Bonds", 72.0, "PSU", 12.0, "Banking", 8.0, "Cash", 8.0), List.of(2.0, 3.0, 4.0, 5.5, 6.2, 7.0, 7.2, 7.5, 7.8, 8.0, 8.2, 8.4), 4.4, 0.24, 0.88, 1.1, List.of("Smoother ride than equity funds.", "Useful for stability and diversification.", "Good for conservative allocation."));
        upsertFund("SBI Small Cap Fund", "Small Cap", "Equity", "High", 24.7, 22.9, 21.8, 0.93, 29500.0, 9800, 92, 4.6, 441, "R Srinivasan", "1% if redeemed within 12 months", "No lock-in", "Small-cap growth strategy focused on higher long-term upside", "SBI Mutual Fund", List.of("Blue Star", "Karur Vysya Bank", "V-Guard", "Elgi Equipments"), Map.of("Industrials", 28.0, "Consumer", 19.0, "Banking", 14.0, "Healthcare", 13.0, "Others", 26.0), List.of(10.0, 15.0, 19.0, 24.0, 28.0, 34.0, 39.0, 44.0, 51.0, 58.0, 64.0, 70.0), 16.2, 1.24, 0.95, 4.5, List.of("High growth potential.", "Expect sharper ups and downs.", "Best for long-term aggressive investors."));
        upsertFund("Nippon India US Equity Opportunities Fund", "International", "Equity", "Moderate to High", 17.2, 14.9, 13.1, 1.1, 8200.0, 6900, 74, 4.0, 133, "International Desk", "1% if redeemed within 12 months", "No lock-in", "International equity exposure for global diversification", "Nippon India Mutual Fund", List.of("Microsoft", "Apple", "NVIDIA", "Amazon"), Map.of("Technology", 48.0, "Consumer", 14.0, "Healthcare", 12.0, "Financials", 10.0, "Others", 16.0), List.of(6.0, 9.0, 12.0, 16.0, 18.0, 21.0, 24.0, 26.0, 30.0, 34.0, 38.0, 42.0), 13.8, 1.05, 0.77, 2.6, List.of("Adds geographic diversification.", "Higher cost than domestic index funds.", "Useful to reduce India-only concentration."));
        upsertFund("Kotak Emerging Equity Fund", "Mid Cap", "Equity", "High", 22.1, 20.4, 18.1, 0.78, 24560.0, 8600, 88, 4.5, 289, "Pankaj Tibrewal", "1% if redeemed within 12 months", "No lock-in", "Mid-cap growth strategy with business-quality focus", "Kotak Mutual Fund", List.of("Bharat Forge", "Astral", "Persistent Systems", "Polycab"), Map.of("Industrials", 25.0, "Technology", 20.0, "Consumer", 17.0, "Auto", 15.0, "Others", 23.0), List.of(8.0, 12.0, 17.0, 21.0, 25.0, 29.0, 34.0, 38.0, 43.0, 49.0, 55.0, 60.0), 15.4, 1.16, 0.89, 3.8, List.of("Strong mid-cap participation.", "More volatile than large-cap funds.", "Good for long horizons."));
        upsertFund("DSP Healthcare Fund", "Sectoral Healthcare", "Equity", "High", 19.4, 17.2, 15.6, 0.91, 6840.0, 7100, 75, 4.1, 142, "Vinit Sambre", "1% if redeemed within 12 months", "No lock-in", "Healthcare-focused thematic strategy", "DSP Mutual Fund", List.of("Sun Pharma", "Divi's Labs", "Cipla", "Dr Reddy's"), Map.of("Healthcare", 76.0, "Chemicals", 8.0, "Hospitals", 7.0, "Cash", 9.0), List.of(5.0, 8.0, 11.0, 15.0, 18.0, 22.0, 24.0, 28.0, 32.0, 35.0, 39.0, 44.0), 14.2, 1.01, 0.73, 2.9, List.of("Useful for sector diversification.", "Best as a satellite allocation, not entire portfolio.", "Healthcare tends to be defensive in some market phases."));
        upsertFund("Tata Digital India Fund", "Technology", "Equity", "High", 23.8, 19.7, 17.4, 0.96, 9120.0, 8800, 79, 4.2, 190, "Amit Somani", "1% if redeemed within 12 months", "No lock-in", "Technology and digital-economy focused portfolio", "Tata Mutual Fund", List.of("Infosys", "TCS", "Tech Mahindra", "LTIMindtree"), Map.of("Technology", 74.0, "Telecom", 8.0, "Consumer Tech", 9.0, "Others", 9.0), List.of(6.0, 10.0, 14.0, 18.0, 22.0, 27.0, 31.0, 36.0, 40.0, 45.0, 51.0, 57.0), 17.8, 1.19, 0.84, 3.1, List.of("High upside in tech cycles.", "Volatility can be sharp.", "Better as a tactical satellite fund."));
        upsertFund("Aditya Birla Sun Life PSU Equity Fund", "PSU", "Equity", "High", 18.1, 17.3, 15.0, 0.67, 5340.0, 6300, 72, 4.0, 109, "Mahesh Patil", "1% if redeemed within 30 days", "No lock-in", "PSU-focused equity exposure", "Aditya Birla Sun Life Mutual Fund", List.of("NTPC", "Power Grid", "Coal India", "ONGC"), Map.of("Energy", 33.0, "Utilities", 24.0, "Financials", 18.0, "Metals", 10.0, "Others", 15.0), List.of(4.0, 6.0, 9.0, 11.0, 15.0, 17.0, 19.0, 22.0, 26.0, 29.0, 33.0, 37.0), 16.1, 1.11, 0.71, 2.3, List.of("Strong thematic upside when PSUs rerate.", "Better for experienced investors.", "Should be paired with diversified core funds."));
        upsertFund("ICICI Prudential Nifty Auto Index Fund", "Auto", "Index", "Moderate to High", 17.5, 16.0, 14.4, 0.34, 4120.0, 5600, 73, 4.0, 97, "Passive Desk", "Nil", "No lock-in", "Low-cost auto sector index strategy", "ICICI Prudential Mutual Fund", List.of("Maruti Suzuki", "Tata Motors", "Mahindra & Mahindra", "Bajaj Auto"), Map.of("Auto", 78.0, "Auto Ancillary", 14.0, "Cash", 8.0), List.of(5.0, 7.0, 10.0, 13.0, 16.0, 18.0, 21.0, 24.0, 28.0, 31.0, 35.0, 39.0), 12.8, 1.02, 0.75, 2.0, List.of("Simple way to express an auto-sector view.", "Lower cost than active sector funds.", "Still narrower than diversified funds."));
        upsertFund("Franklin India Prima Fund", "Mid Cap", "Equity", "Moderate to High", 18.9, 16.8, 15.3, 0.89, 9450.0, 6400, 77, 4.1, 118, "Anand Radhakrishnan", "1% if redeemed within 1 year", "No lock-in", "Mid-cap oriented diversified strategy", "Franklin Templeton Mutual Fund", List.of("Coforge", "Voltas", "Tube Investments", "Cholamandalam Finance"), Map.of("Industrials", 22.0, "Consumer Durable", 16.0, "Financials", 19.0, "Technology", 14.0, "Others", 29.0), List.of(6.0, 9.0, 12.0, 15.0, 18.0, 21.0, 24.0, 28.0, 31.0, 35.0, 39.0, 43.0), 13.9, 1.04, 0.79, 2.4, List.of("Balanced mid-cap exposure.", "Less extreme than small-cap funds.", "Good secondary growth option."));
        upsertFund("Axis Consumption Fund", "Consumption", "Equity", "Moderate", 16.7, 14.8, 13.9, 0.74, 5880.0, 6000, 71, 4.0, 89, "Ashish Gupta", "1% if redeemed within 12 months", "No lock-in", "Consumption theme with FMCG and retail exposure", "Axis Mutual Fund", List.of("ITC", "Hindustan Unilever", "Titan", "Avenue Supermarts"), Map.of("Consumer", 58.0, "Retail", 17.0, "Auto", 9.0, "Others", 16.0), List.of(4.0, 6.0, 8.0, 10.0, 13.0, 15.0, 18.0, 21.0, 24.0, 27.0, 30.0, 34.0), 11.8, 0.88, 0.77, 2.1, List.of("Good for consumer-led growth theme.", "More stable than some high-beta sector funds.", "Useful for thematic diversification."));
        upsertFund("SBI Magnum Gilt Fund", "Gilt", "Debt", "Low to Moderate", 8.3, 7.8, 7.5, 0.39, 6230.0, 4700, 69, 4.0, 102, "Dinesh Ahuja", "Nil", "No lock-in", "Government securities focused debt strategy", "SBI Mutual Fund", List.of("GOI 2033", "GOI 2035", "GOI 2040", "Treasury Bill"), Map.of("Government Bonds", 81.0, "Cash", 7.0, "SDL", 12.0), List.of(2.0, 2.8, 3.4, 4.0, 4.8, 5.4, 6.0, 6.5, 7.0, 7.4, 7.7, 8.0), 3.8, 0.18, 0.81, 0.9, List.of("High-quality debt option.", "Useful for conservative investors.", "Can help balance aggressive portfolios."));
        upsertFund("HDFC Gold ETF Fund of Fund", "Gold", "Hybrid", "Moderate", 13.6, 11.4, 10.2, 0.58, 4370.0, 5100, 66, 3.9, 84, "ETF Desk", "Nil", "No lock-in", "Gold-linked diversification strategy", "HDFC Mutual Fund", List.of("Gold ETF Units", "Bullion Linked Instruments", "Cash", "Liquid Treasuries"), Map.of("Gold", 89.0, "Cash", 11.0), List.of(3.0, 4.5, 5.0, 6.2, 7.5, 8.1, 9.3, 10.0, 11.2, 12.0, 13.0, 14.4), 8.4, 0.52, 0.64, 1.6, List.of("Good hedge against equity concentration.", "Not a growth engine by itself.", "Useful for diversification."));

        if (holdingRepository.findByUserId(investor.getId()).isEmpty()) {
            createHolding(investor, axis, 180000.0, 223000.0, 38.0);
            createHolding(investor, ppfas, 160000.0, 211000.0, 36.0);
            createHolding(investor, hdfc, 120000.0, 139000.0, 26.0);
        }

        if (goalPlanRepository.findAll().isEmpty()) {
            GoalPlan goal = new GoalPlan();
            goal.setUser(investor);
            goal.setGoalType("Retirement");
            goal.setTargetCorpus(2500000.0);
            goal.setTargetYears(8);
            goal.setRequiredMonthlySip(16850.0);
            goal.setExpectedCorpus(2500000.0);
            goalPlanRepository.save(goal);
        }

        if (sipPlanRepository.findAll().isEmpty()) {
            SipPlan sipPlan = new SipPlan();
            sipPlan.setUser(investor);
            sipPlan.setFund(axis);
            sipPlan.setMonthlyAmount(5000.0);
            sipPlan.setStepUpRate(10);
            sipPlan.setAutoDebitEnabled(true);
            sipPlan.setNextDebitDate(LocalDate.now().plusDays(5));
            sipPlan.setStatus("ACTIVE");
            sipPlanRepository.save(sipPlan);
        }

        if (postRepository.findAll().isEmpty()) {
            EducationPost post = new EducationPost();
            post.setAdvisor(advisor);
            post.setTitle("How to Pick Mutual Funds by Risk Profile");
            post.setPostType("Article");
            post.setSummary("Simple framework to shortlist funds using risk tolerance and time horizon.");
            post.setLikesCount(21);
            post.setCommentsCsv(csvMapper.joinStrings(List.of("Very useful", "Please add examples for debt funds")));
            postRepository.save(post);
        }

        if (complaintRepository.findAll().isEmpty()) {
            Complaint complaint = new Complaint();
            complaint.setUser(investor);
            complaint.setMessage("Incorrect NAV data shown for one fund");
            complaint.setStatus("OPEN");
            complaintRepository.save(complaint);
        }

        if (alertRepository.findAll().isEmpty()) {
            alertRepository.save(createAlert(investor, "nav", "NAV Updates", "2 tracked funds changed NAV today.", true, false));
            alertRepository.save(createAlert(investor, "rebalance", "Rebalancing Suggestion", "Portfolio equity crossed 80% threshold.", true, false));
        }

        userRepository.save(admin);
    }

    private AppUser createUser(String name, String email, String password, String mobile, UserRole role, String status, BCryptPasswordEncoder encoder) {
        AppUser user = new AppUser();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setMobile(mobile);
        user.setRole(role);
        user.setStatus(status);
        return userRepository.save(user);
    }

    private MutualFund upsertFund(String name, String category, String fundType, String riskLevel, double r1, double r3, double r5, double expenseRatio, double aum, int avgMonthlyIncome, int roiScore, double rating, int reviewCount, String fundManager, String exitLoad, String lockInPeriod, String contractType, String fundHouse, List<String> companies, Map<String, Double> sectorAllocation, List<Double> growthPoints, double stdDev, double beta, double sharpe, double alpha, List<String> reviews) {
        MutualFund fund = fundRepository.findAll().stream()
                .filter(item -> item.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(MutualFund::new);
        fund.setName(name);
        fund.setCategory(category);
        fund.setFundType(fundType);
        fund.setRiskLevel(riskLevel);
        fund.setReturns1Y(r1);
        fund.setReturns3Y(r3);
        fund.setReturns5Y(r5);
        fund.setExpenseRatio(expenseRatio);
        fund.setAumCr(aum);
        fund.setAvgMonthlyIncome(avgMonthlyIncome);
        fund.setRoiScore(roiScore);
        fund.setRating(rating);
        fund.setReviewCount(reviewCount);
        fund.setFundManager(fundManager);
        fund.setExitLoad(exitLoad);
        fund.setLockInPeriod(lockInPeriod);
        fund.setContractType(contractType);
        fund.setFundHouse(fundHouse);
        fund.setCompaniesCsv(csvMapper.joinStrings(companies));
        fund.setSectorAllocationJson(csvMapper.mapToJsonish(sectorAllocation));
        fund.setGrowthPointsCsv(csvMapper.joinDoubles(growthPoints));
        fund.setStandardDeviation(stdDev);
        fund.setBeta(beta);
        fund.setSharpeRatio(sharpe);
        fund.setAlpha(alpha);
        fund.setReviewsCsv(csvMapper.joinStrings(reviews));
        return fundRepository.save(fund);
    }

    private void createHolding(AppUser user, MutualFund fund, double invested, double current, double allocation) {
        PortfolioHolding holding = new PortfolioHolding();
        holding.setUser(user);
        holding.setFund(fund);
        holding.setInvestedAmount(invested);
        holding.setCurrentValue(current);
        holding.setAllocationPercent(allocation);
        holdingRepository.save(holding);
    }

    private AlertNotification createAlert(AppUser user, String type, String label, String message, boolean enabled, boolean readFlag) {
        AlertNotification alert = new AlertNotification();
        alert.setUser(user);
        alert.setType(type);
        alert.setLabel(label);
        alert.setMessage(message);
        alert.setEnabled(enabled);
        alert.setReadFlag(readFlag);
        return alert;
    }
}
