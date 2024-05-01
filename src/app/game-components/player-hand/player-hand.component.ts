import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'src/app/models/card';
import { Player } from 'src/app/models/player';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { CardServiceService } from 'src/app/services/card-service.service';
import { Subscription } from 'rxjs';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'player-hand',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
  <div id="playerhand-wrapper">
    <h2>Player</h2>
    <div class="hand-one" *ngIf="!isSplit; else isSplitTemplate">
      <!-- <div *ngFor="let card of playerHand, let i = index"> -->
      <playing-card [playingCards]="this.playerHand"></playing-card>
       
      <!-- //</div> -->
      <div *ngIf="total">Total: {{total}}</div>
      <div *ngIf="over21Mssg">
        {{over21Txt}}
      </div>
      <div class="player-buttons">
        <button (click)="stand()">Stand</button>
        <button (click)="hitMe()">Hit</button>
        <button (click)="splitHand()">Split</button>
      </div>
    </div>
    <ng-template class="hand-two" #isSplitTemplate>
      <div *ngFor="let hands of splitHands; let i = index">
      <div class="hand-{{i}}">
        <playing-card [playingCards]="hands"></playing-card>
      </div>
        <!-- hand{{i + 1}}: {{hands[0].rank}} of {{hands[0].suit}}, {{hands[1].rank}} of {{hands[1].suit}} -->
        <div *ngIf="total">Total: {{total}}</div>
        <div *ngIf="over21Mssg"></div>
        <div class="player-buttons-{{i}}">
          <button (click)="splitStand(i)">Stand</button>
          <button (click)="splitHit(i)">Hit</button>
          <button (click)="splitHand()">Split</button>
        </div>
      </div>
    </ng-template>
  </div>
  `,
  styles: [`
    #playerhand-wrapper {
      position: relative;
      display: block;
      .hand-0 {
        left: 1%;
        position: relative;
      
    }
      .hand-1 {
        left: 35%;
        position: relative;
        top: -20px;
      }
      .player-buttons {
        //position: absolute;
        //bottom : -50px;
      }
    }
  `]
})
export class PlayerHandComponent implements OnInit, OnChanges, OnDestroy {
  // properties //
  @Input() playerCards!: Card[];
  @Input() playerDeck!: Card[];
  @Input() isCleared!: boolean;
  @Output() updateDeck = new EventEmitter<{ rank: string, suit: string }[]>();
  @Output() playerIsStanding = new EventEmitter<number>()
  total: number | undefined;
  player: Player = {
    hands: [],
    hand: [],
    handTotal: 0,
    playerBank: 0
  }
  playerHand: Card[] = [];
  ranksOnly: string[] = [];
  over21Mssg: boolean = false;
  cardRanks!: string[];
  over21Txt: string = 'You have busted';
  playerHands: Card[] = [];
  isSplit: boolean = false;
  splitHands: Card[][] = [];
  totals: number[] = [];

  gameDeck: Card[] = [];

  isClearSubscription!: Subscription;
  playerHandsSubscription!: Subscription;

  constructor(private funcs: CommonFunctionsService, private crdSrvc: CardServiceService) { }

  ngOnInit(): void {
    this.crdSrvc.gameDeck.subscribe({
      next: (deck: Card[]) => {
        this.gameDeck = deck;
      }, error: (err: string) => {
        console.log(`Error gameDeck in player-hand ${err}`);
      }
    });

    this.funcs.updatePlayerHandSubject(this.playerCards!);
    this.playerHandsSubscription = this.funcs.playerHands.subscribe((playerHands) => {
      this.splitHands = playerHands;
    });

    this.isClearSubscription = this.funcs.isClearedSbjct.subscribe({
      next: (isClear) => {
        this.isCleared = isClear;
        this.clearPlayer();
      }, error: (err) => {
        console.log(`Error is cleared subj: ${err}`);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playerCards'] && !changes['playerCards'].firstChange) {
      this.playerHand = [];
      this.playerCards.forEach((card: any) => {
        this.playerHand.push(card);
      });
      this.total = 0;
      this.over21Mssg = false;
    }


  }

  stand(): void {
    this.total = 0;
    this.total = this.funcs.stand(this.getRanks());
    if (this.cardRanks == undefined) {
      this.processVals();
      this.total = this.funcs.calcTotal(this.funcs.hand);
    }
    console.log(this.total);
    console.log(`From stand: ${this.cardRanks}`);
    if (this.total > 21 && this.cardRanks.indexOf('Ace') > 0) {
      this.total -= 10;
    }
    this.playerIsStanding.emit(this.total);
    /// adding central source of truth for player total
    this.funcs.playerTotal.next(this.total);
  }

  getRanks(): string[] {
    this.ranksOnly = [];
    this.playerHand.forEach((card) => {
      this.ranksOnly.push(card.rank!);
    });
    return this.ranksOnly;
  }

  processVals(): void {
    this.cardRanks = this.getRanks();
    // alert(this.cardRanks);
    this.funcs.processCardVals(this.cardRanks);
  }

  hitMe(index?: number): void {
    if (!this.funcs.isBust(this.funcs.hand)) {
      let hit: any = this.crdSrvc.dealCard(this.gameDeck);

      this.playerHand.push(hit);
      if (this.isSplit) {
        this.splitHands[index!].push(hit);
        console.log(`Hit me split hands: ${this.splitHands[index!]}`);

      }
      this.playerHand.forEach((card) => {
        console.log(`Cards: ${card.rank} of ${card.suit}`);
      });

      this.processVals();
      this.total = this.funcs.calcTotal(this.funcs.hand);
      this.over21Mssg = false;
      if (this.total > 21 && this.cardRanks.indexOf('Ace') > 0) {
        this.total -= 10;
      } else if (this.total == 21) {
        this.over21Txt = 'Black Jack!';
        this.over21Mssg = true;
        this.stand();
      } else if (this.total > 21) {
        this.over21Txt = 'You have busted :(';
        this.stand();
        this.over21Mssg = true;
      }
    } else {
      this.stand();
      this.over21Mssg = true;
    }
  }

  splitHand(): void {
    this.isSplit = true;
    console.log(this.isSplit);
    this.playerHand = [];
    let splitResult: Card[] = this.funcs.split(this.gameDeck, this.playerCards);
    this.funcs.updatePlayerHandSubject(splitResult);
    console.log(this.funcs.playerHands);
    console.log(this.splitHands);
  }

  splitHit(handIndex: number): void {
    this.playerHand = [];
    this.splitHands[handIndex].forEach((card: any) => {
      this.playerHand.push(card);
    });
    this.hitMe(handIndex);
  }

  splitStand(handIndex: number): void {
    this.playerHand = [];
    this.splitHands[handIndex].forEach((card: any) => {
      this.playerHand.push(card);
      this.totals.push(this.total!);
      console.log(`Split Stand : ${card.rank} of ${card.suit}`);
      //alert(`Split Stand  ${card.rank} of ${card.suit}`);
    });
    this.stand();
  }

  clearPlayer(): void {
    this.playerCards = [];
    this.cardRanks = [];
    this.ranksOnly = [];
    this.playerHand = [];
    this.total = undefined;
    this.over21Mssg = false;
    this.isSplit = false;
    this.splitHands = [[]];
  }

  ngOnDestroy(): void {
    this.playerHandsSubscription.unsubscribe();
    this.isClearSubscription.unsubscribe();
  }
}
