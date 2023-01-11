export interface Strategy {
    name: string;
    nDays: number;
    dailyQList: number[];
    cumulQList: number[];
    pList: number[];
    cumulInvestCashList: number[];
    cashList: number[];
    rateOfReturnList: number[];
    securMktValList: number[];
    totalAssetsList: number[];
    buyHistory: any;
    followStrategy(...args: any[]): void;
}
export class Strategy implements Strategy {
    public constructor(
        strategyName: string,
        initTotalAsset: number,
        nDays: number,
        pList: number[]
    ) {
        this.name = strategyName;
        this.totalAssetsList = [initTotalAsset];
        this.nDays = nDays;
        this.pList = pList;
        this.dailyQList = [];
        this.cumulQList = [];
        this.cumulInvestCashList = [];
        this.cashList = [];
        this.rateOfReturnList = [];
        this.securMktValList = [];
        this.buyHistory = {};
    }
    public recordQuantity(qToday: number, i: number): void {
        this.dailyQList.push(qToday);
        this.cumulQList.push(this.cumulQList[i - 1] + qToday);
    }
    public recordCashFlow(qToday: number, i: number): void {
        let cashDeltaToday = qToday * this.pList[i];
        if (qToday >= 0) {
            // buying
            this.cumulInvestCashList.push(
                this.cumulInvestCashList[i - 1] + cashDeltaToday
            );
            this.cashList.push(
                this.cashList[i - 1] - cashDeltaToday * 1.001425
            );
        } else {
            // when selling, count average
            this.cumulInvestCashList.push(
                (this.cumulInvestCashList[i - 1] * this.cumulQList[i]) /
                    this.cumulQList[i - 1]
            );
            this.cashList.push(
                this.cashList[i - 1] - cashDeltaToday * 0.995575
            );
        }
    }
    public recordBuyHistory(qToday: number, i: number): void {
        if (qToday > 0) {
            let key = Math.round((this.pList[i] + Number.EPSILON) * 100) / 100;
            if (this.buyHistory[`${key}`] === undefined)
                this.buyHistory[`${key}`] = qToday;
            else this.buyHistory[`${key}`] += qToday;
        }
    }
    public recordAllInfo(qToday: number, i: number): void {
        if (i === 0) {
            this.cumulInvestCashList = [qToday * this.pList[i]];
            this.cashList = [this.totalAssetsList[i] - qToday * this.pList[i]];
            this.securMktValList = [qToday * this.pList[i]];
            this.rateOfReturnList = [0];
            this.cumulQList = [qToday];
            this.dailyQList = [qToday];
        } else {
            this.recordQuantity(qToday, i);
            this.recordCashFlow(qToday, i);
            this.securMktValList.push(this.cumulQList[i] * this.pList[i]);
            this.totalAssetsList.push(
                this.cashList[i] + this.securMktValList[i]
            );
        }
        this.recordBuyHistory(qToday, i);
    }
}
export class BHmixGrid extends Strategy {
    public followStrategy(
        sensitivity: number,
        fisrtTimeCashIn: number,
        finalCashIn: number,
        maxBuyInTime: number
    ): void {
        let latestMaxP = this.pList[0];
        let latestMinP = this.pList[0];
        let alreadyBuyInTime = 0;
        const alpha = this.determineAlpha(
            fisrtTimeCashIn,
            finalCashIn,
            maxBuyInTime
        );
        for (let i = 0; i < this.nDays; i++) {
            let qToday = 0;
            if (i === 0 || this.cumulQList[i - 1] === 0) {
                qToday = this.calcBuyInQ(
                    alpha,
                    fisrtTimeCashIn,
                    alreadyBuyInTime,
                    this.pList[i]
                );
                latestMaxP = this.pList[i];
                latestMinP = this.pList[i];
                alreadyBuyInTime++;
            } else {
                if (this.pList[i] >= latestMaxP * (1 + sensitivity)) {
                    // Sell all out
                    qToday = -1 * this.cumulQList[i - 1];
                    alreadyBuyInTime = 0;
                } else if (
                    this.pList[i] <= latestMinP / (1 + sensitivity) &&
                    alreadyBuyInTime < maxBuyInTime
                ) {
                    qToday = this.calcBuyInQ(
                        alpha,
                        fisrtTimeCashIn,
                        alreadyBuyInTime,
                        this.pList[i]
                    );
                    latestMinP = this.pList[i];
                    alreadyBuyInTime++;
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
    protected determineAlpha(
        fisrtTimeCashIn: number,
        finalCashIn: number,
        maxBuyInTime: number
    ): number {
        let alpha = 0;
        let totalCashIn = 0;
        while (totalCashIn < finalCashIn) {
            alpha += 0.001;
            totalCashIn = 0;
            for (let i = 0; i < maxBuyInTime; i++) {
                totalCashIn += alpha * i ** 4 + fisrtTimeCashIn;
            }
        }
        return alpha;
    }
    protected calcBuyInQ(
        alpha: number,
        fisrtTimeCashIn: number,
        alreadyBuyInTime: number,
        price: number
    ): number {
        let cashInThisTime = alpha * alreadyBuyInTime ** 4 + fisrtTimeCashIn;
        return Math.floor(cashInThisTime / price);
    }
}
export class PlannedBHmixGrid extends BHmixGrid {
    public followStrategy(
        sensitivity: number,
        fisrtTimeCashIn: number,
        finalCashIn: number,
        maxBuyInTime: number
    ): void {
        let latestMaxP = this.pList[0];
        let latestMinP = this.pList[0];
        let alreadyBuyInTime = 0;
        const alpha = this.determineAlpha(
            fisrtTimeCashIn,
            finalCashIn,
            maxBuyInTime
        );
        for (let i = 0; i < this.nDays; i++) {
            let qToday = 0;
            if (i === 0 || this.cumulQList[i - 1] === 0) {
                qToday = this.calcBuyInQ(
                    alpha,
                    fisrtTimeCashIn,
                    alreadyBuyInTime,
                    this.pList[i]
                );
                latestMaxP = this.pList[i];
                latestMinP = this.pList[i];
                alreadyBuyInTime++;
            } else {
                if (
                    this.pList[i] <= latestMinP / (1 + sensitivity) &&
                    alreadyBuyInTime < maxBuyInTime
                ) {
                    qToday = this.calcBuyInQ(
                        alpha,
                        fisrtTimeCashIn,
                        alreadyBuyInTime,
                        this.pList[i]
                    );
                    latestMinP = this.pList[i];
                    alreadyBuyInTime++;
                } else {
                    let minCostOfSoldStock: number = Infinity;
                    for (let eachP in this.buyHistory) {
                        let targetSellP =
                            parseFloat(eachP) *
                            (2 + sensitivity - parseFloat(eachP) / latestMaxP);
                        if (this.pList[i] >= targetSellP) {
                            qToday -= this.buyHistory[eachP];
                            delete this.buyHistory[eachP];
                            minCostOfSoldStock = Math.min(
                                minCostOfSoldStock,
                                parseFloat(eachP)
                            );
                            alreadyBuyInTime--;
                        }
                    }
                    if (minCostOfSoldStock !== Infinity) {
                        latestMinP = minCostOfSoldStock;
                    }
                    if (this.pList[i] > latestMaxP) {
                        latestMaxP = this.pList[i];
                        latestMinP = this.pList[i];
                    }
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
}
export class BHmixGrid2 extends Strategy {
    public followStrategy(
        sensitivity: number,
        initialStockRatio: number,
        maxBuyInTime: number
    ): void {
        let latestMaxP = this.pList[0];
        let latestMinP = this.pList[0];
        let currBuyInTime = 0;
        let securityRatio = this.calcSecurityRatio(
            initialStockRatio,
            maxBuyInTime,
            currBuyInTime
        );
        for (let i = 0; i < this.nDays; i++) {
            let qToday: number = 0;
            if (i === 0) {
                qToday = Math.floor(
                    (this.totalAssetsList[i] * securityRatio) / this.pList[i]
                );
            } else {
                if (this.cumulQList[i - 1] === 0) {
                    securityRatio = this.calcSecurityRatio(
                        initialStockRatio,
                        maxBuyInTime,
                        currBuyInTime
                    );
                    qToday = Math.floor(
                        (this.totalAssetsList[i - 1] * securityRatio) /
                            this.pList[i]
                    );
                    latestMaxP = this.pList[i];
                    latestMinP = this.pList[i];
                } else if (this.pList[i] > latestMaxP * (1 + sensitivity)) {
                    // Sell all out
                    qToday = -1 * this.cumulQList[i - 1];
                    currBuyInTime = 0;
                } else if (
                    (latestMinP - this.pList[i]) / this.pList[i] >=
                    sensitivity
                ) {
                    currBuyInTime = Math.min(maxBuyInTime, currBuyInTime + 1);
                    securityRatio = this.calcSecurityRatio(
                        initialStockRatio,
                        maxBuyInTime,
                        currBuyInTime
                    );
                    while (
                        (this.cumulQList[i - 1] + qToday) * this.pList[i] <
                        (this.cumulQList[i - 1] * this.pList[i] +
                            this.cashList[i - 1]) *
                            securityRatio
                    ) {
                        qToday++;
                    }
                    if (qToday > 0) latestMinP = this.pList[i];
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
    private calcSecurityRatio(
        initialStockRatio: number,
        maxBuyInTime: number,
        currBuyInTime: number
    ): number {
        let a = (1 - initialStockRatio) / maxBuyInTime ** 4;
        return a * currBuyInTime ** 4 + initialStockRatio;
    }
}
export class CRG extends Strategy {
    public followStrategy(sensitivity: number, securityRatio: number): void {
        let latestTradePrice: number = 0;
        for (let i = 0; i < this.nDays; i++) {
            let qToday: number = 0;
            if (i === 0) {
                qToday = Math.floor(
                    (this.totalAssetsList[i] * securityRatio) / this.pList[i]
                );
            } else {
                let priceRiseRate =
                    (this.pList[i] - latestTradePrice) / latestTradePrice;
                let priceFallRate =
                    (this.pList[i] - latestTradePrice) / this.pList[i];
                if (priceRiseRate >= sensitivity) {
                    if (this.cumulQList[i - 1] > 0) {
                        while (
                            (this.cumulQList[i - 1] + qToday) * this.pList[i] >
                            (this.cumulQList[i - 1] * this.pList[i] +
                                this.cashList[i - 1]) *
                                securityRatio
                        ) {
                            qToday--;
                        }
                        qToday = Math.max(-1 * this.cumulQList[i - 1], qToday);
                    }
                } else if (priceFallRate <= sensitivity * -1) {
                    while (
                        (this.cumulQList[i - 1] + qToday) * this.pList[i] <
                        (this.cumulQList[i - 1] * this.pList[i] +
                            this.cashList[i - 1]) *
                            securityRatio
                    ) {
                        qToday++;
                    }
                }
            }
            if (qToday !== 0) latestTradePrice = this.pList[i];
            this.recordAllInfo(qToday, i);
        }
    }
}
export class Chicken extends Strategy {
    public followStrategy(
        r: number,
        nextAddThreshold: number,
        initialRunawayThreshold: number,
        runawayThresholdShrinkRate: number
    ): void {
        let latestMaxP: number = 0;
        let fixedRunawayAmount = this.pList[0] * (1 - initialRunawayThreshold);
        for (let i = 0; i < this.nDays; i++) {
            let isHolding = false;
            let qToday = 0;
            if (i === 0) {
                qToday = this.calcQToday(
                    r,
                    this.totalAssetsList[i],
                    this.pList[i]
                );
            } else {
                let maxCostHolding: number;
                if (Object.keys(this.buyHistory).length > 0) {
                    isHolding = true;
                    maxCostHolding = Math.max(
                        ...Object.keys(this.buyHistory).map((e) =>
                            parseFloat(e)
                        )
                    );
                } else {
                    fixedRunawayAmount =
                        this.pList[i] * (1 - initialRunawayThreshold);
                    maxCostHolding = latestMaxP;
                }
                if (this.pList[i] > maxCostHolding * (1 + nextAddThreshold)) {
                    // invest more
                    qToday = this.calcQToday(
                        r,
                        this.cashList[i - 1],
                        this.pList[i]
                    );
                    fixedRunawayAmount *= runawayThresholdShrinkRate;
                } else if (
                    this.pList[i] <
                    Math.max(maxCostHolding, latestMaxP) - fixedRunawayAmount
                ) {
                    // sell all out
                    for (let eachP in this.buyHistory) {
                        qToday -=
                            this.buyHistory[eachP] > 0
                                ? this.buyHistory[eachP]
                                : 0;
                        delete this.buyHistory[eachP];
                    }
                    latestMaxP = this.pList[i];
                }
            }
            if (isHolding) {
                latestMaxP = Math.max(latestMaxP, this.pList[i]);
            } else latestMaxP *= 0.99;
            this.recordAllInfo(qToday, i);
        }
    }
    private calcQToday(r: number, cashOwned: number, pToday: number): number {
        const qIfAllIn = cashOwned / pToday;
        if (qIfAllIn < 1) return 0;
        // 3 strategies for deciding multiplier are given:
        let multiplier = r;
        // let multiplier = r * (latestMinP / pToday) ** 5;
        // let multiplier = r / (1 + pToday - latestMinP);
        let qToday = Math.floor(qIfAllIn * multiplier);
        return qToday > 1 ? qToday : 1;
    }
}
export class MAisGod extends Strategy {
    public followStrategy(
        nextAddThreshold: number,
        stockRatioDecreaseRate: number,
        maCloseThreshold: number,
        maLists: any
    ): void {
        let latestMaxP: number = 0;
        let r: number = 0;
        let entryPoint: number = 1;
        for (let i = 0; i < this.nDays; i++) {
            let isHolding = i > 0 && this.cumulQList[i - 1] > 0;
            let qToday = 0;
            if (i === 0) {
            } // do nothing but observe
            else {
                let maxCostHolding: number =
                    this.calcMaxCostHolding(latestMaxP);
                let enterInfo = this.isEnterTime(maLists, i, maCloseThreshold);
                if (!isHolding && enterInfo.shouldEnter) {
                    entryPoint = enterInfo.entryPoint;
                    r = enterInfo.r;
                    qToday = this.calcBuyInAmount(r, i);
                    isHolding = true;
                } else if (
                    isHolding &&
                    this.pList[i] > maxCostHolding * (1 + nextAddThreshold)
                ) {
                    // is add point
                    r *= stockRatioDecreaseRate;
                    qToday = this.calcBuyInAmount(r, i);
                } else if (
                    isHolding &&
                    this.isSellOutTime(maLists, i, entryPoint, maCloseThreshold)
                ) {
                    qToday = this.sellAllStock();
                    isHolding = false;
                }
            }
            if (isHolding) latestMaxP = Math.max(latestMaxP, this.pList[i]);
            this.recordAllInfo(qToday, i);
        }
    }
    private calcMaxCostHolding(latestMaxP: number): number {
        if (Object.keys(this.buyHistory).length > 0) {
            return Math.max(
                ...Object.keys(this.buyHistory).map((e) => parseFloat(e))
            );
        } else return latestMaxP;
    }
    private calcAvgCostHolding(i: number): number {
        let totalCost = 0;
        for (let each in this.buyHistory) {
            totalCost += parseFloat(each) * this.buyHistory[each];
        }
        return totalCost / this.cumulQList[i - 1];
    }
    private isMATooClose(
        maList: any,
        i: number,
        maCloseThreshold: number
    ): {
        tooClose: boolean;
        upperBound: number;
        lowerBound: number;
    } {
        let hightestMA = Math.max(
            maList["MA65"][i],
            maList["MA22"][i],
            maList["MA5"][i]
        );
        let lowestMA = Math.min(
            maList["MA65"][i],
            maList["MA22"][i],
            maList["MA5"][i]
        );
        let avgMA = (hightestMA + lowestMA) / 2;
        return {
            tooClose: (hightestMA - lowestMA) / avgMA <= maCloseThreshold,
            upperBound: avgMA * (1 + maCloseThreshold / 2),
            lowerBound: avgMA * (1 - maCloseThreshold / 2),
        };
    }
    private isEnterTime(
        maList: any,
        i: number,
        maCloseThreshold: number
    ): {
        shouldEnter: boolean;
        entryPoint: number;
        r: number;
    } {
        // just observe on the first day
        if (i === 0) return { shouldEnter: false, entryPoint: NaN, r: NaN };

        // if MAs are too close, do not trade that frequently,
        // only trade if the price jump out of the section of thsoe close MAs
        let maCloseCondition = this.isMATooClose(maList, i, maCloseThreshold);
        if (!maCloseCondition.tooClose) {
            let codeYesterday = this.getPriceMACode(maList, i - 1);
            let codeToday = this.getPriceMACode(maList, i);
            if (codeToday % 5 === 0) {
                if (
                    codeYesterday % 5 !== 0 &&
                    maList["MA5"][i] < maList["MA65"][i] &&
                    maList["MA22"][i] < maList["MA65"][i]
                ) {
                    return { shouldEnter: true, entryPoint: 5, r: 0.618 };
                }
                if (
                    codeYesterday % 3 !== 0 &&
                    codeToday % 3 === 0 &&
                    maList["MA22"][i] > maList["MA65"][i]
                ) {
                    return {
                        shouldEnter: true,
                        entryPoint: 3,
                        r: 0.3,
                    };
                }
            }
        } else {
            if (
                this.pList[i - 1] < maCloseCondition.upperBound &&
                this.pList[i] > maCloseCondition.upperBound
            ) {
                return { shouldEnter: true, entryPoint: 5, r: 0.618 };
            }
        }
        return { shouldEnter: false, entryPoint: NaN, r: NaN };
    }
    private getPriceMACode(maList: any, i: number): number {
        let code = 1;
        if (this.pList[i] > maList["MA5"][i]) code *= 2;
        if (this.pList[i] > maList["MA22"][i]) code *= 3;
        if (this.pList[i] > maList["MA65"][i]) code *= 5;
        return code;
    }
    private calcBuyInAmount(r: number, i: number): number {
        let qIfAllIn = this.cashList[i - 1] / this.pList[i];
        if (qIfAllIn < 1) return 0;
        let multiplier = r;
        let qToday = Math.floor(qIfAllIn * multiplier);
        return qToday > 1 ? qToday : 1;
    }
    private isSellOutTime(
        maList: any,
        i: number,
        entryPoint: number,
        maCloseThreshold: number
    ): boolean {
        // if MAs are too close, do not trade that frequently,
        // only trade if the price jump out of the section of thsoe close MAs
        let maCloseCondition = this.isMATooClose(maList, i, maCloseThreshold);
        if (!maCloseCondition.tooClose) {
            if (this.pList[i] < maList["MA65"][i]) return true;

            if (
                this.pList[i] <= this.calcAvgCostHolding(i) &&
                Object.keys(this.buyHistory).length > 1
            )
                return true;

            let codeYesterDay = this.getPriceMACode(maList, i - 1);
            let codeToday = this.getPriceMACode(maList, i);
            if (entryPoint === 5) {
                if (codeYesterDay % 3 === 0 && codeToday % 3 !== 0) return true;
                if (codeYesterDay % 5 === 0 && codeToday % 5 !== 0) return true;
                if (
                    codeYesterDay % 2 === 0 &&
                    codeToday % 2 !== 0 &&
                    Object.keys(this.buyHistory).length > 4
                ) {
                    return true;
                }
            } else if (entryPoint === 3) {
                if (codeYesterDay % 3 === 0 && codeToday % 3 !== 0) return true;
                if (codeYesterDay % 2 === 0 && codeToday % 2 !== 0) return true;
            } else {
                if (codeYesterDay % 2 === 0 && codeToday % 2 !== 0) return true;
            }
        } else if (this.pList[i] < maCloseCondition.lowerBound) return true;
        return false;
    }
    private sellAllStock(): number {
        let qToday = 0;
        for (let eachP in this.buyHistory) {
            qToday -= this.buyHistory[eachP] > 0 ? this.buyHistory[eachP] : 0;
            delete this.buyHistory[eachP];
        }
        return qToday;
    }
}
export class RegSlope extends Strategy {
    public followStrategy(kDayReg: number, r: number): void {
        for (let i = 0; i < this.nDays; i++) {
            let p = this.pList[i];
            let q = 0;
            if (i >= kDayReg - 1) {
                let regSlope = this.calcRegSlope(kDayReg, i);
                if (regSlope > 0) {
                    q = Math.floor((this.cashList[i - 1] / p) * r);
                } else q = this.sellStocks(p);
            }
            this.recordAllInfo(q, i);
        }
    }
    protected calcRegSlope(kDayReg: number, i: number): number {
        let xBar = (kDayReg - 1) / 2;
        let numerator = 0;
        let denominator = 0;
        for (let j = 0; j < kDayReg; j++) {
            numerator += (j - xBar) * this.pList[i - kDayReg + 1 + j];
            denominator += (j - xBar) ** 2;
        }
        return numerator / denominator;
    }
    protected calcAvgCostHolding(i: number): number {
        let totalCost = 0;
        for (let each in this.buyHistory) {
            totalCost += parseFloat(each) * this.buyHistory[each];
        }
        return totalCost / this.cumulQList[i - 1];
    }
    protected sellStocks(pToday: number): number {
        let qToday = 0;
        for (let eachCost in this.buyHistory) {
            if (parseFloat(eachCost) < pToday) {
                qToday -=
                    this.buyHistory[eachCost] > 0
                        ? this.buyHistory[eachCost]
                        : 0;
                delete this.buyHistory[eachCost];
            }
        }
        return qToday;
    }
}
export class RegSlope2 extends RegSlope {
    public followStrategy(kDayReg: number, r: number): void {
        let prevRegSlope = 0;
        let prevR2 = 0;
        for (let i = 0; i < this.nDays; i++) {
            let p = this.pList[i];
            let q = 0;
            if (i >= kDayReg - 1) {
                let slope = this.calcRegSlope(kDayReg, i);
                let intercept = this.calcRegIntercept(kDayReg, i, slope);
                let r2 = this.calcR2(kDayReg, slope, intercept, i);
                if (slope > 0) {
                    if (slope < prevRegSlope && r2 < prevR2) {
                        if (
                            this.calcRegSlope(Math.floor(kDayReg / 2), i) <= 0
                        ) {
                            if (
                                this.cumulQList[i - 1] * p >=
                                this.cashList[i - 1]
                            ) {
                                q = Math.ceil(-0.5 * this.cumulQList[i - 1]);
                            } else q = Math.ceil(-r * this.cumulQList[i - 1]);
                        }
                    } else {
                        if (this.cumulQList[i - 1] * p < this.cashList[i - 1]) {
                            q = Math.floor(
                                (this.cashList[i - 1] -
                                    this.cumulQList[i - 1] * p) /
                                    (2 * p)
                            );
                        } else q = Math.floor((this.cashList[i - 1] / p) * r);
                    }
                } else q = -1 * this.cumulQList[i - 1];
                prevRegSlope = slope;
                prevR2 = r2;
            }
            this.recordAllInfo(q, i);
        }
    }
    private calcRegIntercept(
        kDayReg: number,
        i: number,
        slope: number
    ): number {
        let xBar = (i + i - (kDayReg - 1)) / 2;
        let yBar = 0;
        for (let j = 0; j < kDayReg; j++) yBar += this.pList[i - j];
        yBar /= kDayReg;
        return yBar - slope * xBar;
    }
    private calcR2(
        kDayReg: number,
        regSlope: number,
        regIntercept: number,
        i: number
    ): number {
        let sse = 0;
        let sst = 0;
        let yBar = 0;
        for (let j = 0; j < kDayReg; j++) yBar += this.pList[i - j];
        yBar /= kDayReg;
        for (let j = 0; j < kDayReg; j++) {
            let pPred = regIntercept + regSlope * (i - j);
            sse += (pPred - yBar) ** 2;
            sst += (this.pList[i - j] - yBar) ** 2;
        }
        return sse / sst;
    }
}
export class RegSlopeBBand extends Strategy {
    public followStrategy(
        kDayReg: number,
        r: number,
        maK: number[],
        bandWidth: number
    ): void {
        for (let i = 0; i < this.nDays; i++) {
            let p = this.pList[i];
            let q = 0;
            if (i >= kDayReg - 1) {
                let regSlope = this.calcRegSlope(kDayReg, i);
                let std = this.calcPriceStd(kDayReg, i);
                let ma = maK[i];
                let upperBound = ma + bandWidth * std;
                let lowerBound = ma - bandWidth * std;
                if (regSlope > 0) {
                    if (p > upperBound) q = 0;
                    else if (p > ma) {
                        q = Math.floor((this.cashList[i - 1] / p) * r);
                    } else if (p > lowerBound) q = this.sellStocks(0.618, i);
                    else q = -Math.floor(r * this.cumulQList[i - 1]);
                } else if (regSlope < 0) {
                    if (p > ma) q = this.sellStocks(0.3, i);
                    else q = -1 * this.cumulQList[i - 1];
                }
            }
            this.recordAllInfo(q, i);
        }
    }
    private calcRegSlope(kDayReg: number, i: number): number {
        let xBar = (kDayReg - 1) / 2;
        let numerator = 0;
        let denominator = 0;
        for (let j = 0; j < kDayReg; j++) {
            numerator += (j - xBar) * this.pList[i - kDayReg + 1 + j];
            denominator += (j - xBar) ** 2;
        }
        return numerator / denominator;
    }
    public calcPriceStd(kDayReg: number, i: number): number {
        let pBar = 0;
        for (let j = 0; j < kDayReg; j++) {
            pBar += this.pList[i - j];
        }
        pBar /= kDayReg;
        let numerator = 0;
        for (let j = 0; j < kDayReg; j++) {
            numerator += (this.pList[i - j] - pBar) ** 2;
        }
        return (numerator / kDayReg) ** 0.5;
    }
    private sellStocks(targetStockRatio: number, i: number): number {
        return (
            -1 *
            Math.max(
                0,
                Math.floor(
                    (this.cumulQList[i - 1] * this.pList[i] -
                        this.totalAssetsList[i - 1] * targetStockRatio) /
                        this.pList[i]
                )
            )
        );
    }
}
export class RegSlopeTrend extends Strategy {
    public followStrategy(
        kDayReg: number,
        r: number,
        bandWidth: number,
        requiredR2: number
    ): void {
        let lowerBoundList = new Array(this.nDays).fill(0);
        let oldSlope = 0;
        for (let i = 0; i < this.nDays; i++) {
            let p = this.pList[i];
            let q = 0;
            if (i >= kDayReg - 1) {
                let slope = this.calcRegSlope(kDayReg, i);
                let intercept = this.calcRegIntercept(kDayReg, i, slope);
                let R2 = this.calcR2(kDayReg, slope, intercept, i);
                if (R2 < requiredR2) slope = oldSlope;
                else {
                    lowerBoundList = this.updateLowerBound(
                        kDayReg,
                        bandWidth,
                        slope,
                        intercept,
                        i,
                        lowerBoundList
                    );
                    oldSlope = slope;
                }
                if (slope > 0) {
                    let std = this.calcPriceStd(kDayReg, i);
                    if (p <= lowerBoundList[i]) q = -1 * this.cumulQList[i - 1];
                    else if (
                        (this.cumulQList[i - 1] > 0 && p > lowerBoundList[i]) ||
                        p > lowerBoundList[i] + bandWidth * std
                    ) {
                        if (R2 > requiredR2) {
                            q = Math.floor((this.cashList[i - 1] / p) * r);
                        }
                    }
                } else if (slope < 0) q = -1 * this.cumulQList[i - 1];
            }
            this.recordAllInfo(q, i);
        }
    }
    private calcRegSlope(kDayReg: number, i: number): number {
        let xBar = (kDayReg - 1) / 2;
        let numerator = 0;
        let denominator = 0;
        for (let j = 0; j < kDayReg; j++) {
            numerator += (j - xBar) * this.pList[i - kDayReg + 1 + j];
            denominator += (j - xBar) ** 2;
        }
        return numerator / denominator;
    }
    private calcRegIntercept(
        kDayReg: number,
        i: number,
        slope: number
    ): number {
        let xBar = (i + i - (kDayReg - 1)) / 2;
        let yBar = 0;
        for (let j = 0; j < kDayReg; j++) yBar += this.pList[i - j];
        yBar /= kDayReg;
        return yBar - slope * xBar;
    }
    private calcR2(
        kDayReg: number,
        regSlope: number,
        regIntercept: number,
        i: number
    ): number {
        let sse = 0;
        let sst = 0;
        let yBar = 0;
        for (let j = 0; j < kDayReg; j++) yBar += this.pList[i - j];
        yBar /= kDayReg;
        for (let j = 0; j < kDayReg; j++) {
            let pPred = regIntercept + regSlope * (i - j);
            sse += (pPred - yBar) ** 2;
            sst += (this.pList[i - j] - yBar) ** 2;
        }
        return sse / sst;
    }
    private calcPriceStd(kDayReg: number, i: number): number {
        let pBar = 0;
        for (let j = 0; j < kDayReg; j++) pBar += this.pList[i - j];
        pBar /= kDayReg;
        let numerator = 0;
        for (let j = 0; j < kDayReg; j++) {
            numerator += (this.pList[i - j] - pBar) ** 2;
        }
        return (numerator / kDayReg) ** 0.5;
    }
    private updateLowerBound(
        kDayReg: number,
        bandWidth: number,
        slope: number,
        intercept: number,
        i: number,
        old: number[]
    ): number[] {
        old = [...old];
        let std = this.calcPriceStd(kDayReg, i);
        for (let j = i; j < old.length; j++) {
            let pPred = intercept + slope * j;
            let lowerBound = pPred - bandWidth * std;
            if (lowerBound > old[j] || this.cumulQList[i - 1] === 0) {
                old[j] = lowerBound;
            }
        }
        return old;
    }
}
