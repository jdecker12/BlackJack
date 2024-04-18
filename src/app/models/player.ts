export interface Player {
    hands: {rank: string, suit: string}[][];
    hand: {rank: string, suit: string}[];
    handTotal: number;
    playerBank: number;
}