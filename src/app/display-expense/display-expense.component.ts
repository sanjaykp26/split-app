import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { expense, users } from '../expense';
@Component({
  selector: 'app-display-expense',
  templateUrl: './display-expense.component.html',
  styleUrls: ['./display-expense.component.css']
})
export class DisplayExpenseComponent implements OnInit {
  
  @Input() settleUpList!:any
  constructor(private dataService:DataService) { }
  
  ngOnInit(): void {
    this.settleUpList = this.dataService.getSettleUpList();

  }

}
