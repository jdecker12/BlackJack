import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'src/app/models/card';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';

@Component({
  selector: 'playing-card',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div id="card-wrapper">
    <div *ngFor="let card of playingCards; let i = index">
        <div class="card card-{{i}}" [ngClass]="{'red': card.suit == 'Diamonds' || card.suit == 'Hearts', 'black': card.suit == 'Clubs' || card.suit == 'Spades'}" [ngStyle]="{'display': this.determineDealerCards(i) ? 'none' : 'block' }">
          <div class="card-top">
            {{card.rank}}
          </div>
          <div [ngClass]="card.suit"></div>
          <div class="card-bottom"> 
            {{card.rank}} 
        </div>
        </div>
    </div>
</div>
  `,
  styles: [`
  playing-card.dealer-hand {
    transform: rotate(180deg);
  }
  #card-wrapper {
    position: relative;
    display: block;
    left: 400px;
    top: 100px;
    .card {
      position: absolute;
      display: block;
      height: 200px;
      width: 150px;
      background-color: #fff;
      border-radius: 5px; 
      padding: 5px; 
      box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5); /* horizontal-offset vertical-offset blur spread color */
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
  .Spades {
    background-image: url('../../../assets/images/Spades.png');
    display: block;
    position: absolute;
    height: 160px;
    width: 145px;
    background-repeat: no-repeat;
    background-position: center;
}




.Hearts {
    background-image: url('../../../assets/images/Hearts.png');
    display: block;
    position: absolute;
    height: 160px;
    width: 145px;
    background-repeat: no-repeat;
    background-position: center;
}




.Clubs {
    background-image: url('../../../assets/images/Clubs.png');
    display: block;
    position: absolute;
    height: 160px;
    width: 145px;
    background-repeat: no-repeat;
    background-position: center;
}




.Diamonds {
    background-image: url('../../../assets/images/Diamonds.png');
    display: block;
    position: absolute;
    height: 160px;
    width: 145px;
    background-repeat: no-repeat;
    background-position: center;
}



    .card-top {
      position: relative;
      transform: rotate(0deg);
      top: 0;
    }
    .card-bottom {
      position: relative;
      bottom: -160px;
      transform: rotate(180deg);
    }
    .card-0 {
      transform : rotate(-20deg);
      height: 200px;
      width: 150px;
    }
    .card-1 {
      transform : rotate(5deg);
      left: 75px;
      top: -10px;
      height: 200px;
      width: 150px;
    }
    .card-2 {
      transform: rotate(25deg);
      top: 7px;
      left: 111px;
      height: 200px;
      width: 150px;
    }
    .card-3 {
      transform: rotate(40deg);
      left: 145px;
      top: 18px;
      height: 200px;
      width: 150px;
    }
    .card-4 {
      transform : rotate(45deg);
      left: 250px;
      height: 200px;
      width: 150px;
      display: block;
      position: relative;
    }
    .red {
        color: red;
      }
      .black {
        color: black;
      }
    }
    .centered {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .card-content {
      display: block;
      position: absolute;
      height: 130px;
      width: 130px;
    }
  `]
})
export class CardComponent implements OnInit, OnChanges {

  /// Properties ///
  @Input() playingCards: Card[] = [];
  @Input() isDealerCards!: boolean;

  cardColors: boolean[] = [];
  playerTotal!: number;
  imageUrl!: string;


  constructor(private commonFunctions: CommonFunctionsService) { }

  ngOnInit(): void {
    this.commonFunctions.playerTotal.subscribe({
      next: (playerTotal) => {
        this.playerTotal = playerTotal;
      }, error: (err) => {
        console.log(`Error isStanding  ${err}`);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDealerCards'] && !changes['isDealerCards'].firstChange) {
      console.log('changed');
    }
  }

  /// functions ///
  setCardColor(): boolean {
    let result = false;
    this.playingCards.forEach(card => {
      this.cardColors = [];
      if (card.suit == 'Hearts' || card.suit == 'Diamonds') {
        result = true;
      } else {
        result = false;
      }
    });
    return result;
  }

  determineDealerCards(index: number): boolean {
    // console.log(`index: ${index} isdealer: ${this.isDealerCards} playerTotal: ${this.playerTotal}`);
    if (this.isDealerCards && index == 1 && this.playerTotal == 0) {
      console.log('true');
      return true;
    } else {
      console.log('false');
      return false;
    }
  }

  setCardRotation(index: number): void {
    let count: number = this.playingCards.length;

  }

  assignDegree(card: Card): number[] {
    return [];
  }


}
