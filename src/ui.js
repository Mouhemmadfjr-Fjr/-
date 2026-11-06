import einsteinArtwork from './scene/عالِم الفيزياء ومعادلات النجاح.png';

const controlDefinitions = {
  spring: [
    { key: 'm', label: 'm', unit: 'kg', min: 0.1, max: 1, step: 0.05 },
    { key: 'k', label: 'k', unit: 'N/m', min: 10, max: 100, step: 1 },
    { key: 'Xmax', label: 'X_max', unit: 'm', min: 0.02, max: 0.15, step: 0.01 },
  ],
  torsion: [
    { key: 'M', label: 'M', unit: 'kg', min: 0.05, max: 0.5, step: 0.01 },
    { key: 'L', label: 'L', unit: 'm', min: 0.2, max: 0.6, step: 0.01 },
    { key: 'm', label: 'm', unit: 'kg', min: 0, max: 0.2, step: 0.01 },
    { key: 'r', label: 'r', unit: 'm', min: 0.02, max: 0.2, step: 0.01 },
    { key: 'k', label: 'k', unit: 'N·m/rad', min: 0.01, max: 0.1, step: 0.001 },
    { key: 'thetaMax', label: 'θ_max', unit: 'rad', min: 0.1, max: 1.2, step: 0.01 },
  ],
  simple: [
    { key: 'L', label: 'L', unit: 'm', min: 0.2, max: 2, step: 0.05 },
    { key: 'm', label: 'm', unit: 'kg', min: 0.05, max: 0.5, step: 0.01 },
    { key: 'g', label: 'g', unit: 'm/s²', min: 1.6, max: 15, step: 0.1 },
    { key: 'thetaMax', label: 'θ_max', unit: 'rad', min: 0.05, max: 1.05, step: 0.01 },
  ],
  compound: [
    { key: 'M', label: 'M', unit: 'kg', min: 0.1, max: 1, step: 0.01 },
    { key: 'l', label: 'ℓ', unit: 'm', min: 0.3, max: 1, step: 0.01 },
    { key: 'f', label: 'f', unit: '—', min: 0.05, max: 0.45, step: 0.01 },
    { key: 'mp', label: 'm′', unit: 'kg', min: 0, max: 0.5, step: 0.01 },
    { key: 'thetaMax', label: 'θ_max', unit: 'rad', min: 0.05, max: 1.05, step: 0.01 },
  ],
};

const modeTitles = {
  spring: 'النواس المرن',
  torsion: 'نواس الفتل',
  simple: 'النواس الثقلي البسيط',
  compound: 'النواس الثقلي المركب',
};

