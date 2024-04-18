import { Injectable } from '@angular/core';
import { Card } from '../models/card';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardServiceService {
  suits: string[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
  deck: {rank: string, suit: string}[] = [];
  dealerCard1: Card | undefined;
  dealerCard2: Card | undefined;
  playerCard1: Card | undefined;
  playerCard2: Card | undefined;

  constructor() { }

  generateDeck(): Observable<{rank: string, suit: string}[]> {
    for(let suit of this.suits) {
      for(let rank of this.ranks) {
         this.deck.push({suit, rank});
      }
    }
    return of(this.deck);
  }

  shuffleDeck(cards: Card[]): Card[] {
    for(let i = 0; i < cards.length; i++) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = cards[i];
        cards[i] = cards[j];
        cards[j] = temp;
    }
    return cards;
  }
  
  dealCard(cards: {rank: string, suit: string}[]): Card | undefined {
    let result = cards.shift();
    return result;
  }
  
}
