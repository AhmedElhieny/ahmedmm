
"use strict";

// ========================================
// بيانات السيارات
// ========================================

const rows = [
    { car: "3147", load: "250", store: "سمالوط" },
    { car: "3512", load: "200", store: "شوشة" },
    { car: "4826", load: "200", store: "شوشة" },
    { car: "6945", load: "200", store: "شوشة" },
    { car: "6237", load: "200", store: "سمالوط" },
    { car: "9834", load: "200", store: "حلوة" },
    { car: "7169", load: "200", store: "صفط" },
    { car: "5341", load: "100", store: "سمالوط" },
    { car: "8693", load: "100", store: "أبوان" },
    { car: "7624", load: "100", store: "أبوان" },
    { car: "6948", load: "100", store: "أبوان" },
    { car: "1938", load: "100", store: "صفط" },
    { car: "8247", load: "100", store: "صفط" },
    { car: "7463", load: "100", store: "شارونة" }
];

const tbody = document.getElementById("reportRows");

// ========================================
// الأرقام العربية
// ========================================

function arNum(n) {
    return String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

// ========================================
// الخانات القابلة للتحرير
// ========================================

function editableCell(label) {
    const td = document.createElement("td");

    td.className = "edit-cell editable";
    td.contentEditable = "true";
    td.spellcheck = false;
    td.setAttribute("aria-label", label);
    td.setAttribute("role", "textbox");

    return td;
}

// ========================================
// إنشاء صفوف الجدول
// ========================================

if (tbody) {
    rows.forEach((r, i) => {
        const tr = document.createElement("tr");

        const num = document.createElement("td");
        num.className = "num-cell";
        num.textContent = arNum(i + 1);
        tr.append(num);

        const car = document.createElement("td");
        car.className = "static-cell";
        car.textContent = r.car;
        tr.append(car);

        tr.append(editableCell(`السائق الصف ${i + 1}`));

        const load = document.createElement("td");
        load.className = "static-cell";
        load.textContent = r.load;
        tr.append(load);

        const store = document.createElement("td");
        store.className = "static-cell";
        store.textContent = r.store;
        tr.append(store);

        tr.append(
            editableCell(`التشغيل الصف ${i + 1}`),
            editableCell(`ملاحظات الصف ${i + 1}`)
        );

        tbody.append(tr);
    });
}

// ========================================
// رسائل التنبيه
// ========================================

function toast(msg) {
    const t = document.getElementById("toast");

    if (!t) {
        alert(msg);
        return;
    }

    t.textContent = msg;
    t.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        t.classList.remove("show");
    }, 4000);
}

// ========================================
// تقسيم النص على عدة أسطر
// ========================================

function wrap(ctx, text, maxWidth) {
    const words = String(text || "—").split(/\s+/);
    const lines = [];
    let line = "";

    for (const word of words) {
        const test = line ? `${line} ${word}` : word;

        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }

    if (line) lines.push(line);

    return lines;
}

// ========================================
// تحويل Canvas إلى PNG
// ========================================

function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(
                        new Error(
                            "فشل إنشاء صورة PNG. حاول تقليل حجم الصورة أو إعادة تحميل الصفحة."
                        )
                    );
                }
            }, "image/png");
        } catch (error) {
            reject(
                new Error(
                    "فشل تصدير الصورة: " + error.message
                )
            );
        }
    });
}

// ========================================
// إنشاء صورة التقرير بدون لوجوهات
// ========================================

