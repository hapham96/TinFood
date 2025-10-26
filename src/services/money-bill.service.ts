import { STORAGE_KEYS } from "../utils/constants";
import { StorageService } from "./storage.service";
import { apiService } from "./baseApi/api.service";

// type of money bill
export const MoneyBillType = {
  NORMAL: 1,
  FOOD: 2,
};
export class MoneyBill {
  id: number; // createAt timestamp
  participants?: string[]; // nếu type là FOOD thì ko bắt buộc nhập
  type: keyof typeof MoneyBillType | any;
  expenses: {
    name: string; // tên món ăn, dịch vụ
    amount: number; // tiền món ăn (giá gốc chưa giảm), dịch vụ
    paidBy?: string; // nếu type là FOOD thì ko bắt buộc nhập - nếu nhập là món ăn của ng đó
    quantity?: number; // số lượng món ăn (mặc định 1) nếu type là Normal ko bắt buộc nhập -
    createdAt?: string;
    subBillId?: number; // ID của bill con đã lưu (nếu có là có bill con)
  }[];
  discountAmount?: number; // tiền coupon giảm giá được áp dụng cho tổng hóa đơn
  shipAmount?: number; // tiền ship
  name?: string; // name of bill
  address?: string; // địa chỉ
  date?: string; // ngày giờ
  actualTotal?: number; // số tiền thực tế đã thanh toán
  isSubBill?: boolean; // đánh dấu bill (Food) này là con của hóa đơn NORMAL

  private storage: StorageService;

  constructor(init?: Partial<MoneyBill>) {
    Object.assign(this, init);
    this.id = init?.id ?? Date.now();
    this.expenses = init?.expenses ?? [];
    this.type = init?.type ?? MoneyBillType.NORMAL;
    this.storage = new StorageService();
  }

  // Tổng tiền trước giảm
  get totalAmount() {
    return this.expenses.reduce((sum, e) => {
      const qty = Number(e.quantity || 1);
      const amt = Number(e.amount || 0);
      return sum + amt * qty;
    }, 0);
  }

  //  Trung bình chia đều (nếu có participants)
  get averageAmount() {
    if (!this.participants || this.participants.length === 0) return 0;
    return Math.round(this.totalAmount / this.participants.length);
  }

  //  Tính tổng sau khi áp dụng giảm giá & ship
  get totalAfterDiscount() {
    const ship = Number(this.shipAmount || 0);
    const discount = Number(this.discountAmount || 0);
    return Math.max(0, this.totalAmount + ship - discount);
  }

  // tổng tiền cả ship + tiền món ăn (giá gốc chưa giảm)
  get totalAmountAll() {
    const ship = Number(this.shipAmount || 0);
    return this.totalAmount + ship;
  }

  //  Tính tỉ lệ giảm trên tổng
  get discountRatio() {
    return this.totalAmount > 0
      ? this.totalAfterDiscount / this.totalAmount
      : 1;
  }

  // 💡 Tính kết quả từng người
  calculateBalances() {
    const result: Record<string, number> = {};

    if (this.type === MoneyBillType.NORMAL) {
      if (!this.participants?.length) throw new Error("No participants");
      if (!this.expenses?.length) throw new Error("No expenses");

      const payments: Record<string, number> = {};
      this.participants.forEach((p) => (payments[p] = 0));

      this.expenses.forEach((e) => {
        const qty = Number(e.quantity || 1);
        const total = e.amount * qty;
        if (e.paidBy) payments[e.paidBy] += total;
      });

      this.participants.forEach((p) => {
        result[p] = Math.round(payments[p] - this.averageAmount);
      });
    } else if (this.type === MoneyBillType.FOOD) {
      if (!this.expenses?.length) throw new Error("No expenses");
      // FOOD mode: tính từng món, nhân quantity, áp dụng discount ratio
      this.expenses.forEach((e) => {
        const qty = Number(e.quantity || 1);
        const finalAmount = Math.round(e.amount * qty * this.discountRatio);
        result[e.name] = finalAmount / (e.quantity || 1); // key = tên món ăn
      });
    }

    return result;
  }

  // 💰 Tính giá thực tế trung bình cho mỗi món (1 qty) dựa vào realPaymentAmount
  calculateBalancesByRealPayment(): Record<string, number> {
    const result: Record<string, number> = {};
    if (!this.expenses?.length) throw new Error("No expenses");
    if (!this.actualTotal || this.actualTotal <= 0) {
      return this.calculateBalances();
    }
    // Tổng giá gốc (đã nhân quantity)
    const totalOriginal = this.expenses.reduce((sum, e) => {
      const qty = Number(e.quantity || 1);
      const amt = Number(e.amount || 0);
      return sum + amt * qty;
    }, 0);

    if (totalOriginal === 0) throw new Error("Total original amount is 0");

    // Phân bổ lại theo tỷ lệ, nhưng chia lại cho từng qty
    this.expenses.forEach((e) => {
      const qty = Number(e.quantity || 1);
      const amt = Number(e.amount || 0);
      const ratio = (amt * qty) / totalOriginal;

      // Tổng thực tế món đó
      const totalReal = (this.actualTotal! as number) * ratio;

      // 💡 Giá trung bình 1 phần
      const pricePerQty = Math.round(totalReal / qty);

      result[e.name] = pricePerQty;
    });

    return result;
  }

