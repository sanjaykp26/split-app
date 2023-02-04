import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { expense } from '../expense';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSelectChange } from '@angular/material/select';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  public user = new FormControl('', [
    Validators.required,
    Validators.pattern('[a-zA-Z]+'),
  ]);
  public users: string[] = [];
  public newExpense = expense;
  public settleUpList: any;
  minimise: any;
  expenseFormGroup = new FormGroup({
    description: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z]*'),
    ]),
    amount: new FormControl('', Validators.required),
    paidBy: new FormControl('', Validators.required),
    splitAmong: new FormControl({ value: '', disabled: true }),
  });

  selectable = true;

  filteredPersons!: any[];

  persons: string[] = [];
  allPersons: string[] = [...this.persons];
  @ViewChild('personInput', { static: false })
  personInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete!: MatAutocomplete;

  simplifyDebts: any;
  debts: any;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getUsers();
    this.getSettleUpList();
    this.expenseFormGroup.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((value) =>
          this.dataService.searchPerson(value.splitAmong, [
            value.paidBy,
            ...this.persons,
          ])
        )
      )
      .subscribe((users: any) => {
        this.filteredPersons = users;
      });
  }

  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        this.persons.push(value.trim());
      }

      if (input) {
        input.value = '';
      }

      this.expenseFormGroup.controls['splitAmong'].setValue(null);
    }
  }

  remove(person: string): void {
    const index = this.persons.indexOf(person);

    if (index >= 0) {
      this.persons.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.persons.push(event.option.viewValue);
    this.personInput.nativeElement.value = '';
    this.expenseFormGroup.controls['splitAmong'].setValue(null);
  }

  addPerson(): void {
    this.dataService.addUser(this.user.value).subscribe(
      (res) => {
        this.resetUserForm();
        this.getUsers();
      },
      (err) => {}
    );
  }

  getUsers() {
    this.users = this.dataService.getAllUsers();
  }

  getSettleUpList() {
    this.settleUpList = this.dataService.getSettleUpList();
  }

  addExpense(): void {
    const expenseForm = this.expenseFormGroup.value;
    this.dataService
      .saveExpense(
        expenseForm.description,
        expenseForm.amount,
        expenseForm.paidBy,
        this.persons
      )
      .subscribe((res) => {
        this.resetExpenseForm();
        this.getSettleUpList();
      });
  }

  resetUserForm(): void {
    this.user.reset();
  }

  resetExpenseForm(): void {
    this.expenseFormGroup.reset();
    this.expenseFormGroup.controls['splitAmong'].disable();
    this.persons = [];
  }

  enableSplitAmong(e: MatSelectChange) {
    if (e) {
      this.persons = [];
      this.expenseFormGroup.controls['splitAmong'].enable();
    }
  }
  get() {
    this.minimise = this.dataService.minimizeTransactions();
  }
}