async function makeImage() {
    if (!tbody) {
        throw new Error("لم يتم العثور على جدول السيارات.");
    }

    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    const W = 1800;
    const pad = 65;
    const titleH = 235;
    const headH = 70;
    const rowH = 68;
    const signH = 145;
    const bottomH = 35;
    const scale = 2;

    const H =
        pad * 2 +
        titleH +
        headH +
        rows.length * rowH +
        signH +
        bottomH;

    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("تعذر إنشاء مساحة الرسم.");
    }

    ctx.scale(scale, scale);

    // خلفية التقرير
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // اسم الشركة والإدارة - بدون لوجوهات
    ctx.fillStyle = "#123b63";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.font = "900 29px Cairo, Tahoma, Arial";

    ctx.fillText(
        'الشركة المصرية لنقل وتوصيل الغاز "بوتاجاسكو"',
        W / 2,
        pad + 38,
        W - 200
    );

    ctx.font = "800 25px Cairo, Tahoma, Arial";

    ctx.fillText(
        "الإدارة العامة المساعدة للعمليات بالمنيا",
        W / 2,
        pad + 82,
        W - 200
    );

    // عنوان التقرير
    ctx.fillStyle = "#111827";
    ctx.textAlign = "right";
    ctx.font = "900 34px Cairo, Tahoma, Arial";

    ctx.fillText(
        "بيان تشغيل سيارات شمال المنيا عن يوم",
        W - pad,
        pad + 165
    );

    // التاريخ
    ctx.font = "800 25px Cairo, Tahoma, Arial";

    ctx.fillText(
        "الموافق",
        W - pad - 980,
        pad + 210
    );

    const dateElement = document.getElementById("reportDate");
    const date = dateElement?.innerText.trim() || "—";

    ctx.textAlign = "center";

    ctx.fillText(
        date,
        W - pad - 835,
        pad + 210
    );

    // ========================================
    // إعداد الجدول
    // ========================================

    const tableY = pad + titleH;
    const tableW = W - pad * 2;

    const widths = [90, 252, 378, 234, 270, 270, 306];
    const totalWidth = widths.reduce((a, b) => a + b, 0);

    const colWidths = widths.map(w => w * tableW / totalWidth);

    const headers = [
        "م",
        "السيارة",
        "السائق",
        "الحمولة",
        "المخزن",
        "التشغيل",
        "ملاحظات"
    ];

    let right = W - pad;

    ctx.lineWidth = 2.3;

    headers.forEach((header, i) => {
        right -= colWidths[i];

        ctx.fillStyle = "#edf2f6";
        ctx.fillRect(right, tableY, colWidths[i], headH);

        ctx.strokeStyle = "#34485b";
        ctx.strokeRect(right, tableY, colWidths[i], headH);

        ctx.fillStyle = "#142b40";
        ctx.font = "900 24px Cairo, Tahoma, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            header,
            right + colWidths[i] / 2,
            tableY + headH / 2
        );
    });

    // ========================================
    // بيانات السيارات
    // ========================================

    rows.forEach((r, i) => {
        const tr = tbody.rows[i];

        const values = [
            arNum(i + 1),
            r.car,
            tr?.cells[2]?.innerText.trim() || "—",
            r.load,
            r.store,
            tr?.cells[5]?.innerText.trim() || "—",
            tr?.cells[6]?.innerText.trim() || "—"
        ];

        const y = tableY + headH + i * rowH;
        let xRight = W - pad;

        values.forEach((value, j) => {
            const colW = colWidths[j];
            xRight -= colW;

            if ([2, 5, 6].includes(j)) {
                ctx.fillStyle = "#f0f7ff";
            } else if (j === 0) {
                ctx.fillStyle = "#f8fafc";
            } else {
                ctx.fillStyle = "#ffffff";
            }

            ctx.fillRect(xRight, y, colW, rowH);

            ctx.strokeStyle = "#34485b";
            ctx.strokeRect(xRight, y, colW, rowH);

            ctx.fillStyle = "#111827";
            ctx.font =
                `${[0, 1, 3, 4].includes(j) ? 700 : 600} 22px Cairo, Tahoma, Arial`;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const lines = wrap(ctx, value, colW - 15).slice(0, 2);
            const lineHeight = 27;

            const startY =
                y + rowH / 2 -
                ((lines.length - 1) * lineHeight) / 2;

            lines.forEach((line, k) => {
                ctx.fillText(
                    line,
                    xRight + colW / 2,
                    startY + k * lineHeight,
                    colW - 12
                );
            });
        });
    });


   // التوقيعات
const signY = tableY + headH + rows.length * rowH + 42;

ctx.fillStyle = "#111827";
ctx.textBaseline = "top";

// مدير عام مساعد - على الشمال
ctx.textAlign = "left";
ctx.font = "900 25px Cairo, Tahoma, Arial";

