import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bet-maker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>Player Bank: {{playerBank | currency}}</div>
    <h3>Wagers</h3>
    <div *ngFor="let bet of bets">
      <button (click)="placeBet(bet)">{{bet | currency}}</button>
    </div>
  `,
  styles: [
  ]
})
export class BetMakerComponent implements OnInit, OnDestroy {
  /// properties //
  bets: number[] = [];
  playerWager: number | undefined;
  playerBank: number = 100;
  @Input() isWinner: boolean | undefined;
  @Output() makeWager = new EventEmitter<number>();
  @Input() isCleared!: boolean;

  isWinnerSubscription!: Subscription;

  constructor(private cmnFunctions: CommonFunctionsService) { }

  ngOnInit(): void {
    this.oneHundredTable();
    this.isWinnerSubscription = this.cmnFunctions.isWinner.subscribe({
      next: (winner) => {
        this.isWinner = winner;
        if (winner == true || winner == false) {
          this.processFunds();
        }
      }
    });
  }

  /// functions ///

  oneHundredTable(): void {
    let count: number = 0;
    while (count < 100) {
      count += 10;
      this.bets.push(count);
    }
  }

  placeBet(wager: any): void {
    this.cmnFunctions.isClearedSbjct.next(false);
    this.playerWager = wager;
    this.makeWager.emit(wager);
    this.cmnFunctions.isStanding.next(false);
  }

  processFunds(): void {
    this.isWinner ? this.playerBank += this.playerWager! : this.playerBank -= this.playerWager!;
  }

  ngOnDestroy(): void {
    this.isWinnerSubscription.unsubscribe();
  }

}
