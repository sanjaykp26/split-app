import { Injectable } from '@angular/core';
import { users, expense } from './expense';
import { throwError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class DataService {
  public expensesList: any[] = [];
  public newExpense!: expense;
  private users: users = {};

  constructor() {}

  saveExpense(description: any, amount: any, paidBy: any, persons: string[]) {
    this.setExpensesList(description, amount, paidBy, persons);
    const share = Number((parseInt(amount) / (persons.length + 1)).toFixed(2));
    persons.forEach((person) => {
      this.splitExpenses(paidBy, share, person);
    });

    return of('Expense Added Successfully');
  }

  splitExpenses(paidBy: string, share: number, person: any) {
    this.users[person].owes[paidBy] = this.users[person].owes[paidBy] || 0;
    this.users[person].owes[paidBy] += share;

    this.users[paidBy].owes[person] = this.users[paidBy].owes[person] || 0;
    this.users[paidBy].owes[person] -= share;
  }

  addUser(name: any): Observable<string> {
    name = name.toLowerCase();
    if (this.users[name]) {
      return throwError('User already Exists');
    }
    this.users[name] = { owes: {} };
    return of('User Added Successfully');
  }

  getAllUsers(): any[] {
    return Object.keys(this.users);
  }

  searchPerson(str: any, excludePeople: any[] = []) {
    if (!str) {
      return of([]);
    }
    str = str.toLowerCase();
    return of(Object.keys(this.users)).pipe(
      map((people) =>
        people.filter((person) => {
          return (
            person.toLowerCase().startsWith(str) &&
            !excludePeople.some((excludePerson) => {
              return (
                excludePerson.trim().toLowerCase() === person.toLowerCase()
              );
            })
          );
        })
      )
    );
  }
  getSettleUpList() {
    let list: any[] = [];
    for (const key in this.users) {
      Object.values(this.users[key]).forEach((item) => {
        for (const prop in item) {
          if (item[prop] > 0) {
            list.push({
              from: key,
              to: prop,
              amount: item[prop],
            });
          }
        }
      });
    }
    return list;
  }

  setExpensesList(
    description: any,
    amount: any,
    paidBy: any,
    persons: string[]
  ) {
    this.newExpense = new expense();
    this.newExpense.description = description;
    this.newExpense.amount = amount;
    this.newExpense.paidBy = paidBy;
    this.newExpense.splitAmong = persons.join(', ');
    this.expensesList.unshift(this.newExpense);
  }

  getExpenses() {
    return this.expensesList;
  }

  minimizeTransactions() {
    const transactions = this.getSettleUpList();
    const users = this.getAllUsers();
    const transactionsMap = new Map<any, any>();
    const result = [];

    transactions.forEach((transaction) => {
      const from = transaction.from;
      const to = transaction.to;
      const amount = transaction.amount;

      if (!transactionsMap.has(from)) {
        transactionsMap.set(from, 0);
      }
      if (!transactionsMap.has(to)) {
        transactionsMap.set(to, 0);
      }
      transactionsMap.set(from, transactionsMap.get(from) + amount);
      transactionsMap.set(to, transactionsMap.get(to) - amount);
    });

    while (transactionsMap.size > 0) {
      let minKey: any;
      let minValue: number | null = null;
      let maxKey: any;
      let maxValue: number | null = null;

      transactionsMap.forEach((value, key) => {
        if (value > 0 && (maxValue === null || value > maxValue)) {
          maxValue = value;
          maxKey = key;
        } else if (value < 0 && (minValue === null || value < minValue)) {
          minValue = value;
          minKey = key;
        }
      });

      if (minValue === null || maxValue === null) {
        break;
      }
      const transferAmount = Math.min(Math.abs(minValue), maxValue);
      transactionsMap.set(maxKey, transactionsMap.get(maxKey) - transferAmount);
      transactionsMap.set(minKey, transactionsMap.get(minKey) + transferAmount);

      if (transactionsMap.get(maxKey) === 0) {
        transactionsMap.delete(maxKey);
      }
      if (transactionsMap.get(minKey) === 0) {
        transactionsMap.delete(minKey);
      }
      result.push({ from: maxKey, to: minKey, amount: transferAmount });
    }

    return result;
  }
}
