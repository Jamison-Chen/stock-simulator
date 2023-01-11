import "../public/components/Header/header.scss";
import "../public/sass/public.scss";
import "./sass/style.scss";

import { APP } from "../main";
import AppMenu from "../public/components/AppMenu/appMenu";
import Individual from "./components/individual";
import PriceMachine from "./components/priceMachine";
import Stock from "./components/stock";
import MyMath from "./components/myMath";
import {
    AssetChart,
    CurveChart,
    DealAmountChart,
    MarketEqChart,
} from "./components/chart";

class Main {
    public constructor() {}
    public STRATEGIES: any = {
        "value-follower": {
            displayedName: "ValueFollower",
            otherDetails: [],
        },
        "price-chaser": {
            displayedName: "PriceChaser",
            otherDetails: [],
        },
        "bh-mix-grid": {
            displayedName: "BHmixGrid",
            otherDetails: ["r"],
        },
        "grid-const-ratio": {
            displayedName: "GridConstRatio",
            otherDetails: ["sensitivity", "stock-ratio"],
        },
        chicken: {
            displayedName: "Chicken",
            otherDetails: ["r", "runaway-rate"],
        },
    };

    public startBtn = document.getElementById("start-btn") as HTMLButtonElement;
    public resetBtn = document.getElementById("reset-btn") as HTMLElement;
    public settingBtn = document.getElementById(
        "setting-btn"
    ) as HTMLButtonElement;
    public settingBg = document.getElementById(
        "setting-background"
    ) as HTMLElement;
    public settingCntnr = document.getElementById(
        "setting-container"
    ) as HTMLElement;
    public allSettingHeaderTabs =
        document.getElementsByClassName("setting-header-tab");
    public allParamFields = document.getElementsByClassName("parameter-field");
    public initTotalCashInput = document.getElementById(
        "init-total-cash"
    ) as HTMLInputElement;
    public totalStockInput = document.getElementById(
        "total-stock"
    ) as HTMLInputElement;
    public initialEqInput = document.getElementById(
        "initial-eq"
    ) as HTMLInputElement;
    public annualEconGrowthRateInput = document.getElementById(
        "annual-econ-growth-rate"
    ) as HTMLInputElement;
    public dayToSimulateInput = document.getElementById(
        "day-to-simulate"
    ) as HTMLInputElement;
    public pauseTimeInput = document.getElementById(
        "pause-time"
    ) as HTMLInputElement;
    public composeParamField = document.getElementById(
        "compose-parameter-field"
    ) as HTMLElement;
    public myselfParamField = document.getElementById(
        "myself-parameter-field"
    ) as HTMLElement;
    public detailCntnr = document.getElementById(
        "detail-container"
    ) as HTMLElement;
    public settingFooter = document.getElementById(
        "setting-footer"
    ) as HTMLElement;
    public myAssetChartCntnr = document.getElementById(
        "my-asset-chart-container"
    ) as HTMLElement;
    public myAssetChartHeader = document.getElementById(
        "my-asset-chart-header"
    ) as HTMLElement;
    public myAssetChart = document.getElementById(
        "my-asset-chart"
    ) as HTMLElement;
    public animationField = document.getElementById(
        "animation-field"
    ) as HTMLElement;
    public marketEqChart = document.getElementById(
        "market-eq-chart"
    ) as HTMLElement;
    public dealAmountChart = document.getElementById(
        "deal-amount-chart"
    ) as HTMLElement;
    public curveChart = document.getElementById("curve-chart") as HTMLElement;

    public marketEqData: (number | string)[][] | undefined;
    public dealAmountData: (number | string)[][] | undefined;
    public myAssetData: (string | number)[][] | undefined;

    public myAssetChartDrawer: AssetChart | undefined;
    public marketEqChartDrawer: MarketEqChart | undefined;
    public dealAmountChartDrawer: DealAmountChart | undefined;
    public curveChartDrawer: CurveChart | undefined;

    public individualList: Individual[] | undefined;
    public pm: PriceMachine | undefined;
    public nodeDivSize: number | undefined;

    public initTotalCash: number | undefined;
    public totalStock: number | undefined;
    public initialEq: number | undefined;
    public numOfIndividual: number | undefined;
    public dayToSimulate: number | undefined;
    public pauseTime: number | undefined;
    public annualEconGrowthRate: number | undefined;

    public indiviComposition: any;

