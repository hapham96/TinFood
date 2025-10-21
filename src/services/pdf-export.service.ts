
import { FileOpener } from "@capacitor-community/file-opener";
import { Browser } from "@capacitor/browser";
import { Filesystem, Directory } from "@capacitor/filesystem";
import type { MoneyBill } from "../services/money-bill.service";
import pdfMake from "pdfmake/build/pdfmake.js";
import * as pdfFonts from "pdfmake/build/vfs_fonts.js";
import { isNativePlatform } from "../utils/helpers";
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

/**
 * Export PDF and save on device (Capacitor)
 */
export async function exportToPDF(bill: MoneyBill, balances: Record<string, number>) {
    const now = new Date().toLocaleString();
    const isFood = bill.type === 2;
    const title = bill.name || "Untitled Bill";

    const content: any[] = []; // content PDF

    if (isFood) {
        content.push(
            { text: "TinFood", style: "logo" },
            { text: `Báo cáo chi phí: ${title}`, style: "header" },
            { text: `Thời gian tạo: ${now}`, style: "subheader" },
            {
                columns: [
                    { text: `Tổng ban đầu: ${bill.totalAmount.toLocaleString()} ₫` },
                    { text: `Giảm giá: ${bill.discountAmount?.toLocaleString() || 0} ₫`, alignment: "right" },
                ],
            },
            {
                columns: [
                    { text: `Phí ship: ${bill.shipAmount?.toLocaleString() || 0} ₫` },
                    { text: `Tổng sau giảm: ${bill.totalAfterDiscount.toLocaleString()} ₫`, alignment: "right" },
                ],
                margin: [0, 0, 0, 10],
            },
            { text: "Chi tiết món ăn", style: "sectionHeader" },
            {
                table: {
                    widths: ["*", "auto", "auto", "auto"],
                    body: [
                        ["Tên món", "Đơn giá", "Số lượng", "Thành tiền"],
                        ...bill.expenses.map((e) => {
                            const qty = e.quantity || 1;
                            const total = Number(e.amount || 0) * qty;
                            return [
                                e.name || "-",
                                e.amount ? `${Number(e.amount).toLocaleString()} ₫` : "-",
                                qty.toString(),
                                `${total.toLocaleString()} ₫`,
                            ];
                        }),
                    ],
                },
                layout: "lightHorizontalLines",
                margin: [0, 5, 0, 10],
            },

            { text: "Giá trung bình (1 phần) sau giảm giá", style: "sectionHeader" },
            {
                table: {
                    widths: ["*", "auto"],
                    body: [
                        ["Tên món", "Giá mỗi phần"],
                        ...Object.entries(balances).map(([name, amount]) => [
                            name,
                            `${Number(amount).toLocaleString()} ₫`,
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
            }
        );
    } else {
        content.push(
            { text: "TinFood", style: "logo" },
            { text: `Báo cáo chi phí: ${title}`, style: "header" },
            { text: `Thời gian tạo: ${now}`, style: "subheader" },
            { text: `Tổng chi phí: ${bill.totalAfterDiscount.toLocaleString()} ₫`, margin: [0, 0, 0, 10] },
            { text: "Chi tiết chi phí", style: "sectionHeader" },
            {
                table: {
                    widths: ["*", "auto", "auto", "auto"],
                    body: [
                        ["Mô tả", "Thời gian", "Số tiền", "Người trả"],
                        ...bill.expenses.map((e) => [
                            e.name || "-",
                            e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-",
                            `${Number(e.amount).toLocaleString()} ₫`,
                            e.paidBy || "-",
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
                margin: [0, 5, 0, 10],
            },
            { text: "Số dư từng người", style: "sectionHeader" },
            {
                table: {
                    widths: ["*", "auto"],
                    body: [
                        ["Tên", "Số dư"],
                        ...Object.entries(balances).map(([p, b]) => [
                            p,
                            b > 0
                                ? `+${b.toLocaleString()} ₫ (Nhận)`
                                : b < 0
                                    ? `-${Math.abs(b).toLocaleString()} ₫ (Trả)`
                                    : "0 ₫",
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
            }
        );
    }

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60],
        content,
        footer: (currentPage: number, pageCount: number) => ({
            columns: [
                { text: "Generated by TinFood", alignment: "left", color: "#999", fontSize: 8 },
                { text: `Page ${currentPage} of ${pageCount}`, alignment: "right", color: "#999", fontSize: 8 },
            ],
            margin: [40, 10],
        }),
        defaultStyle: { fontSize: 11, lineHeight: 1.3 },
        styles: {
            logo: { fontSize: 20, bold: true, color: "#2E86C1", margin: [0, 0, 0, 10] },
            header: { fontSize: 16, bold: true, color: "#333", margin: [0, 0, 0, 8] },
            subheader: { fontSize: 10, italics: true, color: "#777", margin: [0, 0, 0, 8] },
            sectionHeader: { fontSize: 13, bold: true, color: "#444", margin: [0, 10, 0, 5] },
        },
    };

    const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);

    // download file directly if web platform
    if (!isNativePlatform()) {
        pdfDocGenerator.download(`${title || "TinFoodBill"}.pdf`);
        return;
    }
    /**
     * Sửa Base64 cho hợp lệ trước khi ghi file
     */
    function fixBase64Padding(base64: string): string {
        base64 = base64.replace(/(\r\n|\n|\r)/gm, ""); // xóa xuống dòng
        const pad = base64.length % 4;
        if (pad) base64 += "=".repeat(4 - pad);
        return base64;
    }
    // save file on device if native platform (Capacitor)
    pdfDocGenerator.getBase64(async (rawBase64: string) => {
        try {
            const base64Data = fixBase64Padding(rawBase64);
            const fileName = `${title.replace(/\s+/g, "_") || "TinFoodBill"}.pdf`;

            const result = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
            });

            console.log("✅ File saved:", result.uri);
            alert(`✅ File PDF saved successfully ${fileName}`);

            try {
                await FileOpener.open({
                    filePath: result.uri,
                    contentType: "application/pdf",
                });
            } catch (openErr) {
                console.warn("⚠️ Fallback Browser:", openErr);
                await Browser.open({ url: result.uri });
            }
        } catch (err) {
            console.error("❌ Fail when saved PDF:", err);
            alert("Unable to save or open the PDF file. Please check file access permissions.");
        }
    });

}