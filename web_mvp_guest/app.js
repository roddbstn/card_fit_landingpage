const app = {
    currentState: {
        currentScreen: 'home',
        previousScreen: 'home',
        selectedCompany: 'samsung',
        analysisResult: null
    },

    init() {
        console.log('App initialized');
        this.loadPersistentData();
        this.renderBenefitList();

        const fileInput = document.getElementById('csv-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
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
        if (['details', 'recommendation', 'category-conditions', 'card-details', 'verification'].includes(screenId)) {
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
            else if (screenId === 'verification') this.renderVerification();
            else if (screenId === 'home') this.renderBenefitList();
        }

        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });

        const mainScreens = { home: 0, upload: 1 };
        const activeNavIndex = mainScreens[screenId];
        if (activeNavIndex !== undefined) {
            const navItems = document.querySelectorAll('.bottom-nav .nav-item');
            if (navItems[activeNavIndex]) navItems[activeNavIndex].classList.add('active');
        }

        window.scrollTo(0, 0);
    },

    renderCardDetails() {
        const reportScreen = document.getElementById('report-screen');
        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('${this.currentState.previousScreen || 'home'}')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            
            <div style="padding: 0; text-align: center;">
                <img src="assets/images/card_taptap.png" style="width: 140px; height: 220px; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 0.5px solid #ddd;">
                <h2 style="font-size: 24px; font-weight: 700; margin-top: 25px;">삼성카드 taptap O</h2>
                <p style="color: #757575; font-size: 14px; margin-top: 8px;">라이프스타일에 맞춘 옵션 패키지 선택</p>
            </div>

            <div style="padding: 20px; margin-top: 20px;">
                <div style="background:#FAFAF8; border-radius: 15px; padding: 20px; border: 1px solid #eee;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <span style="color:#757575;">연회비</span>
                        <span style="font-weight:600;">국내/해외 10,000원</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#757575;">전월실적</span>
                        <span style="font-weight:600;">30만원 이상</span>
                    </div>
                </div>

                <h3 style="font-size: 18px; font-weight: 700; margin: 30px 0 20px 0;">주요 혜택</h3>
                
                <div class="benefit-card" style="display:flex; gap:15px; margin-bottom:20px;">
                    <div style="width:45px; height:45px; background:#F3EEFF; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px;">☕️</div>
                    <div>
                        <p style="font-size:15px; font-weight:700;">커피 전문점 30~50% 할인</p>
                        <p style="font-size:13px; color:#757575; margin-top:4px;">스타벅스 50% 또는 커피음식점 30%</p>
                    </div>
                </div>
            </div>

            <div style="padding: 0 0 40px 0;">
                <button class="btn-primary" style="width: 100%; height: 55px; border: none; border-radius: 15px; font-size: 18px; font-weight: 700; cursor: pointer; background: var(--primary-purple); color: #fff;">
                    카드 이용 가이드 보기
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
                             <span style="font-size: 12px; color: #999;">최대 가능 혜택</span>
                             <div style="font-size: 14px; font-weight: 600; color: #444;">${this.formatWon(totalMax)}</div>
                        </div>
                    </div>
                    <div style="height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
                        <div style="width: ${(totalBenefits / totalMax * 100).toFixed(1)}%; height: 100%; background: linear-gradient(90deg, #874FFF, #B897FF); border-radius: 6px;"></div>
                    </div>
                    <div style="font-size: 12px; color: #757575; margin-top: 10px; display: flex; align-items: center; gap: 5px;">
                        <span style="color: var(--primary-purple); font-weight: 700;">${(totalBenefits / totalMax * 100).toFixed(0)}%</span> 달성 중! 조금만 더 쓰면 최대 혜택이에요.
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
        if (!data || !data.totalSpent) return;

        const totalMissed = data.missedBenefits + data.underutilizedBenefits;

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

            <div class="report-section">
                <h3 style="font-size: 18px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
                    <span><span style="color: var(--primary-purple)">${this.formatWon(totalMissed)}</span> 혜택을 놓쳤어요</span>
                    <span class="badge-missed" style="font-size: 13px;">낮은 효율</span>
                </h3>

                <div class="summary-card" style="background: #F5F5F5; border-radius: 13px; padding: 20px; margin-top: 25px;">
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

    renderRecommendation() {
        const reportScreen = document.getElementById('report-screen');
        const data = this.currentState.analysisResult;
        const bestCard = (data && data.recommendedCard) || AnalysisEngine.cards[0];
        const potentialBenefits = (data && data.potentialBenefits) || 45000;
        const currentBenefits = (data && data.currentBenefits) || 12000;

        reportScreen.innerHTML = `
            <header class="header-back" style="padding: 20px 0;">
                <button class="btn-back" style="background:none; border:none;" onclick="app.navigateTo('report')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            
            <div style="padding: 0;">
                <h2 style="font-size: 24px; line-height: 1.4; font-weight: 700;">
                    ${bestCard.name}로 바꾸면<br>
                    <span style="color: var(--primary-purple)">매월 약 ${this.formatWon(potentialBenefits - currentBenefits)}</span><br>
                    더 받을 수 있어요
                </h2>
            </div>

            <div style="margin: 40px 0; text-align: center;">
                <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
                    <div style="text-align:center; opacity: 0.6;">
                        <p style="font-size:11px; margin-bottom:10px;">현재 카드</p>
                        <div style="width:85px; height:135px; background: url('assets/images/card_taptap.png') center/cover; border-radius:8px; border: 0.5px solid #eee;"></div>
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
                            <span style="font-size:14px; line-height:1.5;"><b>커피 50% 할인 혜택</b><br>스타벅스 등 자주 방문하시는 카페에서 건당 최대 5천원까지 적립됩니다.</span>
                        </div>
                        <div style="display:flex; gap:12px;">
                            <span style="font-size:18px;">📺</span>
                            <span style="font-size:14px; line-height:1.5;"><b>디지털 라이프 최적화</b><br>구독 중인 스트리밍 서비스와 배달 앱 결제 시 20% 추가 할인이 제공됩니다.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding:20px; position:fixed; bottom:0; width:100%; left:50%; transform:translateX(-50%); max-width:390px; background: #fff; border-top: 1px solid #eee;">
                <button class="btn-primary" style="width: 100%; height: 60px; border: none; border-radius: 15px; font-size: 18px; font-weight: 800; cursor: pointer; background: var(--primary-purple); color: #fff;" onclick="window.open('https://card.nonghyup.com/servlet/IpCc2021R.act', '_blank')">
                    지금 바로 카드 발급하기
                </button>
            </div>
        `;
    },

    renderDetails() {
        const reportScreen = document.getElementById('report-screen');
        const data = this.currentState.analysisResult;
        if (!data) return;
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
        this.finalizeAnalysis();
    },

    finalizeAnalysis() {
        const result = AnalysisEngine.analyze(this.currentState.analysisResult.transactions);
        this.currentState.analysisResult = result;
        this.savePersistentData();
        this.navigateTo('report');
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) this.finalizeAnalysis();
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
                </div>
                <div class="dots-sep"></div>
                <div class="item-benefit">
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
