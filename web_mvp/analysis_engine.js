const AnalysisEngine = {
    // Categories for Korean spending
    categories: {
        CAFE: ['스타벅스', '투썸', '이디야', '폴바셋', '커피'],
        MOVIE: ['CGV', '롯데시네마', '메가박스'],
        SHOPPING: ['쿠팡', '네이버페이', '배달의민족', 'G마켓', '11번가'],
        TRANSPORT: ['지하철', '버스', '택시', '카카오택시'],
        OVERSEAS: ['APPLE', 'GOOGLE', 'AMAZON', 'NETFLIX']
    },

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const transactions = [];

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            const colors = lines[i].split(',');
            // Mock structure: Date, Description, Amount
            transactions.push({
                date: colors[0],
                description: colors[1],
                amount: parseInt(colors[2]) || 0
            });
        }
        return transactions;
    },

    categorize(description) {
        for (const [category, keywords] of Object.entries(this.categories)) {
            if (keywords.some(kw => description.includes(kw))) {
                return category;
            }
        }
        return 'OTHER';
    },

    cards: [
        {
            id: 'kb_daero',
            name: 'KB국민 다담카드',
            benefits: { CAFE: 0.1, SHOPPING: 0.07, TRANSPORT: 0.1 },
            tag: '생활 밀착형 혜택'
        },
        {
            id: 'shinhan_mr_life',
            name: '신한카드 Mr.Life',
            benefits: { UTILITY: 0.1, SHOPPING: 0.1, CONVENIENCE: 0.1 },
            tag: '1인 가구 특화'
        },
        {
            id: 'hyundai_zero',
            name: '현대카드 ZERO Edition3',
            benefits: { ALL: 0.015 },
            tag: '조건 없는 적립'
        }
    ],

    analyze(transactions, currentCardId) {
        const result = {
            totalSpent: 0,
            byCategory: {},
            currentBenefits: 0,
            potentialBenefits: 0,
            recommendedCard: null
        };

        transactions.forEach(t => {
            result.totalSpent += t.amount;
            const cat = this.categorize(t.description);
            if (!result.byCategory[cat]) result.byCategory[cat] = 0;
            result.byCategory[cat] += t.amount;
        });

        // Current Benefits Mock Calculation
        result.currentBenefits = (result.byCategory['CAFE'] || 0) * 0.1 + (result.byCategory['MOVIE'] || 0) * 0.1;

        // Find best card
        let maxPot = 0;
        this.cards.forEach(card => {
            let pot = 0;
            for (const [cat, rate] of Object.entries(card.benefits)) {
                if (cat === 'ALL') {
                    pot += result.totalSpent * rate;
                } else {
                    pot += (result.byCategory[cat] || 0) * rate;
                }
            }
            if (pot > maxPot) {
                maxPot = pot;
                result.recommendedCard = card;
                result.potentialBenefits = pot;
            }
        });

        // Fallback potential
        if (result.potentialBenefits < result.currentBenefits * 1.5) {
            result.potentialBenefits = result.currentBenefits * 1.5;
        }

        return result;
    }
};