ctx.fillText(
    "مدير عام مساعد",
    pad + 80,
    signY
);

ctx.font = "700 22px Cairo, Tahoma, Arial";

ctx.fillText(
    "أ / إيهاب شعبان محمد",
    pad + 80,
    signY + 40
);

// مدير الإدارة - على اليمين
ctx.textAlign = "right";
ctx.font = "900 25px Cairo, Tahoma, Arial";

ctx.fillText(
    "مدير إدارة",
    W - pad - 80,
    signY
);

ctx.font = "700 22px Cairo, Tahoma, Arial";

ctx.fillText(
    "أ / أحمد مصطفى محمد الحيني",
    W - pad - 80,
    signY + 40
);
    // ========================================
    // الشريط السفلي
    // ========================================

    ctx.strokeStyle = "#dbe2e8";
    ctx.beginPath();
    ctx.moveTo(pad, H - pad + 1);
    ctx.lineTo(W - pad, H - pad + 1);
    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.font = "500 16px Cairo, Tahoma, Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";

    ctx.fillText(
        "شمال المنيا",
        W - pad,
        H - pad + 14
    );

    ctx.textAlign = "left";

    ctx.fillText(
        "بيان تشغيل السيارات",
        pad,
        H - pad + 14
    );

    return await canvasToBlob(canvas);
}

// ========================================
// تنزيل صورة التقرير
// ========================================

function download(blob) {
    if (!blob) {
        throw new Error("لا توجد صورة جاهزة للتنزيل.");
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "بيان-تشغيل-السيارات.png";

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ========================================
// زر التنزيل
// ========================================

const downloadBtn = document.getElementById("downloadBtn");

if (downloadBtn) {
    downloadBtn.onclick = async () => {
        downloadBtn.disabled = true;

        try {
            const blob = await makeImage();

            download(blob);

            toast("تم تنزيل صورة التقرير بنجاح.");
        } catch (error) {
            console.error("خطأ أثناء إنشاء صورة التقرير:", error);
            toast("تعذر إنشاء الصورة: " + error.message);
        } finally {
            downloadBtn.disabled = false;
        }
    };
}

// ========================================
// زر مشاركة التقرير
// ========================================

const shareBtn = document.getElementById("shareBtn");

if (shareBtn) {
    shareBtn.onclick = async () => {
        shareBtn.disabled = true;

        try {
            const blob = await makeImage();

            const file = new File(
                [blob],
                "بيان-تشغيل-السيارات.png",
                { type: "image/png" }
            );

            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {
                await navigator.share({
                    files: [file],
                    title: "بيان تشغيل سيارات شمال المنيا"
                });
            } else {
                download(blob);

                window.open(
                    "https://wa.me/?text=" +
                    encodeURIComponent("بيان تشغيل سيارات شمال المنيا"),
                    "_blank",
                    "noopener"
                );

                toast("تم تنزيل الصورة. أرفقها في واتساب.");
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("خطأ أثناء المشاركة:", error);
                toast("تعذرت المشاركة: " + error.message);
            }
        } finally {
            shareBtn.disabled = false;
        }
    };
}

// ========================================
// زر مسح الكتابة اليدوية
// ========================================

const resetBtn = document.getElementById("resetBtn");

if (resetBtn) {
    resetBtn.onclick = () => {
        if (!confirm("هل تريد مسح كل الكتابة اليدوية والتاريخ؟")) {
            return;
        }

        document.querySelectorAll(".edit-cell").forEach(cell => {
            cell.innerText = "";
        });

        const reportDate = document.getElementById("reportDate");

        if (reportDate) {
            reportDate.innerText = "";
        }

        toast("تم مسح الكتابة اليدوية والتاريخ.");
    };
}

// ========================================
// منع لصق التنسيقات داخل الخانات
// ========================================

document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.addEventListener("paste", event => {
        event.preventDefault();

        const clipboard = event.clipboardData || window.clipboardData;
        const text = clipboard ? clipboard.getData("text/plain") : "";

        if (document.queryCommandSupported?.("insertText")) {
            document.execCommand("insertText", false, text);
        } else {
            el.textContent += text;
        }
    });
});