  /**
   * Create a new money bill and save it silently.
   * Returns the newly created bill (with ID).
   */
  async createMoneyBill(init: Partial<MoneyBill>): Promise<MoneyBill> {
    try {
      let savedList = await this.getMoneyBills(true);
      if (!Array.isArray(savedList)) {
        savedList = [];
      }
      const newBill = new MoneyBill({
        ...init,
        id: init?.id || Date.now(),
        date: new Date().toLocaleString(),
      });

      savedList.push(newBill);
      await this.storage.set(
        STORAGE_KEYS.MONEY_BILLS,
        JSON.stringify(savedList)
      );

      return newBill;
    } catch (error) {
      console.error("❌ Failed to create bill:", error);
      throw error;
    }
  }

  // save
  async saveMoneyBill(
    bill: MoneyBill,
    balances?: Record<string, number>
  ): Promise<void> {
    try {
      let savedList = await this.getMoneyBills(true); // <-- Lấy TẤT CẢ bill
      if (!Array.isArray(savedList)) {
        savedList = [];
      }
      const record = new MoneyBill({
        ...bill,
        id: bill.id || Date.now(),
      });
      console.log("Loaded savedList:", savedList);
      record.date = new Date().toLocaleString();
      // if record with same id exists, update it
      const existingIndex = savedList.findIndex((x) => x.id === record.id);
      if (existingIndex >= 0) {
        savedList[existingIndex] = record;
        alert("✅ Record updated successfully!");
      } else {
        savedList.push(record);
        alert("💾 Create new bill successfully!");
      }
      await this.storage.set(
        STORAGE_KEYS.MONEY_BILLS,
        JSON.stringify(savedList)
      );
    } catch (error) {
      console.error("❌ Failed to save bill:", error);
      alert("Failed to save record!");
    }
  }

  // Get all saved bills
  async getMoneyBills(includeSubBills = false): Promise<MoneyBill[]> {
    let savedList = (await this.storage.get(STORAGE_KEYS.MONEY_BILLS)) as any;
    savedList = JSON.parse(savedList);

    const bills = Array.isArray(savedList)
      ? savedList.map((b) => new MoneyBill(b))
      : [];

    if (includeSubBills) {
      return bills; // return all bills including sub-bills
    }

    return bills.filter((b) => !b.isSubBill); // return main bill only
  }

  // Get 1 bill by id
  async getMoneyBill(id: number): Promise<MoneyBill | null> {
    console.log("Getting bill with id:", id);
    let bills = await this.getMoneyBills();
    console.log("Getting bills:", bills);
    const found = bills.find((b) => b.id.toString() === id.toString());
    console.log("found bills:", found);
    return found ? new MoneyBill(found) : null;
  }

  async deleteMoneyBill(id: number) {
    try {
      let savedList = await this.getMoneyBills();
      savedList = savedList.filter((b) => b.id.toString() !== id.toString());
      await this.storage.set(
        STORAGE_KEYS.MONEY_BILLS,
        JSON.stringify(savedList)
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to delete bill:", error);
      return false;
    }
  }

  // decode bill from img
  async decodeBillInfo(base64String: string): Promise<string[]> {
    return apiService.post("/bill", { Base64Url: base64String }, false, {
      headers: { "Content-Type": "application/json" },
    });
  }
  //  để lưu bill con một cách thầm lặng
  async saveSubBill(subBillData: Partial<MoneyBill>): Promise<MoneyBill> {
    try {
      // Lấy TẤT CẢ các bill đã lưu, bao gồm cả bill con
      let savedList = await this.getMoneyBills(true);
      if (!Array.isArray(savedList)) {
        savedList = [];
      }

      const subBill = new MoneyBill({
        ...subBillData,
        id: Date.now(),
        isSubBill: true, // <-- Đánh dấu là bill con (bị ẩn)
        date: new Date().toLocaleString(),
      });

      savedList.push(subBill);
      await this.storage.set(
        STORAGE_KEYS.MONEY_BILLS,
        JSON.stringify(savedList)
      );

      return subBill; // Trả về bill con đã được lưu (với ID)
    } catch (error) {
      console.error("❌ Failed to save sub-bill:", error);
      throw new Error("Failed to save sub-bill.");
    }
  }
}
