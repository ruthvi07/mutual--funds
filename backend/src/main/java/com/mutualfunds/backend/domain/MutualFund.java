package com.mutualfunds.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "mutual_funds")
public class MutualFund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 40)
    private String schemeCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, length = 40)
    private String fundType;

    @Column(nullable = false, length = 40)
    private String riskLevel;

    @Column(nullable = false)
    private Double returns1Y;

    @Column(nullable = false)
    private Double returns3Y;

    @Column(nullable = false)
    private Double returns5Y;

    @Column(nullable = false)
    private Double expenseRatio;

    @Column(nullable = false)
    private Double aumCr;

    @Column(nullable = false)
    private Integer avgMonthlyIncome;

    @Column(nullable = false)
    private Integer roiScore;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer reviewCount;

    @Column(nullable = false, length = 120)
    private String fundManager;

    @Column(nullable = false, length = 160)
    private String exitLoad;

    @Column(nullable = false, length = 80)
    private String lockInPeriod;

    @Lob
    @Column(nullable = false)
    private String contractType;

    @Column(nullable = false, length = 120)
    private String fundHouse;

    @Lob
    @Column(nullable = false)
    private String companiesCsv;

    @Lob
    @Column(nullable = false)
    private String sectorAllocationJson;

    @Lob
    @Column(nullable = false)
    private String growthPointsCsv;

    @Column(nullable = false)
    private Double standardDeviation;

    @Column(nullable = false)
    private Double beta;

    @Column(nullable = false)
    private Double sharpeRatio;

    @Column(nullable = false)
    private Double alpha;

    private Double latestNav;

    private LocalDate latestNavDate;

    private LocalDateTime lastSyncedAt;

    @Column(length = 60)
    private String dataSource;

    @Lob
    @Column(nullable = false)
    private String reviewsCsv;
}
