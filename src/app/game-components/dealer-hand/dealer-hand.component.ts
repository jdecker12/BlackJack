import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'src/app/models/card';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { CardServiceService } from 'src/app/services/card-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dealer-hand',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Dealer</h2>
    <div *ngIf="betMade && dealerHand[0] != undefined && !this.isStanding">
      {{dealerCards[0].rank}} of {{dealerCards[0].suit}}
    </div>
    <div *ngIf="dealerTotl && this.playerTotal && this.isStanding">
      <div *ngFor="let card of dealerHand, let i = index">
        {{card.rank}} of {{card.suit}}  
      </div>
    </div>
    <div *ngIf="dealerTotl && this.playerTotal && this.isStanding">Total: {{dealerTotl}}</div>
  `,
  styles: [
  ]
})
export class DealerHandComponent implements OnInit, OnChanges, OnDestroy {
  /// properties ///
  @Input() dealerCards!: Card[];
  @Input() initDealer!: number;
  @Input() playerDeck!: { rank: string, suit: string }[];
  @Input() isCleared!: boolean;
  @Output() updateDeck = new EventEmitter<{ rank: string, suit: string }[]>();
  @Output() dealerTotaler = new EventEmitter<number>();
  dealerRanks: string[] = [];
  dealerTotl!: number | undefined;
  dealerHand: Card[] = [];
  cardRanks!: string[];
  betMade: boolean = false;
  playerTotal: number = 0;
  isStanding: boolean = false;

  playerTotalSubscriotion!: Subscription;
  isClearSubcription!: Subscription;
  isStandingSubscription!: Subscription;

  constructor(private cmnFuncts: CommonFunctionsService, private crdSrvs: CardServiceService) { }

  ngOnInit(): void {
    this.dealerCards.forEach((card: Card) => {
      this.dealerHand.push(card);
    });

    this.playerTotalSubscriotion = this.cmnFuncts.playerTotal.subscribe({
      next: (plyrTotl) => {
        this.playerTotal = plyrTotl;

      }, error: (err) => {
        console.log(`error subscribe to player total: ${err}`);
      }
    });

    /// subscribe to isClearedBhvSbjct
    this.isClearSubcription = this.cmnFuncts.isClearedSbjct.subscribe({
      next: (isClear) => {
        this.isCleared = isClear;
        if (isClear == true) {
          this.clearDealer();
        }

      }, error: (err) => {
        console.log(`Error is clear bhv sbjct: ${err}`);
      }
    });

    /// subscribe to isStanding bhvrSbjct
    this.isStandingSubscription = this.cmnFuncts.isStanding.subscribe({
      next: (standing) => {
        this.isStanding = standing;
      }, error: (err) => {
        console.log(`Error isStanding: ${err}`);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dealerCards'] && !changes['dealerCards'].firstChange) {
      this.dealerHand = [];
      this.dealerTotal();
      this.dealerCards.forEach((card: Card) => {
        this.dealerHand.push(card);
      });
      this.betMade = true;
    }
    if (changes['initDealer'] && !changes['initDealer'].firstChange) {
      this.dealerTotal();
    }
  }

  /// functions ///

  getRanks(): any {
    this.dealerRanks = [];
    this.dealerHand.forEach((card: any) => {
      if (card !== undefined) {
        this.dealerRanks.push(card.rank);
      }
    });
    return this.dealerRanks;
  }

  processVals(): void {
    let ranks = this.getRanks();
    alert(ranks);
    this.cmnFuncts.processCardVals(ranks);
  }

  isBust(val: number): boolean {
    return val > 21;
  }

  dealerTotal(): void {
    this.getRanks();
    this.cmnFuncts.processCardVals(this.dealerRanks);
    this.dealerTotl = this.cmnFuncts.calcTotal(this.cmnFuncts.hand);
    // test for player bust
    if (!this.isBust(this.initDealer)) {
      // blk jck dealer rule conditions for hit
      while (this.dealerTotl < 17 && this.dealerTotl < this.initDealer) {
        alert('dealer hit');
        // process hit 
        let hit: any = this.crdSrvs.dealCard(this.playerDeck);
        this.dealerHand.push(hit);
        this.processVals();

        // update the total
        this.dealerTotl = this.cmnFuncts.calcTotal(this.cmnFuncts.hand);
        if (this.dealerTotl > 21 && this.cardRanks?.indexOf('Ace') > 0) {
          this.dealerTotl -= 10;
        }
      }
      this.dealerTotaler.emit(this.dealerTotl);
      /// update the dealerTotl bhvSubjct
      this.cmnFuncts.dealerTotal.next(this.dealerTotl);
    }

  }

  clearDealer(): void {
    this.dealerCards = [];
    this.cardRanks = [];
    this.dealerHand = [];
    this.dealerTotl = undefined;
    this.cmnFuncts.dealerTotal.next(undefined);
    this.cmnFuncts.isClearedSbjct.next(true);
    this.cmnFuncts.isStanding.next(false);
  }

  ngOnDestroy(): void {
    this.playerTotalSubscriotion.unsubscribe();
    this.isClearSubcription.unsubscribe();
    this.isStandingSubscription.unsubscribe();
  }

}