const sourceLawContent = {
  spring: `
    <section class="source-law-card">
      <h5>1. إثبات قوة الإرجاع وشروط التوازن الساكن والمتحرك</h5>
      <div class="law-columns">
        <div>
          <strong>أولاً: حالة السكون (التوازن السكوني x=0)</strong>
          <p>نُعلّق الجسم بالنواض فيستطيل استطالة سكونية x₀ ويتوازن تحت تأثير قوتين:</p>
          <p class="law-equation">ΣF⃗ = 0 ⇒ w⃗ + F⃗ₛ₀ = 0</p>
          <p>بالإسقاط على محور xx′ الشاقولي نحو الأسفل:</p>
          <p class="law-equation">w − Fₛ₀ = 0 ⇒ w = Fₛ₀ = k · x₀</p>
        </div>
        <div>
          <strong>ثانياً: حالة الحركة (المطال x)</strong>
          <p>نزيح الجسم بمقدار x ونتركه بدون سرعة ابتدائية، فيخضع لقوتين:</p>
          <p class="law-equation">ΣF⃗ = m a⃗ ⇒ w⃗ + F⃗ₛ = m a⃗</p>
          <p>بالإسقاط: w − Fₛ = m·a ⇒ w − k(x₀ + x) = m·a</p>
          <p class="law-equation">k x₀ − k x₀ − k x = m a ⇒ F⃗ = −k · x̄</p>
          <p>نتيجة: محصلة القوى هي قوة إرجاع تعيد الجسم نحو موضع التوازن وتتناسب طرداً مع المطال وتعاكسه بالإشارة.</p>
        </div>
      </div>
    </section>
    <section class="source-law-card">
      <h5>2. التوابع الزمنية للحركة (المطال، السرعة، والتسارع)</h5>
      <div class="law-columns law-columns-three">
        <div>
          <strong>تابع المطال الخطي</strong>
          <p class="law-equation">x = Xₘₐₓ cos(ω₀ t + φ)</p>
          <p>يحدد موقع الجسم في كل لحظة t.</p>
        </div>
        <div>
          <strong>تابع السرعة (المشتق الأول)</strong>
          <p class="law-equation">v = (x)′ₜ = −ω₀ Xₘₐₓ sin(ω₀ t + φ)</p>
          <p>تكون عظمى عند وضع التوازن ومعدومة في الطرفين.</p>
        </div>
        <div>
          <strong>تابع التسارع (المشتق الثاني)</strong>
          <p class="law-equation">a = (v)′ₜ = −ω₀² Xₘₐₓ cos(ω₀ t + φ) = −ω₀² x</p>
          <p>يتناسب طرداً مع المطال ويعدم عند التوازن.</p>
        </div>
      </div>
    </section>
    <section class="source-law-card">
      <h5>3. دراسة تغيرات المقادير خلال دور كامل T₀ (شروط البدء x=+Xₘₐₓ, t=0)</h5>
      <div class="law-table-wrap">
        <table class="law-table">
          <thead>
            <tr><th>اللحظة t</th><th>t = 0</th><th>t = T₀/4</th><th>t = T₀/2</th><th>t = 3T₀/4</th><th>t = T₀</th></tr>
          </thead>
          <tbody>
            <tr><th>المطال x</th><td>+Xₘₐₓ (عظمى)</td><td>0 (معدوم)</td><td>−Xₘₐₓ (طرفي)</td><td>0 (معدوم)</td><td>+Xₘₐₓ</td></tr>
            <tr><th>السرعة v</th><td>0 (معدومة)</td><td>−ω₀ Xₘₐₓ (عظمى سالبة)</td><td>0 (معدومة)</td><td>+ω₀ Xₘₐₓ (عظمى موجبة)</td><td>0 (معدومة)</td></tr>
            <tr><th>التسارع a</th><td>−ω₀² Xₘₐₓ</td><td>0 (معدوم)</td><td>+ω₀² Xₘₐₓ</td><td>0 (معدوم)</td><td>−ω₀² Xₘₐₓ</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="source-law-card">
      <h5>4. الطاقة الميكانيكية والعلاقة الذهبية للسرعة</h5>
      <div class="law-columns">
        <div>
          <strong>ثبات الطاقة الميكانيكية الكلية</strong>
          <p class="law-equation">E<sub>tot</sub> = E<sub>k</sub> + E<sub>p</sub> = ½ m v² + ½ k x²</p>
          <p class="law-equation">E<sub>tot</sub> = ½ k Xₘₐₓ² = const</p>
          <p>• في الطرفين (x=±Xₘₐₓ): تكون E<sub>k</sub>=0 والطاقة كاملة كائنة E<sub>tot</sub>=E<sub>p</sub>.<br>• عند وضع التوازن (x=0): تكون E<sub>p</sub>=0 والطاقة كاملة حركية E<sub>tot</sub>=E<sub>k</sub>.</p>
        </div>
        <div>
          <strong>العلاقة الذهبية لحساب سرعة الجسم عند أي مطال</strong>
          <p class="law-equation">v = ω₀ √(Xₘₐₓ² − x²)</p>
          <p>تستخدم لحساب سرعة النواس في أي نقطة علم مطالها دون الحاجة لمعرفة الزمن t.</p>
        </div>
      </div>
    </section>`,
  torsion: `
    <section class="source-law-card">
      <h5>الدراسة التحريكية لنواس الفتل وتوابعه</h5>
      <p>بتطبيق التحريك الدوراني ΣΓ<sub>Δ</sub> = I<sub>Δ</sub> α على الساق المعلقة بسلك الفتل:</p>
      <p class="law-equation">Γ<sub>w⃗/Δ</sub> + Γ<sub>T⃗/Δ</sub> + Γ<sub>فتل</sub> = I<sub>Δ</sub> α</p>
      <p>بما أن عزوم w⃗ و T⃗ معدومة لأن حواملها تتقاطع مع محور الدوران Δ:</p>
      <p class="law-equation">Γ = −k θ = I<sub>Δ</sub> α ⇒ α = (θ)″ = −(k/I<sub>Δ</sub>) θ</p>
      <p>وهي معادلة تفاضلية تقبل حلاً جيبياً من الشكل:</p>
      <p class="law-equation">θ = θₘₐₓ cos(ω₀ t + φ)</p>
      <p>بحيث تكون النبض الخاص</p>
      <p class="law-equation">ω₀ = √(k/I<sub>Δ</sub>)</p>
      <p>والدور الخاص</p>
      <p class="law-equation">T₀ = 2π √(I<sub>Δ</sub>/k)</p>
    </section>`,
  simple: `
    <section class="source-law-card">
      <h5>الدراسة التحريكية للنواس البسيط وخيط التعليق</h5>
      <p>في حالة السعات الصغيرة (sinθ ≈ θ):</p>
      <p class="law-equation">Γ = −m · g · l · sinθ ≈ −m · g · l · θ</p>
      <p>وبالتعويض في معادلة التحريك الدوراني مع I<sub>Δ</sub> = m l² نجد:</p>
      <p class="law-equation">T₀ = 2π √(l/g)</p>
      <p>تؤكد العلاقة أن دور النواس البسيط لا يتعلق إطلاقاً بكتلة الكرة m ولا بجهة الاهتزاز في السعات الصغيرة.</p>
    </section>`,
  compound: `
    <section class="source-law-card">
      <h5>الدراسة التحريكية للنواس الثقلي المركب</h5>
      <p>عزم قوة ثقل الجسم الصلب بالنسبة لمخور الدوران Δ المار من O وبعده d عن مركز العطالة C:</p>
      <p class="law-equation">Γ = −(d · sinθ) · W = −M · g · d · sinθ</p>
      <p>من أجل السعات الزاوية الصغيرة θ ≤ 0.24rad تكون sinθ ≈ θ:</p>
      <p class="law-equation">T₀ = 2π √(I<sub>Δ</sub>/(M · g · d))</p>
    </section>`,
};

