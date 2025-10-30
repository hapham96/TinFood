import { STORAGE_KEYS } from "../utils/constants";
import { StorageService } from "./storage.service";
import { apiService } from "./baseApi/api.service";
import { useLogger } from "../services/logger/useLogger";

// type of money bill
export const MoneyBillType = {
  NORMAL: 1,
  FOOD: 2,
};
export class MoneyBill {
  id: number; // createAt timestamp
  participants?: string[]; // if type is FOOD, this is optional
  type: keyof typeof MoneyBillType | any;
  expenses: {
    name: string; // item or service name
    amount: number; // item price (original price before discount), service
    paidBy?: string; // if type is FOOD, optional - if entered, it's that person's item
    quantity?: number; // item quantity (default 1), if type is Normal, optional
    createdAt?: string;
    subBillId?: number; // ID of the saved sub-bill (if there is a sub-bill)
  }[];
  discountAmount?: number; // coupon discount amount applied to the total bill
  shipAmount?: number; // shipping fee
  name?: string; // name of bill
  address?: string; // address
  date?: string; // date/time
  actualTotal?: number; // actual amount paid
  isSubBill?: boolean; // marks this (Food) bill as a child of a NORMAL bill

  private storage: StorageService;

  constructor(init?: Partial<MoneyBill>) {
    Object.assign(this, init);
    this.id = init?.id ?? Date.now();
    this.expenses = init?.expenses ?? [];
    this.type = init?.type ?? MoneyBillType.NORMAL;
    this.storage = new StorageService();
  }

  // Total amount before discount
  get totalAmount() {
    return this.expenses.reduce((sum, e) => {
      const qty = Number(e.quantity || 1);
      const amt = Number(e.amount || 0);
      return sum + amt * qty;
    }, 0);
  }

  //  Average amount evenly split (if participants exist)
  get averageAmount() {
    if (!this.participants || this.participants.length === 0) return 0;
    return Math.round(this.totalAmount / this.participants.length);
  }

  //  Calculate total after applying discount & shipping
  get totalAfterDiscount() {
    const ship = Number(this.shipAmount || 0);
    const discount = Number(this.discountAmount || 0);
    return Math.max(0, this.totalAmount + ship - discount);
  }

  // total amount including shipping + items (original price)
  get totalAmountAll() {
    const ship = Number(this.shipAmount || 0);
    return this.totalAmount + ship;
  }

  //  Calculate discount ratio on the total
  get discountRatio() {
    return this.totalAmount > 0
      ? this.totalAfterDiscount / this.totalAmount
      : 1;
  }

  // (Old)Calculate result for each person
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
      // FOOD mode: calculate each item, multiply by quantity, apply discount ratio
      this.expenses.forEach((e) => {
        const qty = Number(e.quantity || 1);
        const finalAmount = Math.round(e.amount * qty * this.discountRatio);
        result[e.name] = finalAmount / (e.quantity || 1); // key = item name
      });
    }

    return result;
  }

  // (NEW) Calculate average actual price per item (1 qty) based on realPaymentAmount
  calculateBalancesByRealPayment(): Record<string, number> {
    const result: Record<string, number> = {};
    if (!this.expenses?.length) throw new Error("No expenses");
    if (!this.actualTotal || this.actualTotal <= 0) {
      return this.calculateBalances();
    }
    // Total original price (multiplied by quantity)
    const totalOriginal = this.expenses.reduce((sum, e) => {
      const qty = Number(e.quantity || 1);
      const amt = Number(e.amount || 0);
      return sum + amt * qty;
    }, 0);

    if (totalOriginal === 0) throw new Error("Total original amount is 0");

    // Reallocate based on ratio, but divide per qty
    this.expenses.forEach((e) => {
      const qty = Number(e.quantity || 1);
      const amt = Number(e.amount || 0);
      const ratio = (amt * qty) / totalOriginal;

      // Actual total for that item
      const totalReal = (this.actualTotal! as number) * ratio;

      // Average price per unit
      const pricePerQty = Math.round(totalReal / qty);

      result[e.name] = pricePerQty;
    });

    return result;
  }

  /**
   * Create a new money bill and save it silently.
   * @param init Partial<MoneyBill> data to initialize the bill.
   * @returns the newly created bill (with ID).
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

  /**
   * Save OR Update bill
   * @param bill<MoneyBill> data of the bill.
   * @param showAlert whether to show alert when success.
   */
  async saveMoneyBill(bill: MoneyBill, showAlert = true): Promise<void> {
    try {
      let savedList = await this.getMoneyBills(); // <-- Get ALL bills
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
        showAlert && alert("✅ Record updated successfully!");
      } else {
        savedList.push(record);
        showAlert && alert("💾 Create new bill successfully!");
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

  /**
   * Get all saved bills
   * @param includeSubBills includeSubBills = false to get main bills only for display
   * @returns list of MoneyBill
   */
  async getMoneyBills(includeSubBills = true): Promise<MoneyBill[]> {
    let savedList = (await this.storage.get(STORAGE_KEYS.MONEY_BILLS)) as any;
    savedList = JSON.parse(savedList);

    const bills = Array.isArray(savedList)
      ? savedList.map((b) => new MoneyBill(b))
      : [];
    console.log("Retrieved all bills from storage:", bills);

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

  /**
   * delete bill and sub-bill related to it
   * @param id
   */
  async deleteMoneyBill(id: number) {
    try {
      let allBills = await this.getMoneyBills();
      const idString = id.toString();
      const billToDelete = allBills.find((b) => b.id.toString() === idString);
      const allIdsToDelete = new Set<string>(); // add new list bill need to delete
      allIdsToDelete.add(idString); // ID of parent bill

      if (billToDelete && billToDelete.expenses?.length > 0) {
        billToDelete.expenses.forEach((expense) => {
          if (!!expense.subBillId) {
            // if expense has subBillId, add to delete list
            allIdsToDelete.add(expense.subBillId.toString());
          }
        });
      }
      const newList = allBills.filter(
        (b) => !allIdsToDelete.has(b.id.toString())
      );
      await this.storage.set(STORAGE_KEYS.MONEY_BILLS, JSON.stringify(newList));

      return true;
    } catch (error) {
      console.error("❌ Failed to delete bill and its children:", error);
      return false;
    }
  }

  // decode bill from img
  async decodeBillInfo(base64String: string): Promise<string[]> {
    return apiService.post("/bill", { Base64Url: base64String });
  }

  /**
   * Save sub-bill in silent
   * @param subBillData Partial<MoneyBill> data of the sub-bill.
   * @returns the newly created sub-bill (with ID).
   */
  async saveSubBill(subBillData: Partial<MoneyBill>): Promise<MoneyBill> {
    try {
      let savedList = await this.getMoneyBills();
      if (!Array.isArray(savedList)) {
        savedList = [];
      }

      const subBill = new MoneyBill({
        ...subBillData,
        id: Date.now(),
        isSubBill: true, // MARK as sub-bill
        date: new Date().toLocaleString(),
      });

      savedList.push(subBill);
      await this.storage.set(
        STORAGE_KEYS.MONEY_BILLS,
        JSON.stringify(savedList)
      );

      return subBill;
    } catch (error) {
      console.error("❌ Failed to save sub-bill:", error);
      throw new Error("Failed to save sub-bill.");
    }
  }
}