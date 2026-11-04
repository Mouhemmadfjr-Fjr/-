


        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']]
            },
            svg: { fontCache: 'global' }
        };
    




        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        beige: {
                            50: '#fdfbf7',
                            100: '#f7f2e8',
                            200: '#eee3d0',
                            300: '#e3d0b3',
                            800: '#4a3f31',
                            900: '#2c241b',
                        },
                        gold: {
                            400: '#fbbf24',
                            500: '#d97706',
                            600: '#b45309',
                            700: '#92400e',
                        },
                        softblue: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            400: '#38bdf8',
                            600: '#0284c7',
                            800: '#075985',
                            900: '#0c4a6e',
                        }
                    },
                    fontFamily: {
                        cairo: ['Cairo', 'sans-serif'],
                        tajawal: ['Tajawal', 'sans-serif'],
                    }
                }
            }
        }
    


        // TOGGLE ACCORDIONS WITH ARROW ROTATION AND AUTO-COLLAPSE OTHERS
        function toggleAccordion(accId) {
            const content = document.getElementById(accId);
            const icon = document.getElementById('icon_' + accId);

            // Close all others
            const allContents = document.querySelectorAll('.accordion-content');
            allContents.forEach(c => {
                if (c.id !== accId) {
                    c.classList.remove('active');
                    const otherIcon = document.getElementById('icon_' + c.id);
                    if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current
            const isActive = content.classList.contains('active');
            if (isActive) {
                content.classList.remove('active');
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('active');
                icon.style.transform = 'rotate(180deg)';
                if (window.MathJax) MathJax.typesetPromise();
            }
        }

        // PENDULUM DATA DICTIONARY FOR DYNAMIC COMPARISON
        const pendulumData = {
            spring: {
                name: 'النواس المرن',
                type: 'حركة انسحابية مستقيمة اهتزازية توافقية بسيطة',
                eq: '$$\\vec{F} = -k \\cdot \\bar{x}$$',
                inertia: 'الكتلة $m$ ($kg$)',
                t0: '$$T_0 = 2\\pi \\sqrt{\\frac{m}{k}}$$',
                w0: '$$\\omega_0 = \\sqrt{\\frac{k}{m}}$$',
                massEffect: 'يزداد الدور طرداً مع الجذر التربعي للكتلة $\\sqrt{m}$',
                amplitudeEffect: 'مستقل تماماً عن سعة الاهتزاز $X_{\\max}$'
            },
            torsion: {
                name: 'نواس الفتل',
                type: 'حركة دورانية اهتزازية توافقية بسيطة في مستوى أفقي',
                eq: '$$\\Gamma = -k \\cdot \\theta$$',
                inertia: 'عزم العطالة $I_\\Delta$ ($kg\\cdot m^2$)',
                t0: '$$T_0 = 2\\pi \\sqrt{\\frac{I_\\Delta}{k}}$$',
                w0: '$$\\omega_0 = \\sqrt{\\frac{k}{I_\\Delta}}$$',
                massEffect: 'يتغير حسب عزم العطالة وتوزيع الكتلة $I_\\Delta$',
                amplitudeEffect: 'مستقل تماماً عن السعة الزاوية $\\theta_{\\max}$'
            },
            simple: {
                name: 'النواس الثقلي البسيط',
                type: 'حركة دورانية اهتزازية في مستوى شاقولي (سعات صغيرة)',
                eq: '$$\\Gamma = -m \\cdot g \\cdot l \\cdot \\theta$$',
                inertia: 'عزم العطالة للكرة $I_\\Delta = m \\cdot l^2$',
                t0: '$$T_0 = 2\\pi \\sqrt{\\frac{l}{g}}$$',
                w0: '$$\\omega_0 = \\sqrt{\\frac{g}{l}}$$',
                massEffect: 'مستقل تماماً عن الكتلة $m$ (لا يتغير بتغير الكتلة)',
                amplitudeEffect: 'مستقل عن السعة فقط في الزوايا الصغيرة $\\theta \\le 0.24\\text{rad}$'
            },
            compound: {
                name: 'النواس الثقلي المركب',
                type: 'حركة دورانية اهتزازية لجسم صلب في مستوى شاقولي',
                eq: '$$\\Gamma = -M \\cdot g \\cdot d \\cdot \\theta$$',
                inertia: 'عزم عطالة الجسم الصلب $I_\\Delta$ حول محور الدوران $\\Delta$',
                t0: '$$T_0 = 2\\pi \\sqrt{\\frac{I_\\Delta}{M \\cdot g \\cdot d}}$$',
                w0: '$$\\omega_0 = \\sqrt{\\frac{M \\cdot g \\cdot d}{I_\\Delta}}$$',
                massEffect: 'يتغير حسب موضع تعليق الكتلة وتأثيرها على $I_\\Delta$ و $M$',
                amplitudeEffect: 'مستقل عن السعة في الزوايا الصغيرة $\\theta \\le 0.24\\text{rad}$'
            }
        };

        function updateCustomComparison() {
            const p1Key = document.getElementById('select_pendulum_1').value;
            const p2Key = document.getElementById('select_pendulum_2').value;

            const p1 = pendulumData[p1Key];
            const p2 = pendulumData[p2Key];

            document.getElementById('comp_head_1').innerText = p1.name;
            document.getElementById('comp_head_2').innerText = p2.name;

            const rows = [
                { title: 'نوع وطبيعة الحركة', v1: p1.type, v2: p2.type },
                { title: 'معادلة الإرجاع / العزم', v1: p1.eq, v2: p2.eq },
                { title: 'عنصر القصور الذاتي', v1: p1.inertia, v2: p2.inertia },
                { title: 'قانون الدور الخاص $T_0$', v1: p1.t0, v2: p2.t0 },
                { title: 'قانون النبض الخاص $\\omega_0$', v1: p1.w0, v2: p2.w0 },
                { title: 'تأثير الكتلة', v1: p1.massEffect, v2: p2.massEffect },
                { title: 'تأثير سعة الاهتزاز', v1: p1.amplitudeEffect, v2: p2.amplitudeEffect },
            ];

            const tbody = document.getElementById('custom_comp_body');
            tbody.innerHTML = rows.map(r => `
                <tr class="hover:bg-amber-50/50">
                    <td class="p-3 font-bold bg-beige-50 border-l border-amber-200">${r.title}</td>
                    <td class="p-3 border-l border-amber-200 font-medium">${r.v1}</td>
                    <td class="p-3 font-medium">${r.v2}</td>
                </tr>
            `).join('');

            if (window.MathJax) MathJax.typesetPromise();
        }

        // Initialize comparison on load
        window.addEventListener('DOMContentLoaded', updateCustomComparison);

        // Helper Draw Vector Arrow
        function drawArrow(ctx, fromx, fromy, tox, toy, color, label) {
            const headlen = 7;
            const dx = tox - fromx;
            const dy = toy - fromy;
            const angle = Math.atan2(dy, dx);
            if (Math.hypot(dx, dy) < 2) return;

            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(fromx, fromy);
            ctx.lineTo(tox, toy);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(tox, toy);
            ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();

            if (label) {
                ctx.font = 'bold 12px Cairo';
                ctx.fillText(label, tox + 5, toy + 4);
            }
            ctx.restore();
        }

        // Global Sim Times & States
        const dt = 0.016;
        let timeSpring = 0, pausedSpring = false;
        let timeTorsion = 0, pausedTorsion = false;
        let timeSimple = 0, pausedSimple = false;
        let timeCompound = 0, pausedCompound = false;

        // CANVASES
        const springCanvas = document.getElementById('springCanvas');
        const springCtx = springCanvas.getContext('2d');
        const torsionCanvas = document.getElementById('torsionCanvas');
        const torsionCtx = torsionCanvas.getContext('2d');
        const simpleCanvas = document.getElementById('simpleCanvas');
        const simpleCtx = simpleCanvas.getContext('2d');
        const compoundCanvas = document.getElementById('compoundCanvas');
        const compoundCtx = compoundCanvas.getContext('2d');

        function syncCanvasSize(canvas) {
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(320, Math.round(rect.width || canvas.clientWidth || 320));
            const height = Math.max(240, Math.round(rect.height || canvas.clientHeight || 240));
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        }

        function syncAllCanvasSizes() {
            [springCanvas, torsionCanvas, simpleCanvas, compoundCanvas].forEach((canvas) => {
                if (canvas) {
                    syncCanvasSize(canvas);
                }
            });
        }

        function makeSpringParams() {
            return {
                m: Number(document.getElementById('param_spring_m').value || 1),
                k: Number(document.getElementById('param_spring_k').value || 20),
                xmax: Number(document.getElementById('param_spring_xmax').value || 0.15),
                g: 9.81
            };
        }

        function makeTorsionParams() {
            return {
                i: Number(document.getElementById('param_torsion_i').value || 0.05),
                k: Number(document.getElementById('param_torsion_k').value || 0.4),
                thetamax: Number(document.getElementById('param_torsion_thetamax').value || 0.45)
            };
        }

        function makeSimpleParams() {
            const thetaNode = document.getElementById('param_simple_theta');
            return {
                l: Number(document.getElementById('param_simple_l').value || 1),
                g: Number(document.getElementById('param_simple_g').value || 9.8),
                thetamax: Number(thetaNode ? thetaNode.value : 0.35),
                m: Number(document.getElementById('param_simple_m').value || 0.5)
            };
        }

        function makeCompoundParams() {
            const thetaNode = document.getElementById('param_compound_theta');
            return {
                i: Number(document.getElementById('param_compound_i').value || 0.12),
                m: Number(document.getElementById('param_compound_m').value || 1.2),
                d: Number(document.getElementById('param_compound_d').value || 0.25),
                g: 9.81,
                thetamax: Number(thetaNode ? thetaNode.value : 0.35)
            };
        }

        const params = {
            spring: makeSpringParams(),
            torsion: makeTorsionParams(),
            simple: makeSimpleParams(),
            compound: makeCompoundParams()
        };

        function refreshParams() {
            params.spring = makeSpringParams();
            params.torsion = makeTorsionParams();
            params.simple = makeSimpleParams();
            params.compound = makeCompoundParams();

            document.getElementById('val_spring_m').textContent = params.spring.m.toFixed(1);
            document.getElementById('val_spring_k').textContent = params.spring.k.toFixed(0);
            document.getElementById('val_spring_xmax').textContent = params.spring.xmax.toFixed(2);

            document.getElementById('val_torsion_i').textContent = params.torsion.i.toFixed(3);
            document.getElementById('val_torsion_k').textContent = params.torsion.k.toFixed(2);
            document.getElementById('val_torsion_thetamax').textContent = params.torsion.thetamax.toFixed(2);

            document.getElementById('val_simple_l').textContent = params.simple.l.toFixed(2);
            document.getElementById('val_simple_g').textContent = params.simple.g.toFixed(1);
            document.getElementById('val_simple_m').textContent = params.simple.m.toFixed(1);
            const simpleThetaLabel = document.getElementById('val_simple_theta');
            if (simpleThetaLabel) simpleThetaLabel.textContent = params.simple.thetamax.toFixed(2);

            document.getElementById('val_compound_i').textContent = params.compound.i.toFixed(2);
            document.getElementById('val_compound_m').textContent = params.compound.m.toFixed(1);
            document.getElementById('val_compound_d').textContent = params.compound.d.toFixed(2);
            const compoundThetaLabel = document.getElementById('val_compound_theta');
            if (compoundThetaLabel) compoundThetaLabel.textContent = params.compound.thetamax.toFixed(2);
        }

        const allRanges = [
            'param_spring_m', 'param_spring_k', 'param_spring_xmax',
            'param_torsion_i', 'param_torsion_k', 'param_torsion_thetamax',
            'param_simple_l', 'param_simple_g', 'param_simple_m', 'param_simple_theta',
            'param_compound_i', 'param_compound_m', 'param_compound_d', 'param_compound_theta'
        ];

        function bindControls() {
            allRanges.forEach(id => {
                const node = document.getElementById(id);
                if (!node) return;
                node.addEventListener('input', () => {
                    refreshParams();
                });
            });

            const buttonPairs = [
                ['btn_spring_pause', 'spring'],
                ['btn_torsion_pause', 'torsion'],
                ['btn_simple_pause', 'simple'],
                ['btn_compound_pause', 'compound']
            ];

            const pauseMap = {
                spring: { state: () => pausedSpring, set: (value) => { pausedSpring = value; } },
                torsion: { state: () => pausedTorsion, set: (value) => { pausedTorsion = value; } },
                simple: { state: () => pausedSimple, set: (value) => { pausedSimple = value; } },
                compound: { state: () => pausedCompound, set: (value) => { pausedCompound = value; } }
            };

            buttonPairs.forEach(([btnId, key]) => {
                const btn = document.getElementById(btnId);
                if (!btn) return;
                btn.addEventListener('click', () => {
                    const config = pauseMap[key];
                    config.set(!config.state());
                    btn.innerHTML = config.state()
                        ? '<i class="fa-solid fa-play ml-1"></i> متابعة'
                        : '<i class="fa-solid fa-pause ml-1"></i> إيقاف مؤقت';
                });
            });

            const resetPairs = [
                ['btn_spring_reset', () => { timeSpring = 0; pausedSpring = false; }],
                ['btn_torsion_reset', () => { timeTorsion = 0; pausedTorsion = false; }],
                ['btn_simple_reset', () => { timeSimple = 0; pausedSimple = false; }],
                ['btn_compound_reset', () => { timeCompound = 0; pausedCompound = false; }]
            ];

            resetPairs.forEach(([id, fn]) => {
                const btn = document.getElementById(id);
                if (!btn) return;
                btn.addEventListener('click', fn);
            });
        }

        function drawBackground(ctx, w, h, accent) {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#fdfbf7');
            grad.addColorStop(1, '#f4efe7');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 24) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += 24) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.08;
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        function animate() {
            if (!pausedSpring) timeSpring += dt;
            if (!pausedTorsion) timeTorsion += dt;
            if (!pausedSimple) timeSimple += dt;
            if (!pausedCompound) timeCompound += dt;

            // Spring pendulum
            const sp = params.spring;
            const w0_sp = Math.sqrt(sp.k / sp.m);
            const T0_sp = 2 * Math.PI / w0_sp;
            const x0_sp = (sp.m * sp.g) / sp.k;
            const x_sp = sp.xmax * Math.cos(w0_sp * timeSpring);

            document.getElementById('springT0').innerText = T0_sp.toFixed(2);
            document.getElementById('springW0').innerText = w0_sp.toFixed(2);
            document.getElementById('springX').innerText = x_sp.toFixed(2);
            document.getElementById('springX0').innerText = x0_sp.toFixed(2);

            const wS = springCanvas.width, hS = springCanvas.height;
            drawBackground(springCtx, wS, hS, '#38bdf8');

            const fRadius = 60;
            const fCX = 90, fCY = hS / 2 + 10;
            const phase = w0_sp * timeSpring;
            const mX = fCX + fRadius * Math.cos(phase);
            const mY = fCY - fRadius * Math.sin(phase);
            const cXS = wS * 0.58;
            const topYS = 35;
            const eqYS = topYS + (Math.min(x0_sp, 0.35) * 200);
            const massYS = eqYS + (x_sp / sp.xmax) * (fRadius * 0.8);

            springCtx.save();
            springCtx.strokeStyle = '#cbd5e1';
            springCtx.lineWidth = 1.5;
            springCtx.beginPath();
            springCtx.arc(fCX, fCY, fRadius, 0, Math.PI * 2);
            springCtx.stroke();

            springCtx.setLineDash([2, 2]);
            springCtx.beginPath(); springCtx.moveTo(fCX - fRadius - 15, fCY); springCtx.lineTo(fCX + fRadius + 15, fCY); springCtx.stroke();
            springCtx.beginPath(); springCtx.moveTo(fCX, fCY - fRadius - 15); springCtx.lineTo(fCX, fCY + fRadius + 15); springCtx.stroke();
            springCtx.setLineDash([]);
            springCtx.strokeStyle = '#0284c7';
            springCtx.beginPath(); springCtx.moveTo(mX, mY); springCtx.lineTo(cXS, massYS); springCtx.stroke();
            springCtx.restore();

            drawArrow(springCtx, fCX, fCY, mX, mY, '#d97706', 'OM');

            springCtx.fillStyle = '#4a3f31';
            springCtx.fillRect(cXS - 52, topYS - 8, 104, 10);
            for (let i = -45; i < 45; i += 10) {
                springCtx.strokeStyle = '#2c241b';
                springCtx.beginPath();
                springCtx.moveTo(cXS + i, topYS - 8);
                springCtx.lineTo(cXS + i + 6, topYS - 16);
                springCtx.stroke();
            }

            const rX = cXS + 62;
            springCtx.strokeStyle = '#94a3b8';
            springCtx.fillStyle = '#64748b';
            springCtx.beginPath();
            springCtx.moveTo(rX, topYS);
            springCtx.lineTo(rX, hS - 24);
            springCtx.stroke();
            for (let y = topYS; y < hS - 24; y += 15) {
                springCtx.beginPath();
                springCtx.moveTo(rX, y);
                springCtx.lineTo(rX + 6, y);
                springCtx.stroke();
            }
            springCtx.fillText('+Xmax', rX + 10, eqYS - 40);
            springCtx.fillText('0', rX + 10, eqYS + 4);
            springCtx.fillText('-Xmax', rX + 10, eqYS + 52);

            springCtx.setLineDash([4, 4]);
            springCtx.strokeStyle = '#0284c7';
            springCtx.beginPath(); springCtx.moveTo(cXS - 55, eqYS); springCtx.lineTo(cXS + 55, eqYS); springCtx.stroke();
            springCtx.setLineDash([]);

            springCtx.lineWidth = 3;
            springCtx.strokeStyle = '#c084fc';
            springCtx.beginPath();
            const coils = 18;
            const springLen = massYS - topYS;
            springCtx.moveTo(cXS, topYS);
            for (let i = 0; i <= coils; i++) {
                const y = topYS + (springLen / coils) * i;
                const rx = cXS + (i === 0 || i === coils ? 0 : (i % 2 === 0 ? 12 : -12));
                springCtx.lineTo(rx, y);
            }
            springCtx.stroke();

            const bSize = 28 + sp.m * 3;
            const g = springCtx.createLinearGradient(cXS - bSize / 2, massYS - bSize / 2, cXS + bSize / 2, massYS + bSize / 2);
            g.addColorStop(0, '#0ea5e9');
            g.addColorStop(1, '#075985');
            springCtx.fillStyle = g;
            springCtx.fillRect(cXS - bSize / 2, massYS - bSize / 2, bSize, bSize);
            springCtx.strokeStyle = '#082f49';
            springCtx.strokeRect(cXS - bSize / 2, massYS - bSize / 2, bSize, bSize);

            drawArrow(springCtx, cXS, massYS, cXS, massYS + 40 * sp.m, '#b45309', 'w');
            drawArrow(springCtx, cXS, massYS, cXS, massYS - (38 * sp.m + Math.abs(x_sp) * 50), '#0284c7', 'Fs');
            if (Math.abs(x_sp) > 0.02) {
                drawArrow(springCtx, cXS + 26, massYS, cXS + 26, massYS - (x_sp / sp.xmax) * 45, '#eab308', 'F = -kx');
            }

            // Torsion pendulum
            const tr = params.torsion;
            const w0_tor = Math.sqrt(tr.k / tr.i);
            const T0_tor = 2 * Math.PI / w0_tor;
            const theta_tor = tr.thetamax * Math.cos(w0_tor * timeTorsion);

            document.getElementById('torsionT0').innerText = T0_tor.toFixed(2);
            document.getElementById('torsionW0').innerText = w0_tor.toFixed(2);
            document.getElementById('torsionTheta').innerText = theta_tor.toFixed(2);

            const wT = torsionCanvas.width, hT = torsionCanvas.height;
            drawBackground(torsionCtx, wT, hT, '#f59e0b');
            const cXT = wT / 2, cYT = hT / 2 + 12;
            torsionCtx.fillStyle = '#4a3f31';
            torsionCtx.fillRect(cXT - 80, 22, 160, 12);
            torsionCtx.fillRect(cXT - 72, 34, 8, hT - 52);
            torsionCtx.fillRect(cXT + 64, 34, 8, hT - 52);

            torsionCtx.strokeStyle = '#0284c7';
            torsionCtx.lineWidth = 2.5;
            torsionCtx.beginPath();
            torsionCtx.moveTo(cXT, 34);
            torsionCtx.lineTo(cXT, cYT);
            torsionCtx.stroke();

            torsionCtx.strokeStyle = '#f59e0b';
            torsionCtx.lineWidth = 1.5;
            torsionCtx.setLineDash([3, 3]);
            torsionCtx.beginPath();
            torsionCtx.arc(cXT, cYT, 110, Math.PI * 0.15, Math.PI * 0.85);
            torsionCtx.stroke();
            torsionCtx.setLineDash([]);

            const rLen = 110;
            const rx = Math.cos(theta_tor) * rLen;
            const ry = Math.sin(theta_tor) * 26;
            torsionCtx.lineWidth = 6;
            torsionCtx.strokeStyle = '#b45309';
            torsionCtx.beginPath();
            torsionCtx.moveTo(cXT - rx, cYT - ry);
            torsionCtx.lineTo(cXT + rx, cYT + ry);
            torsionCtx.stroke();

            torsionCtx.fillStyle = '#075985';
            torsionCtx.beginPath();
            torsionCtx.arc(cXT - rx, cYT - ry, 12, 0, Math.PI * 2);
            torsionCtx.arc(cXT + rx, cYT + ry, 12, 0, Math.PI * 2);
            torsionCtx.fill();

            torsionCtx.strokeStyle = '#0284c7';
            torsionCtx.lineWidth = 2.1;
            torsionCtx.beginPath();
            torsionCtx.arc(cXT, cYT, 46, 0, theta_tor, theta_tor < 0);
            torsionCtx.stroke();
            torsionCtx.fillStyle = '#075985';
            torsionCtx.font = 'bold 12px Cairo';
            torsionCtx.fillText('θ', cXT + 52, cYT - 10);
            drawArrow(torsionCtx, cXT, cYT, cXT - theta_tor * 60, cYT - 35, '#d97706', 'Γ = -kθ');

            // Simple pendulum
            const sm = params.simple;
            const w0_sim = Math.sqrt(sm.g / sm.l);
            const T0_sim = 2 * Math.PI / w0_sim;
            const theta_sim = sm.thetamax * Math.cos(w0_sim * timeSimple);

            document.getElementById('simpleT0').innerText = T0_sim.toFixed(2);
            document.getElementById('simpleW0').innerText = w0_sim.toFixed(2);
            document.getElementById('simpleTheta').innerText = theta_sim.toFixed(2);

            const wSim = simpleCanvas.width, hSim = simpleCanvas.height;
            drawBackground(simpleCtx, wSim, hSim, '#10b981');
            const pXSim = wSim / 2, pYSim = 30;
            const lPixSim = sm.l * 105;
            const bX = pXSim + lPixSim * Math.sin(theta_sim);
            const bY = pYSim + lPixSim * Math.cos(theta_sim);

            simpleCtx.fillStyle = '#4a3f31';
            simpleCtx.fillRect(pXSim - 40, pYSim - 8, 80, 8);
            simpleCtx.setLineDash([3, 3]);
            simpleCtx.strokeStyle = '#cbd5e1';
            simpleCtx.beginPath();
            simpleCtx.arc(pXSim, pYSim, lPixSim, Math.PI / 2 - 0.55, Math.PI / 2 + 0.55);
            simpleCtx.stroke();
            simpleCtx.setLineDash([]);
            simpleCtx.strokeStyle = '#94a3b8';
            simpleCtx.beginPath(); simpleCtx.moveTo(pXSim, pYSim); simpleCtx.lineTo(pXSim, pYSim + lPixSim + 30); simpleCtx.stroke();
            simpleCtx.strokeStyle = '#0284c7';
            simpleCtx.lineWidth = 2.2;
            simpleCtx.beginPath(); simpleCtx.moveTo(pXSim, pYSim); simpleCtx.lineTo(bX, bY); simpleCtx.stroke();

            const gradBall = simpleCtx.createRadialGradient(bX - 4, bY - 5, 3, bX, bY, 18);
            gradBall.addColorStop(0, '#fbbf24');
            gradBall.addColorStop(1, '#b45309');
            simpleCtx.fillStyle = gradBall;
            simpleCtx.beginPath(); simpleCtx.arc(bX, bY, 14, 0, Math.PI * 2); simpleCtx.fill();
            simpleCtx.strokeStyle = '#78350f'; simpleCtx.stroke();

            drawArrow(simpleCtx, bX, bY, bX, bY + 48, '#b45309', 'w');
            drawArrow(simpleCtx, bX, bY, bX - (bX - pXSim) * 0.45, bY - (bY - pYSim) * 0.45, '#0284c7', 'T');
            const wtX = bX - 35 * Math.cos(theta_sim);
            const wtY = bY + 35 * Math.sin(theta_sim);
            drawArrow(simpleCtx, bX, bY, wtX, wtY, '#d97706', 'wt = -w sinθ');

            // Compound pendulum
            const cp = params.compound;
            const w0_com = Math.sqrt((cp.m * cp.g * cp.d) / cp.i);
            const T0_com = 2 * Math.PI / w0_com;
            const theta_com = cp.thetamax * Math.cos(w0_com * timeCompound);

            document.getElementById('compoundT0').innerText = T0_com.toFixed(2);
            document.getElementById('compoundW0').innerText = w0_com.toFixed(2);
            document.getElementById('compoundTheta').innerText = theta_com.toFixed(2);

            const wC = compoundCanvas.width, hC = compoundCanvas.height;
            drawBackground(compoundCtx, wC, hC, '#8b5cf6');
            const pXC = wC / 2, pYC = 36;
            compoundCtx.setLineDash([3, 3]);
            compoundCtx.strokeStyle = '#94a3b8';
            compoundCtx.beginPath(); compoundCtx.moveTo(pXC, pYC); compoundCtx.lineTo(pXC, pYC + 210); compoundCtx.stroke();
            compoundCtx.setLineDash([]);

            compoundCtx.save();
            compoundCtx.translate(pXC, pYC);
            compoundCtx.rotate(theta_com);
            compoundCtx.fillStyle = '#fef3c7';
            compoundCtx.strokeStyle = '#b45309';
            compoundCtx.lineWidth = 3;
            compoundCtx.fillRect(-14, -12, 28, 210);
            compoundCtx.strokeRect(-14, -12, 28, 210);

            compoundCtx.fillStyle = '#0284c7';
            compoundCtx.beginPath(); compoundCtx.arc(0, 0, 6, 0, Math.PI * 2); compoundCtx.fill();
            compoundCtx.font = 'bold 12px Cairo';
            compoundCtx.fillText('O (Δ)', -24, 5);

            const dPx = cp.d * 240;
            compoundCtx.fillStyle = '#b45309';
            compoundCtx.beginPath(); compoundCtx.arc(0, dPx, 8, 0, Math.PI * 2); compoundCtx.fill();
            compoundCtx.fillText('C (مركز العطالة)', 12, dPx + 4);
            drawArrow(compoundCtx, 0, 0, 0, dPx, '#d97706', `d = ${cp.d}m`);
            drawArrow(compoundCtx, 0, dPx, 0, dPx + 44, '#b45309', 'W');
            drawArrow(compoundCtx, 0, 0, 0, -35, '#0284c7', 'R');
            compoundCtx.restore();

            requestAnimationFrame(animate);
        }

        refreshParams();
        bindControls();
        syncAllCanvasSizes();
        window.addEventListener('resize', syncAllCanvasSizes);
        requestAnimationFrame(animate);
    