const comparisonData = {
  spring: {
    name: 'النواس المرن',
    type: 'حركة انسحابية مستقيمة اهتزازية توافقية بسيطة',
    equation: 'F⃗ = −k · x̄',
    inertia: 'الكتلة m (kg)',
    period: 'T₀ = 2π √(m/k)',
    omega: 'ω₀ = √(k/m)',
    massEffect: 'يزداد الدور طرداً مع الجذر التربيعي للكتلة √m',
    amplitudeEffect: 'مستقل تماماً عن سعة الاهتزاز Xₘₐₓ',
  },
  torsion: {
    name: 'نواس الفتل',
    type: 'حركة دورانية اهتزازية توافقية بسيطة في مستوى أفقي',
    equation: 'Γ = −k · θ',
    inertia: 'عزم العطالة I<sub>Δ</sub> (kg·m<sup>2</sup>)',
    period: 'T₀ = 2π √(I<sub>Δ</sub>/k)',
    omega: 'ω₀ = √(k/I<sub>Δ</sub>)',
    massEffect: 'يتغير حسب عزم العطالة وتوزيع الكتلة I<sub>Δ</sub>',
    amplitudeEffect: 'مستقل تماماً عن السعة الزاوية θ<sub>max</sub>',
  },
  simple: {
    name: 'النواس الثقلي البسيط',
    type: 'حركة دورانية اهتزازية في مستوى شاقولي (سعات صغيرة)',
    equation: 'Γ = −m · g · l · θ',
    inertia: 'عزم العطالة للكرة I<sub>Δ</sub> = m · l<sup>2</sup>',
    period: 'T₀ = 2π √(l/g)',
    omega: 'ω₀ = √(g/l)',
    massEffect: 'مستقل تماماً عن الكتلة m (لا يتغير بتغير الكتلة)',
    amplitudeEffect: 'مستقل عن السعة فقط في الزوايا الصغيرة θ ≤ 0.24rad',
  },
  compound: {
    name: 'النواس الثقلي المركب',
    type: 'حركة دورانية اهتزازية لجسم صلب في مستوى شاقولي',
    equation: 'Γ = −M · g · d · θ',
    inertia: 'عزم عطالة الجسم الصلب I<sub>Δ</sub> حول محور الدوران Δ',
    period: 'T₀ = 2π √(I<sub>Δ</sub>/(M · g · d))',
    omega: 'ω₀ = √((M · g · d)/I<sub>Δ</sub>)',
    massEffect: 'يتغير حسب موضع تعليق الكتلة وتأثيرها على I<sub>Δ</sub> و M',
    amplitudeEffect: 'مستقل عن السعة في الزوايا الصغيرة θ ≤ 0.24rad',
  },
};

