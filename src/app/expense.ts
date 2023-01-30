export class expense {
  description!: string;
  amount!: string;
  paidBy!: string;
  splitAmong!: string;
}

export class users {
  [key: string]: {
    owes: {
      [key: string]: number;
    };
  };
}
