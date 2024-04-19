import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/shared-components/header/header.component';
import { FooterComponent } from 'src/app/shared-components/footer/footer.component';
import { Card } from 'src/app/models/card';
import { DealerHandComponent } from '../dealer-hand/dealer-hand.component';
import { PlayerHandComponent } from '../player-hand/player-hand.component';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { CardServiceService } from 'src/app/services/card-service.service';
import { Observable, Subscription, map, of } from 'rxjs';
import { BetMakerComponent } from '../bet-maker/bet-maker.component';
import { subscribe } from 'diagnostics_channel';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, DealerHandComponent, PlayerHandComponent, BetMakerComponent],
  template: `
    <app-header></app-header>
    <dealer-hand [dealerCards]="[dealerCard1!, dealerCard2!]" [initDealer]="playerTotal!" [playerDeck]="this.deck" (updateDeck)="updateDeck($event)" (dealerTotaler)="getDealerTotal($event)" [isCleared]="isCleared"></dealer-hand>
    <player-hand [playerCards]="[playerCard1!, playerCard2!]" [playerDeck]="this.deck" (updateDeck)="updateDeck($event)" (playerIsStanding)="dealerMove($event)" [isCleared]="isCleared"></player-hand>

    <div *ngIf="!wagerMade">
      <h3>Make a wager</h3>
    </div>
    <div *ngIf="isWinner && wagerMade">
      <h3><i>Player wins!</i></h3> 
    </div>
    <div *ngIf="isWinner !== undefined && isWinner == false">
    <h3><i>Dealer wins!</i></h3>
    </div>
    <h3>Wager: </h3>
    <div>{{wager | currency}}</div>
    
    <bet-maker [isWinner]="isWinner" (makeWager)="getWager($event)" [isCleared]="isCleared"></bet-maker>

    <app-footer></app-footer>
  `,
  styles: [`
    body {
      margin: 20px;
      padding: 20px;
    }
  `]
})
export class GameComponent implements OnInit {
  /// properties ///
  suits: string[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
  deck: { rank: string, suit: string }[] = [];
  dealerCard1: Card | undefined;
  dealerCard2: Card | undefined;
  playerCard1: Card | undefined;
  playerCard2: Card | undefined;

  deck$!: Observable<{ rank: string; suit: string; }[]>;
  dealerHand: Card[] = [];
  dealerRanks: string[] = [];
  dealerTotl: number | undefined;
  initDealerComponent!: Observable<boolean>;
  dealerIsbust: boolean = false;
  dealerTotalBhvSbjct: number | undefined;
  dealerTotaled: boolean = false;

  playerTotal!: number | undefined;
  playerIsStanding: boolean = false;
  playerIsBust: boolean = false;
  playerHands: Card[][] = [];

  playerTotalSubjct!: number;


  wager!: number | undefined;
  wagerMade: boolean = false;
  isWinner: boolean | undefined;
  isCleared: boolean = false;
  isSplit: boolean = false;

  playerHandsSubscription!: Subscription;
  playerTotalSubscription!: Subscription;
  dealerTotalSubscription!: Subscription;




  constructor(private crdSvc: CardServiceService, private cmmnFuncs: CommonFunctionsService) { }

  ngOnInit(): void {
    this.newRound();
    console.log(this.crdSvc.deck);
    if (this.dealerCard1 != undefined && this.dealerCard2 != undefined) {
      this.dealerHand.push(this.dealerCard1);
      this.dealerHand.push(this.dealerCard2);
    }
    this.isSplit = this.cmmnFuncs.isSplit;

    /// subscribe to the playerHands bhvr sbjct
    this.cmmnFuncs.playerHands.subscribe((playerHands: any) => {
      this.playerHands = playerHands;
      if (this.cmmnFuncs.isSplit) {
        this.isSplit = this.cmmnFuncs.isSplit;
      }
    });

    /// subscribe to playerHands bhvr sbjct
    this.playerTotalSubscription = this.playerTotalSubscription = this.cmmnFuncs.playerTotal.subscribe({
      next: (total) => {
        this.playerTotalSubjct = total;
        this.playerTotal = total;

        console.log(`Player total subscribe: ${this.playerTotal}`);
        if (this.dealerTotalBhvSbjct) {
          if (this.isBust(this.playerTotal!)) {
            this.determineWinner();
          }
        }
      }, error: (er) => {
        console.log(`Player total subscribe error: ${er}`);
      }
    });

    /// subscribe to dealer total bhvSbjct 
    this.playerTotalSubscription = this.cmmnFuncs.dealerTotal.subscribe({
      next: (total) => {
        this.dealerTotalBhvSbjct = total;
        this.isBust(this.dealerTotl!) ? this.dealerIsbust = true : this.dealerIsbust = false;
        if (this.dealerIsbust || this.playerIsStanding) {
          this.determineWinner();
        }
      }
    });
  }

  /// functions ///

  updateDeck(data: any): void {
    this.deck = [];
    this.deck = data;
    console.log(this.deck);
  }

  getWager(data: any): void {
    this.clearRound();
    this.isCleared = false;
    this.wager = data;
    this.newRound();
    this.wagerMade = true;
  }

  isBust(total: number): boolean {
    return total > 21;
  }



  getDealerTotal(dealerTotal: number): void {
    this.dealerTotl = dealerTotal;
  }

  determineWinner(): void {
    if (!this.isBust(this.playerTotal!) && this.playerTotal! > this.dealerTotl! || this.isBust(this.dealerTotl!)) {
      this.cmmnFuncs.isWinner.next(true);
      this.isWinner = true;
    } else if (!this.isBust(this.dealerTotl!) && this.dealerTotl! > this.playerTotal! || this.isBust(this.playerTotal!)) {
      this.cmmnFuncs.isWinner.next(false);
      this.isWinner = false;
    } else {
      this.cmmnFuncs.isWinner.next(undefined);
      this.isWinner = undefined;
    }

  }

  newRound(): void {
    // generate the deck
    this.deck = [];
    this.crdSvc.generateDeck().subscribe({
      next: (deck): void => {
        this.deck = deck;
      }, error: (err): void => {
        console.log(err);
      }
    });
    // shuffle the deck
    this.crdSvc.shuffleDeck(this.deck);

    // initial deal 
    this.dealerCard1 = this.crdSvc.dealCard(this.deck);
    this.dealerCard2 = this.crdSvc.dealCard(this.deck);
    this.playerCard1 = this.crdSvc.dealCard(this.deck);
    this.playerCard2 = this.crdSvc.dealCard(this.deck);
    this.isWinner = undefined;
  }

  clearRound(): void {
    this.dealerHand = [];
    this.wager = undefined;
    this.playerTotal = undefined;
    this.dealerTotl = undefined;
    this.dealerRanks = [];
    this.isWinner = undefined;
    this.isCleared = true;
    this.playerIsStanding = false;
  }

  dealerMove(playerTotal: number): void {
    this.playerTotal = playerTotal;
    this.playerIsStanding = true;
    this.playerIsBust = this.isBust(playerTotal);
  }

  ngOnDestroy(): void {
    this.playerTotalSubscription.unsubscribe();
    this.playerTotalSubscription.unsubscribe();
    this.playerTotalSubscription.unsubscribe();
  }
}