const comprehensiveComparison = `
  <section class="source-law-card comparison-card">
    <h5>جدول المقارنة الشامل الكامل بين النواسات الأربعة</h5>
    <div class="law-table-wrap">
      <table class="law-table comprehensive-table">
        <thead>
          <tr>
            <th>وجه المقارنة</th>
            <th>النواس المرن</th>
            <th>نواس الفتل</th>
            <th>النواس الثقلي البسيط</th>
            <th>النواس الثقلي المركب</th>
          </tr>
        </thead>
        <tbody>
          <tr><th>نوع الحركة</th><td>انسحابية مستقيمة اهتزازية</td><td>دورانية اهتزازية أفقية</td><td>دورانية اهتزازية شاقولية</td><td>دورانية اهتزازية لجسم صلب</td></tr>
          <tr>
            <th>معادلة الإرجاع / العزم</th>
            <td class="law-equation">F⃗ = −k · x̄</td>
            <td class="law-equation">Γ = −k · θ</td>
            <td class="law-equation">Γ = −m · g · l · θ</td>
            <td class="law-equation">Γ = −M · g · d · θ</td>
          </tr>
          <tr>
            <th>عنصر القصور (العطالة)</th>
            <td>الكتلة m (kg)</td>
            <td>عزم العطالة I<sub>Δ</sub> (kg·m<sup>2</sup>)</td>
            <td>عزم العطالة I<sub>Δ</sub> = m l<sup>2</sup></td>
            <td>عزم عطالة الجسم I<sub>Δ</sub></td>
          </tr>
          <tr>
            <th>قانون الدور الخاص (T<sub>0</sub>)</th>
            <td class="law-equation">T<sub>0</sub> = 2π √(m/k)</td>
            <td class="law-equation">T<sub>0</sub> = 2π √(I<sub>Δ</sub>/k)</td>
            <td class="law-equation">T<sub>0</sub> = 2π √(l/g)</td>
            <td class="law-equation">T<sub>0</sub> = 2π √(I<sub>Δ</sub>/(M · g · d))</td>
          </tr>
          <tr>
            <th>تأثير الكتلة على الدور</th>
            <td>يزداد بزيادة الكتلة m</td>
            <td>يعتمد على توزيع الكتلة I<sub>Δ</sub></td>
            <td>مستقل تماماً عن الكتلة m</td>
            <td>يتغير حسب موضع الكتلة وتاثيرها في I<sub>Δ</sub> و M</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>`;

