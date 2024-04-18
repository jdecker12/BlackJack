import { Injectable } from '@angular/core';
import { Card } from '../models/card';
import { CardServiceService } from './card-service.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonFunctionsService {
  /// properties /// 

  faceCards: string[] = ['Jack', 'King', 'Queen', 'Ace'];
  hand: number[] = [];
  cards: Card[] = [];
  isSplit: boolean = false;

  public playerHands = new BehaviorSubject<{ rank: string, suit: string }[][]>([]);
  currentHands = this.playerHands.asObservable();


  constructor(private dataSrvc: CardServiceService) { }

  /// functions ///

  stand(cardVals: string[]): number {
    this.processCardVals(cardVals);
    return this.calcTotal(this.hand);
  }

  hit(deck: []): Card | undefined {
    return this.dataSrvc.dealCard(deck);
  }

  split(deck: { rank: string, suit: string }[], currHand: Card[]): Card[] {
    let splitDeal1: Card | undefined = this.dataSrvc.dealCard(deck);
    let splitDeal2: Card | undefined = this.dataSrvc.dealCard(deck);

    let newHand1: any = [currHand[0], splitDeal1!];
    let newHand2: any = [currHand[1], splitDeal2!];

    this.isSplit = true;

    return [newHand1, newHand2];
  }

  updatePlayerHandSubject(cards: any): void {
    this.playerHands.next(cards);
  }

  isBust(cardVals: number[]): boolean {
    return this.calcTotal(cardVals) > 21;
  }

  isFaceCard(carRank: string): boolean {
    return this.faceCards.includes(carRank);
  }

  isAce(carRank: string): boolean {
    return carRank == 'Ace';
  }

  processCardVals(cardVals: string[]): void {
    this.hand = [];
    cardVals.forEach((rank: string) => {
      if (!this.isFaceCard(rank)) {
        this.hand.push(parseInt(rank));
      } else if (this.isFaceCard(rank) && !this.isAce(rank)) {
        this.hand.push(10);
      } else {
        this.hand.push(11);
      }
    });
  }

  calcTotal(cardVals: number[]): number {
    let total = cardVals.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
    return total
  }

  clearHands(cards: Card[], cardRanks: string[], hand: Card[], total: number | undefined): void {
    cards = [];
    cardRanks = [];
    hand = [];
    total = undefined;
  }
}
