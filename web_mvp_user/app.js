const app = {
    currentState: {
        currentScreen: 'home',
        previousScreen: 'home',
        selectedCompany: 'samsung',
        analysisResult: null
    },

    init() {
        console.log('User App initialized');
        this.loadPredefinedUserData();
        this.renderBenefitList();

        const fileInput = document.getElementById('csv-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    },

    loadPredefinedUserData() {
        const transactions = [
            { date: '2025.12.11', description: '스타벅스 대전점', amount: 15000 },
            { date: '2025.12.11', description: '스타벅스 대전점', amount: 12000 },
            { date: '2025.12.11', description: '동방커피', amount: 8800 },
            { date: '2025.12.14', description: '코레일유통(주)', amount: 20000 },
            { date: '2025.12.15', description: 'SKT 통신요금', amount: 55000 },
            { date: '2025.12.20', description: 'CGV 영화관', amount: 12000 },
            { date: '2025.12.21', description: '롯데시네마', amount: 15000 },
            { date: '2025.12.24', description: '쿠팡 결제', amount: 45000 },
            { date: '2025.12.31', description: '투썸플레이스 대전태평점', amount: 7100 },
            { date: '2026.01.01', description: 'G마트 대학로점', amount: 33540 },
            { date: '2026.01.02', description: '042커피(COFFEE)', amount: 3500 },
            { date: '2026.01.02', description: '버거킹대전유성온천역점', amount: 2800 },
            { date: '2026.01.02', description: '역전할머니맥주', amount: 43100 }
        ];

        const result = AnalysisEngine.analyze(transactions, 'samsung_taptap');
        const nhFlexResult = AnalysisEngine.analyze(transactions, 'nh_flex');
        result.recommendationBenefit = nhFlexResult.currentBenefits;
        result.recommendedCard = AnalysisEngine.cards.find(c => c.id === 'nh_flex');

        this.currentState.analysisResult = result;
        this.savePersistentData();
    },

    loadPersistentData() {
        const saved = localStorage.getItem('FINTECH_MVP_DATA');
        if (saved) {
            this.currentState.analysisResult = JSON.parse(saved);
        }
    },

    savePersistentData() {
        localStorage.setItem('FINTECH_MVP_DATA', JSON.stringify(this.currentState.analysisResult));
    },

    navigateTo(screenId) {
        if (this.currentState.currentScreen !== screenId) {
            this.currentState.previousScreen = this.currentState.currentScreen;
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        let targetScreenId = screenId;
        if (['details', 'recommendation', 'category-conditions', 'card-details', 'recommended-card-details', 'verification'].includes(screenId)) {
            targetScreenId = 'report';
        }

        const targetScreen = document.getElementById(`${targetScreenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentState.currentScreen = screenId;

            if (screenId === 'report') this.renderReport();
            else if (screenId === 'recommendation') this.renderRecommendation();
            else if (screenId === 'details') this.renderDetails();
            else if (screenId === 'category-conditions') this.renderCategoryConditions();
            else if (screenId === 'card-details') this.renderCardDetails();
            else if (screenId === 'recommended-card-details') this.renderRecommendedCardDetail();
            else if (screenId === 'verification') this.renderVerification();
            else if (screenId === 'home') this.renderBenefitList();
        }

        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });

        const mainScreens = { home: 0, recommendation: 1 };
        const activeNavIndex = mainScreens[screenId];
        if (activeNavIndex !== undefined) {
            const navItems = document.querySelectorAll('.bottom-nav .nav-item');
            if (navItems[activeNavIndex]) navItems[activeNavIndex].classList.add('active');
        }

        window.scrollTo(0, 0);
    },

    renderCardDetails() {
        this.renderCardDetailUI(AnalysisEngine.cards[1]);
    },

    renderRecommendedCardDetail() {
        const data = this.currentState.analysisResult;
        this.renderCardDetailUI(data.recommendedCard);
    },

    renderCardDetailUI(card) {
        const reportScreen = document.getElementById('report-screen');
        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('${this.currentState.previousScreen || 'home'}')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            
            <div style="padding: 0; text-align: center;">
                <img src="${card.image}" style="width: 140px; height: 220px; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 0.5px solid #ddd;">
                <h2 style="font-size: 24px; font-weight: 700; margin-top: 25px;">${card.name}</h2>
                <p style="color: #757575; font-size: 14px; margin-top: 8px;">라이프스타일에 맞춘 혜택 최적화</p>
            </div>

            <div style="padding: 20px; margin-top: 20px;">
                <div style="background:#FAFAF8; border-radius: 15px; padding: 20px; border: 1px solid #eee;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <span style="color:#757575;">연회비</span>
                        <span style="font-weight:600;">약 10,000원</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#757575;">전월실적</span>
                        <span style="font-weight:600;">30만원 이상</span>
                    </div>
                </div>

                <h3 style="font-size: 18px; font-weight: 700; margin: 30px 0 20px 0;">주요 혜택</h3>
                
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    ${Object.entries(card.rules).map(([key, rule]) => {
            const iconMap = { COFFEE: '☕️', MOVIE: '🎬', TRANSPORT: '🚌', SHOPPING: '🛍️', TELECOM: '📱', LIFE: '🌱', EASYPAY: '💳', COMMUTE: '🚇' };
            const detailLines = [];
            if (rule.rate) detailLines.push(`${(rule.rate * 100).toFixed(0)}% 할인`);
            if (rule.fixedBenefit) detailLines.push(`${this.formatWon(rule.fixedBenefit)} 할인`);
            if (rule.monthlyLimit) detailLines.push(`월 최대 ${this.formatWon(rule.monthlyLimit)}`);
            if (rule.subRules) {
                rule.subRules.forEach(sr => {
                    detailLines.push(`${sr.name} ${sr.rate ? (sr.rate * 100).toFixed(0) + '%' : this.formatWon(sr.fixedBenefit)} 할인`);
                });
            }

            return `
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                    ${iconMap[key] || '💳'}
                                </div>
                                <div>
                                    <div style="font-size: 15px; font-weight: 700;">${rule.name}</div>
                                    <div style="font-size: 12px; color: #757575; line-height: 1.4;">${detailLines.join(' / ')}</div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
            
            <div style="padding: 40px 0;">
                <button class="btn-primary" style="width: 100%; height: 55px; border: none; border-radius: 15px; font-size: 18px; font-weight: 700; cursor: pointer; background: var(--primary-purple); color: #fff;" onclick="window.open('https://card.nonghyup.com/servlet/IpCc2021R.act', '_blank')">
                    이 카드 신청하기
                </button>
            </div>
        `;
    },

    renderCategoryConditions() {
        const reportScreen = document.getElementById('report-screen');
        const data = this.currentState.analysisResult;
        const rules = (data && data.cardRules) || AnalysisEngine.rules;

        if (!data || !data.limitTracker) {
            reportScreen.innerHTML = '<div style="padding:100px 20px; text-align:center;"><p>데이터 분석 중입니다...</p></div>';
            return;
        }

        const totalBenefits = data.currentBenefits || 0;
        const totalMax = data.potentialBenefits || 1;

        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('${this.currentState.previousScreen || 'home'}')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            
            <div style="padding: 0;">
                <h2 style="font-size: 22px; font-weight: 700;">전체 혜택 달성률</h2>
                <div style="background: #FAFAF8; border-radius: 20px; padding: 25px; border: 1px solid #E9DFFF; margin-top: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px;">
                        <div>
                            <span style="font-size: 14px; color: #757575;">이번 달 챙긴 혜택</span>
                            <div style="font-size: 26px; font-weight: 800; color: var(--primary-purple); margin-top: 5px;">${this.formatWon(totalBenefits)}</div>
                        </div>
                        <div style="text-align: right;">
                             <span style="font-size: 12px; color: #999;">이번 달 혜택 한도 (최대)</span>
                             <div style="font-size: 14px; font-weight: 600; color: #444;">${this.formatWon(totalMax)}</div>
                        </div>
                    </div>
                    <div style="height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
                        <div style="width: ${(totalBenefits / totalMax * 100).toFixed(1)}%; height: 100%; background: linear-gradient(90deg, #874FFF, #B897FF); border-radius: 6px;"></div>
                    </div>
                    <div style="font-size: 12px; color: #757575; margin-top: 10px; display: flex; align-items: center; gap: 5px;">
                        <span style="color: var(--primary-purple); font-weight: 700;">${(totalBenefits / totalMax * 100).toFixed(0)}%</span> 달성 중! 혜택 한도까지 알뜰하게 챙겨보세요.
                    </div>
                </div>
            </div>

            <h3 style="font-size: 18px; font-weight: 700; margin: 40px 0 20px 0;">카테고리별 맞춤 팁</h3>

            <div style="padding: 0 0 40px 0;">
                ${Object.entries(rules).map(([key, rule]) => {
            const monthlyUsed = data.limitTracker[key] || 0;
            const monthlyMax = rule.monthlyLimit || (rule.fixedBenefit * rule.monthlyCountLimit) || (rule.limit * (rule.countLimit || 1)) || 0;
            const progress = monthlyMax > 0 ? (monthlyUsed / monthlyMax * 100).toFixed(0) : 0;

            const iconMap = { COFFEE: '☕️', MOVIE: '🎬', TRANSPORT: '🚌', SHOPPING: '🛍️', TELECOM: '📱', LIFE: '🌱', EASYPAY: '💳', COMMUTE: '🚇' };
            const tipsMap = {
                COFFEE: monthlyUsed < monthlyMax ? `커피 혜택 한도가 <b>${this.formatWon(monthlyMax - monthlyUsed)}</b> 남았습니다. 스타벅스 등에서 혜택을 챙기세요!` : '이번 달 커피 혜택을 모두 챙기셨습니다! 완벽해요 👏',
                MOVIE: (!data.countTracker[key] || data.countTracker[key].monthly < (rule.monthlyCountLimit || 1)) ? `영화 할인이 <b>${(rule.monthlyCountLimit || 1) - (data.countTracker[key]?.monthly || 0)}회</b> 더 가능합니다. CGV나 롯데시네마를 이용해보세요.` : '영화관 할인 혜택을 알뜰하게 다 사용하셨습니다!',
                TRANSPORT: monthlyUsed < monthlyMax ? `대중교통 10% 할인이 진행 중입니다. 택시 결제 시에도 혜택이 적용돼요.` : '교통비 할인 한도를 모두 채우셨습니다.',
                TELECOM: monthlyUsed === 0 ? '자동이체를 등록하면 매월 할인을 받을 수 있어요.' : '통신비 할인이 정상 적용되었습니다.',
                SHOPPING: monthlyUsed < monthlyMax ? '온라인 쇼핑, 편의점에서 할인을 더 받을 수 있습니다.' : '쇼핑 혜택을 최대로 받으셨습니다.',
                LIFE: monthlyUsed < monthlyMax ? '배달 앱이나 스트리밍 결제 시 할인이 적용됩니다.' : '생활 혜택 한도를 모두 채우셨습니다.',
                COMMUTE: monthlyUsed < monthlyMax ? '대중교통이나 통신비에서 혜택을 더 받을 수 있습니다.' : '출퇴근 관련 혜택을 모두 받으셨습니다.'
            };

            const detailContent = [];
            if (rule.rate) detailContent.push(`• 결제 금액의 <b>${(rule.rate * 100).toFixed(0)}%</b> 할인`);
            if (rule.fixedBenefit) detailContent.push(`• 결제 건당 <b>${this.formatWon(rule.fixedBenefit)}</b> 할인`);
            if (rule.minAmount) detailContent.push(`• 전월 실적 및 최소 결제 금액 <b>${this.formatWon(rule.minAmount)}</b> 이상 시 적용`);
            if (rule.monthlyLimit) detailContent.push(`• 월 최대 통합 한도 <b>${this.formatWon(rule.monthlyLimit)}</b>`);
            if (rule.dailyLimit) detailContent.push(`• 일 최대 한도 <b>${this.formatWon(rule.dailyLimit)}</b>`);
            if (rule.monthlyCountLimit) detailContent.push(`• 월 최대 <b>${rule.monthlyCountLimit}회</b> 제공`);
            if (rule.subRules) {
                rule.subRules.forEach(sr => {
                    detailContent.push(`• ${sr.name}: <b>${sr.rate ? (sr.rate * 100).toFixed(0) + '%' : this.formatWon(sr.fixedBenefit)}</b> 할인`);
                });
            }

            return `
                    <div style="background:#FFF; border-radius: 18px; margin-bottom: 20px; border: 1px solid #f0f0f0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <div style="padding: 20px;">
                            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 15px;">
                                <div style="width: 44px; height: 44px; background: #F8F6FF; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                                    ${iconMap[key] || '💳'}
                                </div>
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-size: 16px; font-weight: 700; color: #222;">${rule.name}</span>
                                        <span style="font-size: 14px; font-weight: 700; color: var(--primary-purple);">${progress}%</span>
                                    </div>
                                    <div style="height: 6px; background: #f0f0f0; border-radius: 3px; margin-top: 8px; position: relative;">
                                        <div style="width: ${progress}%; height: 100%; background: var(--primary-purple); border-radius: 3px;"></div>
                                    </div>
                                </div>
                            </div>
                            <div style="background: #F8F9FA; border-radius: 12px; padding: 15px; font-size: 13px; line-height: 1.6; color: #444; position: relative;">
                                <div style="position: absolute; left: -5px; top: 10px; width: 3px; height: 20px; background: var(--primary-purple); border-radius: 0 4px 4px 0;"></div>
                                ${tipsMap[key] || '해당 카테고리에서 혜택을 받아보세요.'}
                            </div>
                            <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 11px; color: #999; font-weight: 500;">
                                    사용 혜택: ${this.formatWon(monthlyUsed)} / ${this.formatWon(monthlyMax)}
                                </div>
                                <button onclick="app.toggleRuleDetail('${key}')" style="background:none; border:none; color:#757575; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:3px;">
                                    상세 <span id="arrow-${key}" style="transition: transform 0.2s; font-size:8px;">▼</span>
                                </button>
                            </div>
                            <div id="detail-${key}" style="display:none; margin-top:15px; padding-top:15px; border-top:1px dashed #eee; font-size:12px; color:#666; animation: slideDown 0.3s ease-out;">
                                ${detailContent.join('<br>')}
                            </div>
                        </div>
                    </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderReport() {
        const reportScreen = document.getElementById('report-screen');
        const data = this.currentState.analysisResult;

        if (!data || !data.totalSpent) {
            reportScreen.innerHTML = '<div style="padding: 100px 20px; text-align: center;"><p style="color: #757575;">분석된 데이터가 없습니다.</p></div>';
            return;
        }

        const totalMissed = data.missedBenefits;

        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('home')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            
            <div class="report-header">
                <h2 style="font-size: 22px; line-height: 1.5;"><span class="highlight-red">${totalMissed > 10000 ? '혜택을 많이 놓쳤어요' : '혜택을 잘 챙기셨네요!'}</span></h2>
            </div>

            <div class="card-display" style="padding: 20px 0; text-align: center;">
                <h4 style="margin-bottom: 20px;">삼성카드 taptap O</h4>
                <div style="width: 135px; height: 214px; margin: 0 auto; background: url('assets/images/card_taptap.png') center/cover; border-radius: 10px; border: 0.5px solid #D9D9D9;"></div>
            </div>

            <div class="section-divider" style="height: 15px; background: #F5F5F5; margin: 40px -20px;"></div>

            <div class="report-section">
                <h3 style="font-size: 18px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
                    <span><span style="color: var(--primary-purple)">${this.formatWon(totalMissed)}</span> 혜택을 놓쳤어요</span>
                    <span class="badge-missed" style="font-size: 13px;">낮은 효율</span>
                </h3>

                <div class="summary-card" style="background: #F5F5F5; border-radius: 13px; padding: 20px; margin-top: 25px;">
                    <div style="display: flex; justify-content: space-between; color: #757575; font-size: 14px; font-weight: 600; margin-bottom: 30px;">
                        <span>지난 달 받은 혜택</span>
                        <span style="color: #222222; font-weight: 700;">${this.formatWon(data.currentBenefits)}</span>
                    </div>
                    
                    <div class="benefit-list" style="margin-top: 0;">
                        ${this.renderReportBenefitItems(data)}
                    </div>

                    <button class="btn-text" style="width:100%; border:none; background:#E9DFFF; color:var(--primary-purple); height:57px; border-radius:15px; font-size:16px; font-weight:600; margin-top: 10px;" onclick="app.navigateTo('details')">
                        지난 소비 상세 확인
                    </button>
                </div>
            </div>

            <div style="padding:40px 0;">
                <button class="btn-primary" style="width: 100%; height: 55px; border: none; border-radius: 15px; font-size: 18px; font-weight: 700; cursor: pointer; background: var(--primary-purple); color: #fff;" onclick="app.navigateTo('recommendation')">
                    나에게 딱 맞는 카드 추천받기
                </button>
            </div>
        `;
    },

    renderReportBenefitItems(data) {
        const groups = {};
        (data.details || []).forEach(d => {
            if (!groups[d.category]) groups[d.category] = { spent: 0, benefit: 0 };
            groups[d.category].spent += d.amount;
            groups[d.category].benefit += d.benefit;
        });

        const iconMap = { COFFEE: 'assets/images/category_cafe.svg', MOVIE: 'assets/images/category_movie.svg', TRANSPORT: 'assets/images/category_bus.png', SHOPPING: 'assets/images/category_shopping.png', TELECOM: 'assets/images/category_telecom.png', LIFE: 'assets/images/category_other.svg', COMMUTE: 'assets/images/category_transport.svg', EASYPAY: 'assets/images/category_other.svg' };
        const nameMap = { COFFEE: '커피', MOVIE: '영화', TRANSPORT: '교통', SHOPPING: '쇼핑', TELECOM: '통신', LIFE: '생활', COMMUTE: '교통/통신', EASYPAY: '간편결제' };

        return Object.entries(groups).map(([cat, val]) => `
            <div class="benefit-item" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
               <div style="display: flex; align-items: center; gap: 15px;">
                   <div style="width:36px; height:36px; background:#fff; border-radius:10px; border:1px solid #eee; display:flex; align-items:center; justify-content:center;">
                       <img src="${iconMap[cat] || 'assets/images/category_other.svg'}" style="width:24px;">
                   </div>
                   <div>
                       <div style="font-size:14px; font-weight:700;">${this.formatWon(val.spent)}</div>
                       <div style="font-size:12px; color:#757575;">${nameMap[cat] || cat} 카테고리</div>
                   </div>
               </div>
               <div style="display:flex; align-items:center; gap:5px;">
                    <span style="background:#F3EEFF; color:var(--primary-purple); font-size:11px; padding:2px 8px; border-radius:8px; font-weight:600;">혜택</span>
                    <span style="color:var(--primary-purple); font-size:15px; font-weight:700;">${this.formatWon(val.benefit)}</span>
               </div>
            </div>
        `).join('');
    },

    renderRecommendation() {
        const reportScreen = document.getElementById('report-screen');
        const data = this.currentState.analysisResult;
        const bestCard = data.recommendedCard;
        const recBenefit = data.recommendationBenefit || 0;
        const currentBenefits = data.currentBenefits;
        const diff = recBenefit - currentBenefits;

        const coffeeSpent = data.details ? data.details.filter(d => d.category === 'COFFEE').reduce((sum, d) => sum + d.amount, 0) : 0;
        const transactions = data.transactions || [];
        const streamingCount = transactions.filter(t => t.description.toUpperCase().includes('NETFLIX') || t.description.toUpperCase().includes('YOUTUBE')).length;

        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('report')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            
            <div>
                <h2 style="font-size: 24px; line-height: 1.4; font-weight: 700;">
                    ${bestCard.name}로 바꾸면<br>
                    ${diff > 0
                ? `<span style="color: var(--primary-purple)">매월 약 ${this.formatWon(diff)}</span><br>더 받을 수 있어요`
                : `<span style="color: var(--accent-red)">혜택이 약 ${this.formatWon(Math.abs(diff))} 줄어들어요</span><br>현재 카드가 더 유리해요`}
                </h2>
                <p style="color: #757575; font-size: 14px; margin-top: 15px;">${diff > 0 ? `연간 최대 ${this.formatWon(diff * 12)}의 추가 혜택이 예상됩니다.` : '사용자님의 소비 패턴에는 현재 카드의 효율이 더 높습니다.'}</p>
            </div>

            <div style="margin: 40px 0; cursor: pointer;" onclick="app.navigateTo('recommended-card-details')">
                <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
                    <div style="text-align:center;">
                        <p style="font-size:11px; color:#999; margin-bottom:10px;">현재 카드</p>
                        <div style="width:85px; height:135px; background: url('assets/images/card_taptap.png') center/cover; border-radius:8px; border: 0.5px solid #eee; opacity:0.6;"></div>
                    </div>
                    <div style="font-size:20px; color:var(--primary-purple); font-weight: 800;">➔</div>
                    <div style="text-align:center;">
                        <p style="font-size:11px; color:var(--primary-purple); font-weight:700; margin-bottom:10px;">추천 카드</p>
                        <div style="width:115px; height:185px; background: url('${bestCard.image}') center/cover; border-radius:10px; box-shadow: 0 10px 20px rgba(135, 79, 255, 0.3); border: 0.5px solid #eee;"></div>
                    </div>
                </div>
            </div>

            <div style="padding-bottom: 120px;">
                <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 20px;">이 카드를 추천하는 이유</h3>
                <div style="background: #FAFAF8; border-radius: 15px; padding: 20px; border: 1px solid #E9E0FF;">
                    <div style="display:flex; flex-direction:column; gap:15px;">
                        <div style="display:flex; gap:12px;">
                            <span style="font-size:18px;">☕️</span>
                            <span style="font-size:14px; line-height:1.5;">${bestCard.name.includes('flex') ? '<b>스타벅스 50% 할인</b>' : '<b>커피 30~50% 할인</b>'}<br>고객님의 월 ${this.formatWon(coffeeSpent)} 커피 지출에 대해 최대 효율을 보장합니다.</span>
                        </div>
                        <div style="display:flex; gap:12px;">
                            <span style="font-size:18px;">📺</span>
                            <span style="font-size:14px; line-height:1.5;"><b>스트리밍 20% 할인</b><br>자주 이용하시는 ${streamingCount}개의 구독 서비스에서 매달 할인이 적용됩니다.</span>
                        </div>
                        <div style="display:flex; gap:12px;">
                            <span style="font-size:18px;">📱</span>
                            <span style="font-size:14px; line-height:1.5;"><b>통합 소비 분석 기반</b><br>총 ${this.formatWon(data.totalSpent)}의 소비 패턴 분석 결과, 현재 카드보다 <b>${((recBenefit / data.totalSpent) * 100).toFixed(1)}%</b> 높은 적립률을 보여요.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding:20px; position:fixed; bottom:0; width:100%; left:50%; transform:translateX(-50%); max-width:390px; background: #fff; border-top: 1px solid #eee; z-index:1000;">
                <button class="btn-primary" style="width: 100%; height: 60px; border: none; border-radius: 15px; font-size: 18px; font-weight: 800; cursor: pointer; background: var(--primary-purple); color: #fff;" onclick="window.open('https://card.nonghyup.com/servlet/IpCc2021R.act', '_blank')">
                    지금 바로 카드 발급하기
                </button>
            </div>
        `;
    },

    renderDetails() {
        const reportScreen = document.getElementById('report-screen');
        const data = this.currentState.analysisResult;
        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('report')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            <div style="padding: 0;">
                <h2 style="font-size: 22px; font-weight: 700;">소비 상세 내역</h2>
            </div>
            <div style="padding: 20px 0; padding-bottom: 40px;">
                ${(data.transactions || []).map(t => {
            const detail = data.details.find(d => d.description === t.description && d.amount === t.amount);
            const benefit = detail ? detail.benefit : 0;
            return `
                        <div style="background:#FFF; border-radius: 15px; padding: 18px; margin-bottom:12px; border: 1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-size:12px; color:#999; margin-bottom:4px;">${t.date}</div>
                                <div style="font-size:15px; font-weight:700; color:#333;">${t.description}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:16px; font-weight:800; color:#222;">${this.formatWon(t.amount)}</div>
                                ${benefit > 0 ? `<div style="font-size:12px; color:var(--primary-purple); font-weight:700; margin-top:4px;">+${this.formatWon(benefit)} 혜택</div>` : `<div style="font-size:12px; color:#ccc; margin-top:4px;">혜택 없음</div>`}
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderVerification() {
        const reportScreen = document.getElementById('report-screen');
        const transactions = this.currentState.analysisResult.transactions;
        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('home')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            <div style="padding: 0;">
                <h2 style="font-size: 22px; font-weight: 700;">추출 데이터 확인</h2>
            </div>
            <div style="padding: 20px 0; overflow-y: auto; max-height: 400px;">
                ${transactions.map((t, i) => `
                    <div style="background: #fff; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #eee; display: flex; justify-content: space-between;">
                        <span>${t.description}</span>
                        <span style="font-weight: 700;">${this.formatWon(t.amount)}</span>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 20px;">
                <button class="btn-primary" style="width: 100%; height: 55px; border-radius: 15px; background: var(--primary-purple); color: #fff; font-weight: 700; border:none;" onclick="app.finalizeAnalysis()">분석 완료하기</button>
            </div>
        `;
    },

    finalizeAnalysis() {
        const result = AnalysisEngine.analyze(this.currentState.analysisResult.transactions);
        this.currentState.analysisResult = result;
        this.savePersistentData();
        this.navigateTo('report');
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.navigateTo('verification');
    },

    renderBenefitList() {
        const listContainer = document.querySelector('.benefit-list');
        if (!listContainer) return;
        const data = this.currentState.analysisResult;
        if (!data || !data.details) return;

        const groups = {};
        data.details.forEach(d => {
            if (!groups[d.category]) groups[d.category] = 0;
            groups[d.category] += d.benefit;
        });

        const iconMap = { COFFEE: 'assets/images/category_cafe.svg', TRANSPORT: 'assets/images/category_bus.png', SHOPPING: 'assets/images/category_shopping.png' };
        const nameMap = { COFFEE: '커피', TRANSPORT: '교통', SHOPPING: '쇼핑' };

        listContainer.innerHTML = Object.entries(groups).slice(0, 3).map(([cat, benefit]) => `
            <div class="benefit-item">
                <img src="${iconMap[cat] || 'assets/images/category_other.svg'}" alt="category" class="cat-icon">
                <div class="item-info">
                    <span class="spent">${nameMap[cat] || cat}</span>
                    <span class="cat-name">카테고리 혜택</span>
                </div>
                <div class="dots-sep"></div>
                <div class="item-benefit">
                    <span class="label">혜택</span>
                    <span class="val">${this.formatWon(benefit)}</span>
                </div>
            </div>
        `).join('');
    },

    formatWon(amount) {
        return Math.floor(amount).toLocaleString() + '원';
    },

    toggleRuleDetail(key) {
        const detail = document.getElementById(`detail-${key}`);
        const arrow = document.getElementById(`arrow-${key}`);
        if (detail.style.display === 'none') {
            detail.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
        } else {
            detail.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
        }
    }
};

window.onload = () => app.init();