function createDynamicComparison() {
  return `
    <section class="source-law-card comparison-card dynamic-comparison">
      <div class="comparison-heading">
        <div>
          <span class="comparison-kicker">مختبر المقارنة</span>
          <h5>قارن بين النواسات</h5>
          <p>اختر نواسين لمقارنة القوانين والخواص مباشرة.</p>
        </div>
        <span class="comparison-icon" aria-hidden="true">⇄</span>
      </div>
      <div class="comparison-selectors">
        <label>النواس الأول:
          <select data-compare-select="first" aria-label="النواس الأول للمقارنة">
            ${Object.entries(comparisonData).map(([key, pendulum]) => `<option value="${key}"${key === 'spring' ? ' selected' : ''}>${pendulum.name}</option>`).join('')}
          </select>
        </label>
        <label>النواس الثاني (للمقارنة):
          <select data-compare-select="second" aria-label="النواس الثاني للمقارنة">
            ${Object.entries(comparisonData).map(([key, pendulum]) => `<option value="${key}"${key === 'torsion' ? ' selected' : ''}>${pendulum.name}</option>`).join('')}
          </select>
        </label>
        <div class="comparison-actions">
          <button type="button" class="comparison-action" data-compare-action="swap">تبديل النواسين</button>
          <button type="button" class="comparison-action secondary" data-compare-action="reset">إعادة الضبط</button>
        </div>
      </div>
      <p class="comparison-status" role="status" aria-live="polite"></p>
      <div class="law-table-wrap">
        <table class="law-table dynamic-table">
          <thead><tr><th>وجه المقارنة</th><th data-compare-heading="first">النواس المرن</th><th data-compare-heading="second">نواس الفتل</th></tr></thead>
          <tbody>
            <tr><th>نوع وطبيعة الحركة</th><td data-compare-value="first" data-field="type"></td><td data-compare-value="second" data-field="type"></td></tr>
            <tr><th>معادلة الإرجاع / العزم</th><td data-compare-value="first" data-field="equation" class="law-equation"></td><td data-compare-value="second" data-field="equation" class="law-equation"></td></tr>
            <tr><th>عنصر القصور الذاتي</th><td data-compare-value="first" data-field="inertia"></td><td data-compare-value="second" data-field="inertia"></td></tr>
            <tr><th>قانون الدور الخاص T<sub>0</sub></th><td data-compare-value="first" data-field="period" class="law-equation"></td><td data-compare-value="second" data-field="period" class="law-equation"></td></tr>
            <tr><th>قانون النبض الخاص ω<sub>0</sub></th><td data-compare-value="first" data-field="omega" class="law-equation"></td><td data-compare-value="second" data-field="omega" class="law-equation"></td></tr>
            <tr><th>تأثير الكتلة</th><td data-compare-value="first" data-field="massEffect"></td><td data-compare-value="second" data-field="massEffect"></td></tr>
            <tr><th>تأثير سعة الاهتزاز</th><td data-compare-value="first" data-field="amplitudeEffect"></td><td data-compare-value="second" data-field="amplitudeEffect"></td></tr>
          </tbody>
        </table>
      </div>
    </section>`;
}