    public me: Individual | undefined;
    public myselfSetting: any;
    public createNodeDiv(pauseTime: number): HTMLElement {
        let nodeDiv = document.createElement("div");
        nodeDiv.className = "node";
        nodeDiv.style.width = `${this.nodeDivSize}px`;
        nodeDiv.style.height = `${this.nodeDivSize}px`;
        nodeDiv.style.transitionDuration = `${pauseTime / 2}ms`;
        this.animationField.appendChild(nodeDiv);
        return nodeDiv;
    }
    public applyAllSetting(): void {
        if (
            this.marketEqData !== undefined &&
            this.dealAmountData !== undefined &&
            this.individualList !== undefined &&
            this.initTotalCash !== undefined &&
            this.totalStock !== undefined &&
            this.initialEq !== undefined &&
            this.pauseTime !== undefined
        ) {
            // count numOfIndividual
            this.numOfIndividual = 1; // one for myself(me)
            for (let eachStrategy in this.indiviComposition) {
                this.numOfIndividual +=
                    this.indiviComposition[eachStrategy].number;
            }
            this.pm = new PriceMachine(this.initialEq, this.numOfIndividual);

            // decide the size of each node
            this.nodeDivSize = 0;
            this.nodeDivSize =
                Math.min(
                    this.animationField.offsetHeight,
                    this.animationField.offsetWidth
                ) / Math.ceil(this.numOfIndividual ** 0.35);
            this.animationField.style.gridTemplateColumns = `repeat(auto-fit, minmax(${
                this.nodeDivSize + 10
            }px, 1fr))`;
            this.animationField.style.gridTemplateRows = `repeat(auto-fit, ${
                this.nodeDivSize + 10
            }px)`;
            let cashLeft: number = this.initTotalCash;
            let stockLeft: number = this.totalStock;

            // initialize myself(me)
            let nodeDiv = this.createNodeDiv(this.pauseTime);
            nodeDiv.id = "me";
            nodeDiv.addEventListener("click", () => {
                this.myAssetChartCntnr.classList.add("active");
            });
            let cashOwning = this.myselfSetting.initialCash;
            let stockGot = this.myselfSetting.initialStock;
            cashLeft -= cashOwning;
            stockLeft -= stockGot;
            let stockHolding: Stock[] = [];
            for (let i = 0; i < stockGot; i++)
                stockHolding.push(new Stock(this.pm.equilibrium, 0));
            this.me = new Individual(
                nodeDiv,
                this.myselfSetting.strategySetting,
                cashOwning,
                stockHolding,
                0,
                false
            );
            this.individualList.push(this.me);

            // initialize all the other individuals
            let j = 1; // start with 1 because myself counts 1
            for (let eachStrategy in this.indiviComposition) {
                for (
                    let i = 0;
                    i < this.indiviComposition[eachStrategy].number;
                    i++
                ) {
                    let nodeDiv = this.createNodeDiv(this.pauseTime);
                    let cashOwning: number;
                    let stockGot: number;
                    if (j === this.numOfIndividual - 1) {
                        cashOwning = cashLeft;
                        stockGot = stockLeft;
                    } else {
                        cashOwning = Math.min(
                            cashLeft,
                            Math.floor(
                                (this.initTotalCash / this.numOfIndividual) *
                                    Math.max(0, MyMath.normalSample(1, 0.1))
                            )
                        );
                        stockGot = Math.min(
                            stockLeft,
                            Math.floor(
                                (this.totalStock / this.numOfIndividual) *
                                    Math.max(0, MyMath.normalSample(1, 2))
                            )
                        );
                    }
                    cashLeft -= cashOwning;
                    stockLeft -= stockGot;
                    let stockHolding: Stock[] = [];
                    for (let i = 0; i < stockGot; i++)
                        stockHolding.push(new Stock(this.pm.equilibrium, 0));
                    this.individualList.push(
                        new Individual(
                            nodeDiv,
                            this.indiviComposition[
                                eachStrategy
                            ].strategySetting,
                            cashOwning,
                            stockHolding
                        )
                    );
                    j++;
                }
            }
            // initialize market equillibrium data and deal amount data
            this.marketEqData.push([1, this.pm.equilibrium, this.initialEq]);
            this.dealAmountData.push([1, 0]);
        }
    }
    public simulateOneDay(): void {
        // This is a recursive funtion
        if (
            this.marketEqData !== undefined &&
            this.dealAmountData !== undefined &&
            this.myAssetData !== undefined &&
            this.individualList !== undefined &&
            this.dayToSimulate !== undefined &&
            this.curveChartDrawer !== undefined &&
            this.marketEqChartDrawer !== undefined &&
            this.dealAmountChartDrawer !== undefined &&
            this.myAssetChartDrawer !== undefined
        ) {
            let today = this.marketEqData.length - 1;

            // everyone update market info and make order
            this.everyoneUpdInfoAndOrder(today);

            // suffle individual list before matching
            this.individualList = MyMath.suffleArray(this.individualList);

            // buy-side queue & sell-side queue
            let buySideQueue: Individual[] = [];
            let sellSideQueue: Individual[] = [];
            for (let eachOne of this.individualList) {
                let order = eachOne.makeOrder();
                if (order.buyOrder.quantity > 0) buySideQueue.push(eachOne);
                if (order.sellOrder.quantity > 0) sellSideQueue.push(eachOne);
            }
            // sort the buy-side queue in the bid-price descending order
            buySideQueue.sort((a: Individual, b: Individual) => {
                if (
                    b.orderSetToday !== undefined &&
                    a.orderSetToday !== undefined
                ) {
                    return (
                        b.orderSetToday.buyOrder.price -
                        a.orderSetToday.buyOrder.price
                    );
                } else
                    throw "orderSetToday is undefined when queuing buySideQueue.";
            });

            // sort the sell-side queue in the ask-price ascending order
            sellSideQueue.sort((a: Individual, b: Individual) => {
                if (
                    b.orderSetToday !== undefined &&
                    a.orderSetToday !== undefined
                ) {
                    return (
                        a.orderSetToday.sellOrder.price -
                        b.orderSetToday.sellOrder.price
                    );
                } else
                    throw "orderSetToday is undefined when queuing sellSideQueue.";
            });

            // prepare demand/supply curve data
            let curveData = this.prepareCurveData(buySideQueue, sellSideQueue);
            this.curveChartDrawer.drawChart(curveData);

            // matching buy-side order and sell-side order
            this.matching(today, buySideQueue, sellSideQueue);
            if (today <= this.dayToSimulate) {
                this.marketEqChartDrawer.drawChart(this.marketEqData);
                this.dealAmountChartDrawer.drawChart(this.dealAmountData);
                this.myAssetChartDrawer.drawChart(this.myAssetData);
                this.showIndividualInfo();
                setTimeout(() => {
                    this.simulateOneDay();
                }, this.pauseTime);
            } else {
                this.enableChangeSetting();
                return;
            }
        }
    }
    public everyoneUpdInfoAndOrder(today: number): void {
        if (
            this.marketEqData !== undefined &&
            this.individualList !== undefined &&
            this.pm !== undefined &&
            this.annualEconGrowthRate !== undefined
        ) {
            for (let eachOne of this.individualList) {
                let valAssessed: number = this.pm.genAssessedVal(true);
                let latestPrice: number = parseFloat(
                    `${this.marketEqData.slice(-1)[0].slice(-1)[0]}`
                );
                eachOne.updateMktInfo(
                    today,
                    valAssessed,
                    latestPrice,
                    this.annualEconGrowthRate / 250
                );
            }
        }
    }
    public matching(
        today: number,
        buySideQueue: Individual[],
        sellSideQueue: Individual[]
    ): void {
        let i: number = 0;
        let j: number = 0;
        let totalDealQ: number = 0;
        let finalDealPrice: number | undefined = undefined;
        let dealPair: {
            buySide: Individual;
            sellSide: Individual;
            q: number;
        }[] = [];
        let valid: boolean;
        valid =
            buySideQueue.length > i &&
            sellSideQueue.length > j &&
            buySideQueue[i].orderSetToday.buyOrder.price >=
                sellSideQueue[j].orderSetToday.sellOrder.price;
        while (valid) {
            let dealQ: number = Math.min(
                buySideQueue[i].orderSetToday.buyOrder.quantity,
                sellSideQueue[j].orderSetToday.sellOrder.quantity
            );
            buySideQueue[i].orderSetToday.buyOrder.quantity -= dealQ;
            sellSideQueue[j].orderSetToday.sellOrder.quantity -= dealQ;
            if (buySideQueue[i] !== sellSideQueue[j]) {
                totalDealQ += dealQ;
                dealPair.push({
                    buySide: buySideQueue[i],
                    sellSide: sellSideQueue[j],
                    q: dealQ,
                });
                // decide finalDealPrice
                if (
                    buySideQueue[i].orderSetToday.buyOrder.quantity === 0 &&
                    sellSideQueue[j].orderSetToday.sellOrder.quantity === 0
                ) {
                    finalDealPrice = MyMath.avg([
                        buySideQueue[i].orderSetToday.buyOrder.price,
                        sellSideQueue[j].orderSetToday.sellOrder.price,
                    ]);
                } else if (
                    buySideQueue[i].orderSetToday.buyOrder.quantity === 0
                ) {
                    finalDealPrice =
                        sellSideQueue[j].orderSetToday.sellOrder.price;
                } else if (
                    sellSideQueue[j].orderSetToday.sellOrder.quantity === 0
                ) {
                    finalDealPrice =
                        buySideQueue[i].orderSetToday.buyOrder.price;
                } else throw "wierd!";
            }
            if (buySideQueue[i].orderSetToday.buyOrder.quantity === 0) i++;
            if (sellSideQueue[j].orderSetToday.sellOrder.quantity === 0) j++;
            valid =
                buySideQueue.length > i &&
                sellSideQueue.length > j &&
                buySideQueue[i].orderSetToday.buyOrder.price >=
                    sellSideQueue[j].orderSetToday.sellOrder.price;
        }
        if (
            this.marketEqData !== undefined &&
            this.dealAmountData !== undefined &&
            this.myAssetData !== undefined &&
            this.pm !== undefined &&
            this.me !== undefined
        ) {
            if (finalDealPrice === undefined) {
                finalDealPrice = parseFloat(
                    `${this.marketEqData[this.marketEqData.length - 1][2]}`
                );
            } else {
                for (let eachDealPair of dealPair) {
                    this.deal(
                        eachDealPair.buySide,
                        eachDealPair.sellSide,
                        eachDealPair.q,
                        finalDealPrice,
                        today
                    );
                }
            }
            this.marketEqData.push([
                this.marketEqData.length,
                this.pm.equilibrium,
                finalDealPrice,
            ]);
            this.dealAmountData.push([this.marketEqData.length, totalDealQ]);
            // record my asset data
            this.myAssetData.push([
                this.marketEqData.length,
                this.me.calcTotalAsset(finalDealPrice),
                this.me.calcStockMktVal(finalDealPrice),
                this.me.cashOwning,
            ]);
        }
        // prevent memory leak
        buySideQueue.length = 0;
        sellSideQueue.length = 0;
        dealPair.length = 0;
    }
    public deal(
        buyer: Individual,
        seller: Individual,
        dealQ: number,
        dealP: number,
        today: number
    ): void {
        let stockSold = seller.sellOut(dealQ, dealP);
        buyer.buyIn(stockSold, dealP, today);
    }
    public showIndividualInfo(): void {
        if (
            this.marketEqData !== undefined &&
            this.individualList !== undefined
        ) {
            for (let each of this.individualList) {
                let info = document.createElement("div");
                let i1 = document.createElement("div");
                i1.innerHTML = `${each.initialHolding}`;
                info.appendChild(i1);

                let i4 = document.createElement("div");
                i4.innerHTML = `$${each.initialTotalAsset}`;
                info.appendChild(i4);

                let i2 = document.createElement("div");
                i2.innerHTML = `${each.tradeAmount}`;
                info.appendChild(i2);

                let i3 = document.createElement("div");
                i3.innerHTML = `${each.stockHolding.length}`;
                info.appendChild(i3);

                let i5 = document.createElement("div");
                let finalPrice: number = parseFloat(
                    `${this.marketEqData[this.marketEqData.length - 1][2]}`
                );
                i5.innerHTML = `${
                    Math.round(each.calcReturn(finalPrice) * 10000) / 100
                }%`;
                info.appendChild(i5);

                each.divControlled.innerHTML = "";
                each.divControlled.appendChild(info);
            }
        }
    }
    public prepareCurveData(
        buySideQueue: Individual[],
        sellSideQueue: Individual[]
    ): (number[] | string[])[] {
        if (this.initialEq !== undefined) {
            let maxNumInChart = this.initialEq * 2;
            let minNumInChart = 0;
            let delta = maxNumInChart - minNumInChart;
            let priceSequence: number[] = [];
            for (let i = 0; i < 50; i++)
                priceSequence.push(minNumInChart + (delta / 50) * i);
            let curveData: (number[] | string[])[] = [["price", "D", "S"]];
            for (let each of priceSequence) {
                let qd = 0;
                let qs = 0;
                for (let eachIndividual of buySideQueue) {
                    if (
                        eachIndividual.orderSetToday !== undefined &&
                        eachIndividual.orderSetToday.buyOrder.price >= each
                    ) {
                        qd += eachIndividual.orderSetToday.buyOrder.quantity;
                    }
                }
                for (let eachIndividual of sellSideQueue) {
                    if (
                        eachIndividual.orderSetToday !== undefined &&
                        eachIndividual.orderSetToday.sellOrder.price <= each
                    ) {
                        qs += eachIndividual.orderSetToday.sellOrder.quantity;
                    }
                }
                curveData.push([each, qd, qs]);
            }
            return curveData;
        } else throw "initialEq undefined while preparing curve data";
    }
    public buildCompositionSettingView(): void {
        for (let eachStrategy in this.STRATEGIES) {
            let paramRow = document.createElement("div");
            paramRow.classList.add("parameter-row");

            let paramLabel = document.createElement("div");
            paramLabel.classList.add("parameter-label");
            paramLabel.classList.add("strategy-name");
            paramLabel.innerText = this.STRATEGIES[eachStrategy].displayedName;
            let paramInput = document.createElement("input");
            paramInput.classList.add("parameter-input");
            paramInput.classList.add("strategy-number-input");
            paramInput.type = "number";
            paramInput.id = `${eachStrategy}-number`;
            let strategyDetailBtn = document.createElement("label");
            strategyDetailBtn.id = `${eachStrategy}-detail`;
            strategyDetailBtn.classList.add("strategy-detail-btn");
            strategyDetailBtn.htmlFor = `${eachStrategy}-detail-field`;
            strategyDetailBtn.innerText = "detail";
            strategyDetailBtn.addEventListener("click", (e: Event) => {
                this.detailCntnr.classList.add("active");
                for (let eachChild of this.detailCntnr.children)
                    eachChild.classList.remove("active");
                if (e.currentTarget instanceof HTMLLabelElement) {
                    document
                        .getElementById(`${e.currentTarget.htmlFor}`)
                        ?.classList.add("active");
                }
                let allDetailBtns = document.getElementsByClassName(
                    "strategy-detail-btn"
                );
                for (let eachBtn of allDetailBtns) {
                    if (eachBtn === e.currentTarget)
                        eachBtn.classList.add("active");
                    else eachBtn.classList.remove("active");
                }
            });

            paramRow.appendChild(paramLabel);
            paramRow.appendChild(paramInput);
            paramRow.appendChild(strategyDetailBtn);

            this.composeParamField.appendChild(paramRow);
        }
        for (let eachStrategy in this.STRATEGIES) {
            let detailField = document.createElement("div");
            detailField.id = `${eachStrategy}-detail-field`;
            detailField.classList.add("detail-field");

            if (this.STRATEGIES[eachStrategy].otherDetails.length === 0) {
                let paramRow = document.createElement("div");
                paramRow.classList.add("parameter-row");

                let paramLabel = document.createElement("div");
                paramLabel.classList.add("parameter-label");
                paramLabel.innerText = `${this.STRATEGIES[eachStrategy].displayedName} is not needed to be configured.`;

                paramRow.appendChild(paramLabel);

                detailField.appendChild(paramRow);
            } else {
                for (let eachDetail of this.STRATEGIES[eachStrategy]
                    .otherDetails) {
                    let paramRow = document.createElement("div");
                    paramRow.classList.add("parameter-row");

                    let paramLabel = document.createElement("div");
                    paramLabel.classList.add("parameter-label");
                    paramLabel.innerText = `${eachDetail}`;
                    let paramInput = document.createElement("input");
                    paramInput.classList.add("parameter-input");
                    paramInput.classList.add("strategy-detail-input");
                    paramInput.id = `${eachStrategy}-${eachDetail}`;

                    paramRow.appendChild(paramLabel);
                    paramRow.appendChild(paramInput);

                    detailField.appendChild(paramRow);
                }
            }
            this.detailCntnr.appendChild(detailField);
        }
    }
    public buildMyselfSettingView(): void {
        let paramRow = document.createElement("div");
        paramRow.classList.add("parameter-row");

        let paramLabel = document.createElement("div");
        paramLabel.classList.add("parameter-label");
        paramLabel.innerText = "Initial Total Cash";
        let paramInput = document.createElement("input");
        paramInput.classList.add("parameter-input");
        paramInput.type = "number";
        paramInput.id = `my-init-total-cash`;

        paramRow.appendChild(paramLabel);
        paramRow.appendChild(paramInput);

        this.myselfParamField.appendChild(paramRow);

        paramRow = document.createElement("div");
        paramRow.classList.add("parameter-row");

        paramLabel = document.createElement("div");
        paramLabel.classList.add("parameter-label");
        paramLabel.innerText = "Initial Stock";
        paramInput = document.createElement("input");
        paramInput.classList.add("parameter-input");
        paramInput.type = "number";
        paramInput.id = `my-init-stock`;

        paramRow.appendChild(paramLabel);
        paramRow.appendChild(paramInput);

        this.myselfParamField.appendChild(paramRow);
        // build each strategies' detail field
        for (let eachStrategy in this.STRATEGIES) {
            let detailField = document.createElement("div");
            detailField.id = `my-${eachStrategy}-detail-field`;
            detailField.classList.add("detail-field");

            if (this.STRATEGIES[eachStrategy].otherDetails.length === 0) {
                let paramRow = document.createElement("div");
                paramRow.classList.add("parameter-row");

                let paramLabel = document.createElement("div");
                paramLabel.classList.add("parameter-label");
                paramLabel.innerText = `${this.STRATEGIES[eachStrategy].displayedName} is not needed to be configured.`;

                paramRow.appendChild(paramLabel);

                detailField.appendChild(paramRow);
            } else {
                for (let eachDetail of this.STRATEGIES[eachStrategy]
                    .otherDetails) {
                    let paramRow = document.createElement("div");
                    paramRow.classList.add("parameter-row");

                    let paramLabel = document.createElement("div");
                    paramLabel.classList.add("parameter-label");
                    paramLabel.innerText = `${eachDetail}`;
                    let paramInput = document.createElement("input");
                    paramInput.classList.add("parameter-input");
                    paramInput.classList.add("strategy-detail-input");
                    paramInput.id = `my-${eachStrategy}-${eachDetail}`;

                    paramRow.appendChild(paramLabel);
                    paramRow.appendChild(paramInput);

                    detailField.appendChild(paramRow);
                }
            }
            this.detailCntnr.appendChild(detailField);
        }

        paramRow = document.createElement("div");
        paramRow.classList.add("parameter-row");

        paramLabel = document.createElement("div");
        paramLabel.classList.add("parameter-label");
        paramLabel.innerText = "Strategy";
        let strategyMenu = document.createElement("select");
        strategyMenu.classList.add("parameter-menu");
        strategyMenu.id = "my-strategy-menu";
        strategyMenu.addEventListener("click", (e: Event) => {
            this.detailCntnr.classList.add("active");
            for (let eachChild of this.detailCntnr.children)
                eachChild.classList.remove("active");
            if (e.currentTarget instanceof HTMLSelectElement) {
                document
                    .getElementById(`my-${e.currentTarget.value}-detail-field`)
                    ?.classList.add("active");
            }
            let allDetailBtns = document.getElementsByClassName(
                "strategy-detail-btn"
            );
            for (let eachBtn of allDetailBtns) {
                if (eachBtn === e.currentTarget)
                    eachBtn.classList.add("active");
                else eachBtn.classList.remove("active");
            }
        });
        for (let eachStrategy in this.STRATEGIES) {
            let eachOption = document.createElement("option");
            eachOption.value = eachStrategy;
            eachOption.innerText = this.STRATEGIES[eachStrategy].displayedName;
            eachOption.classList.add("parameter-menu-option");
            strategyMenu.options.add(eachOption);
        }

        paramRow.appendChild(paramLabel);
        paramRow.appendChild(strategyMenu);

        this.myselfParamField.appendChild(paramRow);
    }
    public enableChangeSetting(): void {
        this.settingBtn.disabled = false;
        this.startBtn.disabled = false;
    }
    public disableChangeSetting(): void {
        this.settingBtn.disabled = true;
        this.startBtn.disabled = true;
    }
    public initGeneralSetting(): void {
        this.initTotalCashInput.value = "1000000";
        this.totalStockInput.value = "1000000";
        this.initialEqInput.value = "1";
        this.annualEconGrowthRateInput.value = "0";
        this.dayToSimulateInput.value = "250";
        this.pauseTimeInput.value = "0";
    }
    public readGeneralSetting(): void {
        this.initTotalCash = parseInt(this.initTotalCashInput.value);
        this.totalStock = parseInt(this.totalStockInput.value);
        this.initialEq = parseInt(this.initialEqInput.value);
        this.annualEconGrowthRate = parseFloat(
            this.annualEconGrowthRateInput.value
        );
        this.dayToSimulate = parseInt(this.dayToSimulateInput.value);
        this.pauseTime = parseInt(this.pauseTimeInput.value);
    }
    public initCompositionSetting(): void {
        this.indiviComposition = {
            "value-follower": {
                number: 0,
                strategySetting: {
                    name: "ValueFollower",
                    params: {},
                },
            },
            "price-chaser": {
                number: 199,
                strategySetting: {
                    name: "PriceChaser",
                    params: {},
                },
            },
            "bh-mix-grid": {
                number: 0,
                strategySetting: {
                    name: "BHmixGrid",
                    params: {
                        r: 0.1,
                    },
                },
            },
            "grid-const-ratio": {
                number: 0,
                strategySetting: {
                    name: "GridConstRatio",
                    params: {
                        sensitivity: 0.1,
                        "stock-ratio": 0.5,
                    },
                },
            },
            chicken: {
                number: 0,
                strategySetting: {
                    name: "Chicken",
                    params: {
                        r: 0.2,
                        "runaway-rate": 0.85,
                    },
                },
            },
        };
        for (let eachStrategy in this.indiviComposition) {
            let eachInputDOM = document.getElementById(
                `${eachStrategy}-number`
            ) as HTMLInputElement;
            eachInputDOM.value = this.indiviComposition[eachStrategy].number;
            for (let eachDetail in this.indiviComposition[eachStrategy]
                .strategySetting.params) {
                let inputDOM = document.getElementById(
                    `${eachStrategy}-${eachDetail}`
                ) as HTMLInputElement;
                inputDOM.value =
                    this.indiviComposition[eachStrategy].strategySetting.params[
                        eachDetail
                    ];
            }
        }
    }
    public readCompositionSetting(): void {
        for (let eachStrategy in this.indiviComposition) {
            let eachInputDOM = document.getElementById(
                `${eachStrategy}-number`
            ) as HTMLInputElement;
            this.indiviComposition[eachStrategy].number = parseInt(
                `${eachInputDOM.value}`
            );
            let params: any = {};
            for (let eachParam of this.STRATEGIES[eachStrategy].otherDetails) {
                let inputDOM = document.getElementById(
                    `${eachStrategy}-${eachParam}`
                ) as HTMLInputElement;
                params[eachParam] = parseFloat(`${inputDOM.value}`);
            }
            this.indiviComposition[eachStrategy].strategySetting.params =
                params;
        }
    }
    public initMyselfSetting(): void {
        this.myselfSetting = {
            initialCash: 1000,
            initialStock: 0,
            strategyLabel: "grid-const-ratio",
            strategySetting: {
                name: "GridConstRatio",
                params: {
                    sensitivity: 0.05,
                    "stock-ratio": 0.5,
                },
            },
        };
        let myInitTotalCashInput = document.getElementById(
            "my-init-total-cash"
        ) as HTMLInputElement;
        myInitTotalCashInput.value = this.myselfSetting.initialCash;
        let myInitStockInput = document.getElementById(
            "my-init-stock"
        ) as HTMLInputElement;
        myInitStockInput.value = this.myselfSetting.initialStock;
        let menuOption = document.getElementsByClassName(
            "parameter-menu-option"
        ) as HTMLCollectionOf<HTMLOptionElement>;
        for (let eachOption of menuOption) {
            if (eachOption.value === this.myselfSetting.strategyLabel) {
                eachOption.selected = true;
            } else eachOption.selected = false;
        }
        for (let eachParam in this.myselfSetting.strategySetting.params) {
            let eachInput = document.getElementById(
                `my-${this.myselfSetting.strategyLabel}-${eachParam}`
            ) as HTMLInputElement;
            eachInput.value =
                this.myselfSetting.strategySetting.params[eachParam];
        }
    }
    public readMyselfSetting(): void {
        let myInitTotalCashInput = document.getElementById(
            "my-init-total-cash"
        ) as HTMLInputElement;
        this.myselfSetting.initialCash = parseInt(myInitTotalCashInput.value);
        let myInitStockInput = document.getElementById(
            "my-init-stock"
        ) as HTMLInputElement;
        this.myselfSetting.initialStock = parseInt(myInitStockInput.value);
        let menuOption = document.getElementsByClassName(
            "parameter-menu-option"
        ) as HTMLCollectionOf<HTMLOptionElement>;
        for (let eachOption of menuOption) {
            if (eachOption.selected) {
                this.myselfSetting.strategyLabel = eachOption.value;
                this.myselfSetting.strategySetting.name = eachOption.innerText;
                for (let eachDetail of this.STRATEGIES[eachOption.value]
                    .otherDetails) {
                    let selectedStrategyDetailInput = document.getElementById(
                        `my-${eachOption.value}-${eachDetail}`
                    ) as HTMLInputElement;
                    this.myselfSetting.strategySetting.params[eachDetail] =
                        selectedStrategyDetailInput.value;
                }
            }
        }
    }
    public refresh(): void {
        this.animationField.innerHTML = "";
        if (
            this.marketEqData !== undefined &&
            this.dealAmountData !== undefined &&
            this.myAssetData !== undefined &&
            this.individualList !== undefined
        ) {
            // prevent memory leaks
            this.marketEqData.length = 0;
            this.marketEqData.push(["Day", "Given Price", "Mkt. Eq."]);
            this.dealAmountData.length = 0;
            this.dealAmountData.push(["Day", "Deal Amount"]);
            this.myAssetData.length = 0;
            this.myAssetData.push([
                "Day",
                "Total Asset",
                "Stock Mkt Val",
                "Cash Holding",
            ]);
            this.individualList.length = 0;
        } else {
            this.marketEqData = [["Day", "Given Price", "Mkt. Eq."]];
            this.dealAmountData = [["Day", "Deal Amount"]];
            this.myAssetData = [
                ["Day", "Total Asset", "Stock Mkt Val", "Cash Holding"],
            ];
            this.individualList = [];
        }
        this.readGeneralSetting();
        this.readCompositionSetting();
        this.readMyselfSetting();
        this.applyAllSetting();
    }
    public start(): void {
        let appMenu = new AppMenu("pro", APP);
        document.getElementById("header")?.appendChild(appMenu.button);

        // build market composition setting view
        this.buildCompositionSettingView();
        this.buildMyselfSettingView();
        // init all setting
        this.initGeneralSetting();
        this.initCompositionSetting();
        this.initMyselfSetting();
        // refresh
        this.refresh();
        // Setting Header
        for (let each of this.allSettingHeaderTabs) {
            each.addEventListener("click", (e: Event) => {
                for (let eachField of this.allParamFields)
                    eachField.classList.remove("active");
                if (e.currentTarget instanceof HTMLLabelElement) {
                    document
                        .getElementById(`${e.currentTarget.htmlFor}`)
                        ?.classList.add("active");
                }
                for (let eachTab of this.allSettingHeaderTabs) {
                    if (eachTab === e.currentTarget)
                        eachTab.classList.add("active");
                    else eachTab.classList.remove("active");
                }
                let allDetailBtns = document.getElementsByClassName(
                    "strategy-detail-btn"
                );
                for (let eachBtn of allDetailBtns)
                    eachBtn.classList.remove("active");
                this.detailCntnr.classList.remove("active");
            });
        }
        //  Setting Footer
        this.settingFooter.addEventListener("click", () => {
            this.refresh();
        });
        // the start(RUN) button
        this.startBtn.addEventListener("click", () => {
            this.refresh();
            this.disableChangeSetting();
            this.simulateOneDay();
        });
        this.myAssetChartHeader.addEventListener("click", () => {
            this.myAssetChartCntnr.classList.remove("active");
        });
        this.settingBtn.addEventListener("click", () => {
            this.settingBg.classList.add("active");
            this.settingCntnr.classList.add("active");
            this.detailCntnr.classList.add("is-setting");
        });
        this.settingFooter.addEventListener("click", () => {
            this.settingBg.classList.remove("active");
            this.settingCntnr.classList.remove("active");
            this.detailCntnr.classList.remove("is-setting");
        });
        this.resetBtn.addEventListener("click", () => {
            location.reload();
        });
        this.myAssetChartDrawer = new AssetChart(this.myAssetChart);
        this.marketEqChartDrawer = new MarketEqChart(this.marketEqChart);
        this.dealAmountChartDrawer = new DealAmountChart(this.dealAmountChart);
        this.curveChartDrawer = new CurveChart(this.curveChart);
    }
}

let main = new Main();
main.start();
