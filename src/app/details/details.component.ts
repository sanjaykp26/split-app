import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  expenses!: any;
  minimse: any;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.expenses = this.dataService.getExpenses();
  }
}
