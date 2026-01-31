const AnalysisEngine = {
    // Categories for Korean spending
    categories: {
        CAFE_SB: ['스타벅스'],
        CAFE_OTHER: ['투썸', '이디야', '폴바셋', '커피빈', 'HOLLYS', '엔제리너스', '동방커피', '김성민커피'],
        MOVIE: ['CGV', '롯데시네마'],
        TRANSPORT: ['지하철', '버스', '택시', '카카오택시', '코레일'],
        SHOPPING_HI: ['쿠팡', 'TMON', '티몬', 'WEMAKEPRICE', '위메프', 'G마켓', '11번가', '농협몰'],
        SHOPPING_LO: ['CU', 'GS25', '세븐일레븐', '올리브영', '마트'],
        TELECOM: ['SKT', 'KT', 'LGU+', '통신요금', '휴대폰'],
        STREAMING: ['NETFLIX', '넷플릭스', 'YOUTUBE', '유튜브', 'MELON', '멜론'],
        DELIVERY: ['배달의민족', '요기요', '배민'],
        EASYPAY: ['NH PAY', '농협페이']
    },

    cards: [
        {
            id: 'nh_flex',
            name: "NH농협 올바른 flex 카드",
            image: "assets/images/card_nh_flex.png",
            rules: {
                COFFEE: { name: '커피', rate: 0.5, dailyLimit: 5000, monthlyLimit: 10000, minAmount: 1, dailyCountLimit: 1, monthlyCountLimit: 2, keywords: ['CAFE_SB'] },
                LIFE: {
                    name: '생활(스트리밍/배달)', monthlyLimit: 5000, subRules: [
                        { name: '스트리밍', rate: 0.2, minAmount: 7000, monthlyCountLimit: 1, perMerchant: true, keywords: ['STREAMING'] },
                        { name: '배달', rate: 0.1, minAmount: 15000, dailyCountLimit: 1, keywords: ['DELIVERY'] }
                    ]
                },
                MOVIE: { name: '영화', rate: 0.3, minAmount: 10000, monthlyLimit: 5000, keywords: ['MOVIE'] },
                COMMUTE: { name: '대중교통/통신', rate: 0.07, monthlyLimit: 5000, keywords: ['TRANSPORT', 'TELECOM'] },
                SHOPPING: {
                    name: '쇼핑/편의점', monthlyLimit: 5000, subRules: [
                        { name: '온라인쇼핑', rate: 0.05, minAmount: 20000, dailyCountLimit: 1, keywords: ['SHOPPING_HI'] },
                        { name: '편의점', rate: 0.05, minAmount: 5000, dailyCountLimit: 1, keywords: ['SHOPPING_LO'] }
                    ]
                },
                EASYPAY: { name: '간편결제', fixedBenefit: 1000, minAmount: 20000, dailyCountLimit: 1, monthlyCountLimit: 2, monthlyLimit: 2000, keywords: ['EASYPAY'] }
            }
        },
        {
            id: 'samsung_taptap',
            name: "삼성카드 taptap O",
            image: "assets/images/card_taptap.png",
            rules: {
                COFFEE: {
                    name: '커피', monthlyLimit: 10000, subRules: [
                        { name: '스타벅스', rate: 0.5, keywords: ['CAFE_SB'] },
                        { name: '커피전문점', rate: 0.3, keywords: ['CAFE_OTHER'] }
                    ]
                },
                MOVIE: { name: '영화', fixedBenefit: 5000, minAmount: 10000, monthlyCountLimit: 2, keywords: ['MOVIE'] },
                TRANSPORT: { name: '교통', rate: 0.1, monthlyLimit: 5000, keywords: ['TRANSPORT'] },
                TELECOM: { name: '통신', rate: 0.1, monthlyLimit: 5000, keywords: ['TELECOM'] },
                SHOPPING: {
                    name: '쇼핑', monthlyLimit: 5000, subRules: [
                        { name: '온라인쇼핑', rate: 0.07, keywords: ['SHOPPING_HI'] },
                        { name: '편의점', rate: 0.01, keywords: ['SHOPPING_LO'] }
                    ]
                }
            }
        }
    ],

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const transactions = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            const parts = lines[i].split(',');
            transactions.push({
                date: parts[0]?.trim(),
                description: parts[1]?.trim(),
                amount: parseInt(parts[2]?.replace(/[^0-9]/g, '')) || 0
            });
        }
        return transactions;
    },

    categorize(description) {
        const desc = description.toUpperCase();
        for (const [category, keywords] of Object.entries(this.categories)) {
            if (keywords.some(kw => desc.includes(kw.toUpperCase()))) {
                return category;
            }
        }
        return 'OTHER';
    },

    analyze(transactions, cardId = 'samsung_taptap') {
        const card = this.cards.find(c => c.id === cardId) || this.cards[1];
        const result = {
            totalSpent: 0,
            currentBenefits: 0,
            potentialBenefits: 0,
            missedBenefits: 0,
            underutilizedBenefits: 0,
            details: [],
            transactions: transactions.map(t => ({
                ...t,
                category: this.categorize(t.description)
            }))
        };

        const limitTracker = {}; // Tracks group-level or single-rule limits
        const countTracker = {}; // Tracks daily/monthly counts

        // Initialize trackers
        Object.keys(card.rules).forEach(key => {
            limitTracker[key] = 0;
            countTracker[key] = { daily: {}, monthly: 0, merchantMonthly: {} };
        });

        result.transactions.forEach(t => {
            result.totalSpent += t.amount;
            let appliedBenefit = 0;

            for (const [ruleKey, rule] of Object.entries(card.rules)) {
                const subRules = rule.subRules || [rule];
                for (const sub of subRules) {
                    if (sub.keywords.some(kw => t.category.startsWith(kw))) {
                        // Check Minimum Amount
                        if (t.amount < (sub.minAmount || 0)) continue;

                        // Check Daily Count Limit
                        const dateStr = t.date;
                        countTracker[ruleKey].daily[dateStr] = countTracker[ruleKey].daily[dateStr] || 0;
                        if (sub.dailyCountLimit && countTracker[ruleKey].daily[dateStr] >= sub.dailyCountLimit) continue;

                        // Check Monthly Count Limit
                        if (sub.monthlyCountLimit && countTracker[ruleKey].monthly >= sub.monthlyCountLimit) continue;

                        // Check Per-Merchant Limit
                        if (sub.perMerchant) {
                            countTracker[ruleKey].merchantMonthly[t.description] = countTracker[ruleKey].merchantMonthly[t.description] || 0;
                            if (countTracker[ruleKey].merchantMonthly[t.description] >= sub.monthlyCountLimit) continue;
                        }

                        // Calculate Benefit
                        let benefit = 0;
                        if (sub.fixedBenefit) benefit = sub.fixedBenefit;
                        else if (sub.rate) benefit = Math.floor(t.amount * sub.rate);

                        // Apply Limits (Daily/Monthly)
                        const remainingMonthly = (rule.monthlyLimit || Infinity) - limitTracker[ruleKey];
                        const remainingDaily = (sub.dailyLimit || Infinity) - (countTracker[ruleKey].dailyBenefitLimit?.[dateStr] || 0);

                        benefit = Math.min(benefit, remainingMonthly, remainingDaily);

                        if (benefit > 0) {
                            appliedBenefit = benefit;
                            limitTracker[ruleKey] += benefit;
                            countTracker[ruleKey].monthly++;
                            countTracker[ruleKey].daily[dateStr]++;
                            if (sub.perMerchant) countTracker[ruleKey].merchantMonthly[t.description]++;

                            result.details.push({
                                description: t.description,
                                amount: t.amount,
                                benefit: benefit,
                                category: ruleKey
                            });
                        }
                        break; // Rule applied
                    }
                }
                if (appliedBenefit > 0) break;
            }
            result.currentBenefits += appliedBenefit;
        });

        // Calculate potential benefits and gaps (theoretical limits)
        let totalMaxPossible = 0;
        Object.entries(card.rules).forEach(([key, rule]) => {
            const max = rule.monthlyLimit || (rule.fixedBenefit * (rule.monthlyCountLimit || 1)) || 0;
            totalMaxPossible += max;
        });

        result.potentialBenefits = totalMaxPossible;
        result.missedBenefits = Math.max(0, result.potentialBenefits - result.currentBenefits);

        // Always recommend NH Flex for User, Samsung initially
        result.recommendedCard = this.cards[0];

        return {
            ...result,
            efficiency: result.totalSpent > 0 ? ((result.currentBenefits / result.totalSpent) * 100).toFixed(2) : 0,
            limitTracker,
            countTracker,
            cardRules: card.rules
        };
    }
};

AnalysisEngine.rules = AnalysisEngine.cards[1].rules;
