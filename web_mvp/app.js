const app = {
    currentState: {
        currentScreen: 'home',
        selectedCompany: null,
        spendingData: null,
        analysisResult: null
    },

    init() {
        console.log('App initialized');
        this.renderBenefitList();

        const fileInput = document.getElementById('csv-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    },

    navigateTo(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentState.currentScreen = screenId;

            if (screenId === 'report') {
                this.renderReport();
            }
        }

        // Update Nav Icons
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.innerText.includes(this.getNavLabel(screenId))) {
                nav.classList.add('active');
            }
        });
    },

    getNavLabel(screenId) {
        switch (screenId) {
            case 'home': return '홈';
            case 'report': return '혜택';
            default: return '';
        }
    },

    renderReport() {
        const reportScreen = document.getElementById('report-screen');
        const data = this.currentState.analysisResult || {
            currentBenefits: 3000,
            totalSpent: 417261,
            missedBenefits: 32000,
            efficiency: 0.71
        };

        reportScreen.innerHTML = `
            <header class="header-back">
                <button class="btn-back" onclick="app.navigateTo('home')">
                    <img src="assets/icons/back_arrow.png" alt="back">
                </button>
            </header>
            
            <div class="report-header">
                <h2>지난 달에는<br><span class="highlight-red">혜택을 적게 받았어요</span></h2>
            </div>

            <div class="card-display">
                <h4>삼성카드 taptap O</h4>
                <img src="assets/images/card_taptap.png" alt="card" class="card-large">
                <p style="color: #757575; font-size: 14px; margin-top: 25px;">잘 쓰는법 확인하세요</p>
                <button class="btn-large" style="margin-top: 6px;">
                    <img src="assets/icons/arrow_up.svg" alt="up" style="filter: brightness(0) invert(1);">
                    카드 혜택 가이드 보기
                </button>
            </div>

            <div class="section-divider" style="height: 15px; background: #F5F5F5; margin: 40px -20px;"></div>

            <div class="report-section">
                <h3 style="font-size: 18px; font-weight: 700;">
                    <span style="color: var(--primary-purple)">${this.formatWon(data.missedBenefits)}</span> 혜택을 놓쳤어요
                    <span class="badge-missed" style="float: right">낮은 효율</span>
                </h3>

                <div class="summary-card" style="background: #F5F5F5; border-radius: 13px; padding: 20px; margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; color: #757575; font-size: 14px; font-weight: 600;">
                        <span>지난 달 받은 혜택</span>
                        <span style="color: #222222; font-weight: 700;">${this.formatWon(data.currentBenefits)}</span>
                    </div>
                </div>
            </div>

            <div class="section-divider" style="height: 15px; background: #F5F5F5; margin: 40px -20px;"></div>

            <div class="performance-section" style="padding: 20px 0;">
                <h3 style="font-size: 18px; font-weight: 700;">지출 대비<br><span style="color: var(--accent-red)">${data.efficiency}% 혜택</span>을 받았어요</h3>
                <div style="background: #F5F5F5; border-radius: 13px; padding: 20px; margin-top: 20px;">
                    <p style="color: #757575; font-size: 14px;">지난 달에 쓴 돈</p>
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <span style="font-size: 16px; font-weight: 500; color: #757575;">${this.formatWon(data.totalSpent)}</span>
                        <span style="font-size: 22px; font-weight: 800; color: var(--primary-purple);">${this.formatWon(data.currentBenefits)}</span>
                    </div>
                </div>
            </div>

            <div class="efficiency-guide" style="margin-top: 40px; background: #FFF; border-radius: 13px; padding: 25px;">
                <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 20px;">혜택 극대화 가이드</h4>
                <div class="guide-item" style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <div style="width: 40px; height: 40px; background: #F3EEFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">☕️</div>
                    <div>
                        <p style="font-size: 14px; font-weight: 700;">카페 업종에서 7,000원 추가 적립 가능</p>
                        <p style="font-size: 12px; color: #757575;">현재 ${this.formatWon(data.totalSpent * 0.1)}원 중 일부만 혜택받고 있어요.</p>
                    </div>
                </div>
                <div class="guide-item" style="display: flex; gap: 15px;">
                    <div style="width: 40px; height: 40px; background: #FFF4F4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🎬</div>
                    <div>
                        <p style="font-size: 14px; font-weight: 700;">영화관 예매 시 10,000원 즉시 할인</p>
                        <p style="font-size: 12px; color: #757575;">연간 12회 할인 한도를 모두 사용해보세요.</p>
                    </div>
                </div>
            </div>

            <button class="btn-primary" style="width: 100%; height: 55px; margin-top: 50px; border: none; border-radius: 15px; font-size: 18px; font-weight: 700; cursor: pointer;">
                나에게 딱 맞는 카드 추천받기
            </button>
        `;
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const transactions = AnalysisEngine.parseCSV(text);
            const result = AnalysisEngine.analyze(transactions, 'samsung_taptap');

            this.currentState.analysisResult = {
                currentBenefits: result.currentBenefits,
                totalSpent: result.totalSpent,
                missedBenefits: result.potentialBenefits - result.currentBenefits,
                efficiency: ((result.currentBenefits / result.totalSpent) * 100).toFixed(2)
            };

            this.navigateTo('report');
        };
        reader.readAsText(file);
    },

    selectCompany(companyId) {
        this.currentState.selectedCompany = companyId;
        console.log(`Company selected: ${companyId}`);
        // Visual indicator
    },

    renderBenefitList() {
        const listContainer = document.querySelector('.benefit-list');
        if (!listContainer) return;

        const sampleBenefits = [
            { category: '카페 카테고리', icon: 'assets/images/category_cafe.svg', spent: 92200, benefit: 10000 },
            { category: '영화 카테고리', icon: 'assets/images/category_movie.svg', spent: 30000, benefit: 10000 }
        ];

        listContainer.innerHTML = sampleBenefits.map(item => `
            <div class="benefit-item">
                <img src="${item.icon}" alt="category" class="cat-icon">
                <div class="item-info">
                    <span class="spent">${this.formatWon(item.spent)}</span>
                    <span class="cat-name">${item.category}</span>
                </div>
                <div class="dots-sep"></div>
                <div class="item-benefit">
                    <span class="label">혜택</span>
                    <span class="val">${this.formatWon(item.benefit)}</span>
                </div>
            </div>
        `).join('');
    },

    formatWon(amount) {
        return amount.toLocaleString() + '원';
    }
};

window.onload = () => app.init();
