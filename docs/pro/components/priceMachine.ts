import MyMath from "./myMath";

export default class PriceMachine {
    private _numOfPairOut: number;
    private _equilibrium: number;
    private _priceChangeSpeed: number;
    public constructor(initialEq: number, priceChangeSpeed: number) {
        this._numOfPairOut = 0;
        this._equilibrium = initialEq;
        this._priceChangeSpeed = priceChangeSpeed;
    }
    public get equilibrium(): number {
        return this._equilibrium;
    }
    public genAssessedVal(needCount: boolean): number {
        if (
            this._numOfPairOut > 0 &&
            this._numOfPairOut % this._priceChangeSpeed === 0
        ) {
            // random walking equilibrium
            this._equilibrium *= Math.max(0, MyMath.normalSample(1, 0.1 / 100));
            this._numOfPairOut++;
        } else if (needCount) this._numOfPairOut++;
        return this._equilibrium * Math.max(0, MyMath.normalSample(1, 0.1 / 3));
    }
}