function updateDynamicComparison(container) {
  const keys = ['first', 'second'].map((column) => (
    container.querySelector(`[data-compare-select="${column}"]`).value
  ));
  const pendulumsToCompare = keys.map((key) => comparisonData[key]);
  const fields = ['type', 'equation', 'inertia', 'period', 'omega', 'massEffect', 'amplitudeEffect'];

  for (const [index, column] of ['first', 'second'].entries()) {
    const pendulum = pendulumsToCompare[index];
    container.querySelector(`[data-compare-heading="${column}"]`).textContent = pendulum.name;
    container.querySelectorAll(`[data-compare-value="${column}"]`).forEach((cell) => {
      cell.innerHTML = pendulum[cell.dataset.field];
      cell.classList.toggle(
        'comparison-difference',
        keys[0] !== keys[1]
          && pendulumsToCompare[0][cell.dataset.field] !== pendulumsToCompare[1][cell.dataset.field],
      );
    });
  }

  const status = container.querySelector('.comparison-status');
  if (keys[0] === keys[1]) {
    status.textContent = 'تم اختيار النواس نفسه في الطرفين؛ قيم المقارنة متطابقة.';
    status.classList.add('same-pendulum');
  } else {
    const differenceCount = fields.filter((field) => (
      pendulumsToCompare[0][field] !== pendulumsToCompare[1][field]
    )).length;
    status.textContent = `تختلف النواسان في ${differenceCount} من أوجه المقارنة.`;
    status.classList.remove('same-pendulum');
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  return Math.abs(value) < 0.0001 && value !== 0 ? value.toExponential(2) : value.toFixed(4);
}

export function createUI(pendulums, actions) {
  const app = document.querySelector('#app');
  if (!app) throw new Error('The application root element #app is missing.');

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">θ</div>
          <div><h1>مختبر النواسات الأربعة</h1><p>محاكاة تفاعلية للنواسات</p></div>
        </div>
        <nav class="topnav" aria-label="اختيار النواس">
          <button class="nav-tab" data-mode="all" type="button">الكل</button>
          <button class="nav-tab" data-mode="spring" type="button">النواس المرن</button>
          <button class="nav-tab" data-mode="torsion" type="button">نواس الفتل</button>
          <button class="nav-tab" data-mode="simple" type="button">النواس البسيط</button>
          <button class="nav-tab" data-mode="compound" type="button">النواس المركب</button>
        </nav>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> مختبر الفيزياء التفاعلي</span>
          <h2>اكتشف حركة <span>النواسات الأربعة</span></h2>
          <p>غيّر المعاملات لمتابعة أثرها في الحركة والقياسات الفيزيائية ووحدات SI.</p>
        </div>
        <aside class="einstein-card" aria-label="مشهد تعليمي متحرك لألبرت أينشتاين">
          <div class="einstein-visual">
            <img
              class="einstein-image"
              src="${einsteinArtwork}"
              alt="ألبرت أينشتاين يشير إلى المشاهد أمام سبورة ومعادلات ذرية، مع فقاعة عربية تقول: هذه قوانيني، ادرسها لكي تنجح!"
              fetchpriority="high"
            />
          </div>
        </aside>
      </section>

      <div class="layout">
        <section class="scene-panel">
          <div class="scene-header"><h3>مشهد النواسات</h3><span class="pill">Three.js</span></div>
          <div id="scene-wrap" aria-label="المشهد ثلاثي الأبعاد"></div>
          <div class="scene-key" aria-label="دليل الرموز">
            <div class="scene-key-title">دليل الرموز والألوان</div>
            <div class="scene-key-items">
              <span class="key-item"><b class="key-symbol symbol-gravity">w</b><span>الثقل · برتقالي</span></span>
              <span class="key-item"><b class="key-symbol symbol-tension">Fₛ / T</b><span>توتر النابض أو الخيط · أزرق</span></span>
              <span class="key-item"><b class="key-symbol symbol-restoring">F / Γ</b><span>قوة أو عزم الإرجاع · وردي</span></span>
              <span class="key-item"><b class="key-symbol symbol-reaction">R</b><span>رد فعل المحور · أخضر</span></span>
              <span class="key-item"><b class="key-symbol symbol-motion">x / x₀ / Xₘₐₓ / θ</b><span>الإزاحة والاستطالة والسعة والزاوية</span></span>
              <span class="key-item"><b class="key-symbol symbol-equilibrium">O / c / d / Δ</b><span>التوازن، مركز العطالة، البعد، المحور</span></span>
              <span class="key-item"><b class="key-symbol symbol-path">┄</b><span>التوازن والمسار بنمطين مختلفين</span></span>
            </div>
          </div>
          <div class="toolbar">
            <button class="tool-btn" id="toggle-play" type="button">إيقاف مؤقت</button>
            <button class="tool-btn secondary" id="reset-scene" type="button">إعادة الضبط</button>
            <button class="tool-btn accent" id="toggle-forces" type="button">إخفاء القوى</button>
            <button class="tool-btn accent" id="toggle-energy" type="button">إخفاء الطاقة</button>
            <button class="tool-btn secondary" id="front-view" type="button">منظر أمامي</button>
          </div>
          <div class="controls" id="controls-grid"></div>
        </section>

        <aside class="side-stack" id="side-stack">
          <section class="panel" id="metrics"><h3>القيم اللحظية</h3><div id="stat-grid"></div></section>
          <section class="panel" id="theory"><h3>العلاقات النظرية</h3><div id="info-box"></div></section>
        </aside>
      </div>
    </div>`;

  const controlsRoot = app.querySelector('#controls-grid');
  const statGrid = app.querySelector('#stat-grid');
  const infoBox = app.querySelector('#info-box');
  const state = {
    activeMode: 'spring',
    play: true,
    showForces: true,
    showEnergy: true,
  };
  const controls = [];

  function makeControl(mode, definition) {
    const pendulum = pendulums[mode];
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(definition.min);
    input.max = String(definition.max);
    input.step = String(definition.step);
    input.value = String(pendulum.params[definition.key]);
    input.setAttribute('aria-label', `${definition.label} (${definition.unit})`);
    const output = document.createElement('output');
    output.textContent = `${formatNumber(pendulum.params[definition.key])} ${definition.unit}`;
    input.addEventListener('input', () => {
      pendulum.params[definition.key] = Number(input.value);
      if (mode === 'torsion' && definition.key === 'L') {
        const radiusControl = controls.find((control) => control.mode === mode && control.key === 'r');
        const radiusDefinition = controlDefinitions.torsion.find((item) => item.key === 'r');
        const maximumRadius = Number((pendulum.params.L / 2).toFixed(2));
        radiusControl.input.max = String(maximumRadius);
        radiusDefinition.max = Math.max(radiusDefinition.min, maximumRadius);
        if (pendulum.params.r > maximumRadius) {
          pendulum.params.r = maximumRadius;
          radiusControl.input.value = String(maximumRadius);
          radiusControl.output.textContent = `${formatNumber(maximumRadius)} ${radiusDefinition.unit}`;
        }
      }
      output.textContent = `${formatNumber(pendulum.params[definition.key])} ${definition.unit}`;
      pendulum.reset();
      actions.refresh();
    });
    const wrapper = document.createElement('label');
    wrapper.className = 'control';
    wrapper.innerHTML = `<span class="label-row"><span>${definition.label} (${definition.unit})</span></span>`;
    wrapper.append(input, output);
    controls.push({ mode, key: definition.key, input, output });
    return wrapper;
  }

  Object.entries(controlDefinitions).forEach(([mode, definitions]) => {
    const group = document.createElement('details');
    group.className = 'control-group';
    group.dataset.mode = mode;
    group.open = mode === state.activeMode;
    const heading = document.createElement('summary');
    heading.textContent = modeTitles[mode];
    heading.setAttribute('aria-label', `إعدادات ${modeTitles[mode]} والقوانين`);
    const grid = document.createElement('div');
    grid.className = 'control-grid';
    definitions.forEach((definition) => grid.append(makeControl(mode, definition)));
    const laws = document.createElement('div');
    laws.className = 'source-laws';
    laws.innerHTML = sourceLawContent[mode]
      + (mode === 'compound' ? `${comprehensiveComparison}${createDynamicComparison()}` : '');
    group.append(heading, grid, laws);
    if (mode === 'compound') {
      const comparison = laws.querySelector('.dynamic-comparison');
      comparison.querySelectorAll('[data-compare-select]').forEach((select) => {
        select.addEventListener('change', () => updateDynamicComparison(comparison));
      });
      comparison.querySelector('[data-compare-action="swap"]').addEventListener('click', () => {
        const [first, second] = comparison.querySelectorAll('[data-compare-select]');
        [first.value, second.value] = [second.value, first.value];
        updateDynamicComparison(comparison);
      });
      comparison.querySelector('[data-compare-action="reset"]').addEventListener('click', () => {
        const [first, second] = comparison.querySelectorAll('[data-compare-select]');
        first.value = 'spring';
        second.value = 'torsion';
        updateDynamicComparison(comparison);
      });
      updateDynamicComparison(comparison);
    }
    controlsRoot.append(group);
  });

  function isEnergyRow(label) {
    return /^(E|Eₖ|Eₚ)$/.test(label);
  }

  function refreshValues() {
    const visibleModes = state.activeMode === 'all' ? Object.keys(pendulums) : [state.activeMode];
    statGrid.innerHTML = visibleModes.map((mode) => {
      const { rows } = pendulums[mode].stats();
      return `<section class="stat-group"><h4>${modeTitles[mode]}</h4><div class="stat-rows">${rows.map(([label, value, unit]) => `
        <div class="stat-box${isEnergyRow(label) ? ' energy-row' : ''}">
          <span class="key">${label}</span>
          <span class="value" dir="ltr">${formatNumber(value)} <small>${unit}</small></span>
        </div>`).join('')}</div></section>`;
    }).join('');
    app.querySelectorAll('.energy-row').forEach((row) => row.classList.toggle('energy-hidden', !state.showEnergy));

    infoBox.innerHTML = visibleModes.map((mode) => `
      <section class="theory-group"><h4>${modeTitles[mode]}</h4>${pendulums[mode].theoryHTML}
        ${['simple', 'compound'].includes(mode) && pendulums[mode].params.thetaMax > 0.24
    ? '<p class="large-angle-badge">سعة كبيرة: الحركة غير جيبية</p>'
    : ''}</section>`).join('');
  }

  function syncControls() {
    controls.forEach(({ mode, key, input, output }) => {
      const definition = controlDefinitions[mode].find((item) => item.key === key);
      const pendulum = pendulums[mode];
      input.value = String(pendulum.params[key]);
      output.textContent = `${formatNumber(pendulum.params[key])} ${definition.unit}`;
      if (mode === 'torsion' && key === 'r') input.max = String(Math.max(definition.min, pendulum.params.L / 2));
    });
  }

  function setMode(mode) {
    if (mode !== 'all' && !pendulums[mode]) throw new Error(`Unknown pendulum mode: ${mode}`);
    state.activeMode = mode;
    app.querySelectorAll('.nav-tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
    app.querySelectorAll('.control-group').forEach((group) => {
      group.hidden = mode !== 'all' && group.dataset.mode !== mode;
      group.open = mode !== 'all' && group.dataset.mode === mode;
    });
    actions.setMode(mode);
    refreshValues();
  }

  app.querySelectorAll('.nav-tab').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });
  app.querySelector('#toggle-play').addEventListener('click', (event) => {
    state.play = !state.play;
    event.currentTarget.textContent = state.play ? 'إيقاف مؤقت' : 'متابعة';
  });
  app.querySelector('#reset-scene').addEventListener('click', () => {
    Object.values(pendulums).forEach((pendulum) => {
      Object.assign(pendulum.params, pendulum.defaults);
      pendulum.reset();
    });
    syncControls();
    state.play = true;
    state.showForces = true;
    state.showEnergy = true;
    app.querySelector('#toggle-play').textContent = 'إيقاف مؤقت';
    app.querySelector('#toggle-forces').textContent = 'إخفاء القوى';
    app.querySelector('#toggle-energy').textContent = 'إخفاء الطاقة';
    actions.reset();
    refreshValues();
  });
  app.querySelector('#toggle-forces').addEventListener('click', (event) => {
    state.showForces = !state.showForces;
    event.currentTarget.textContent = state.showForces ? 'إخفاء القوى' : 'إظهار القوى';
  });
  app.querySelector('#toggle-energy').addEventListener('click', (event) => {
    state.showEnergy = !state.showEnergy;
    event.currentTarget.textContent = state.showEnergy ? 'إخفاء الطاقة' : 'إظهار الطاقة';
    app.querySelectorAll('.energy-row').forEach((row) => row.classList.toggle('energy-hidden', !state.showEnergy));
  });
  app.querySelector('#front-view').addEventListener('click', () => actions.frontView(state.activeMode));

  setMode(state.activeMode);
  return {
    state,
    refresh: refreshValues,
    syncControls,
  };
}
