import "../public/sass/public.scss";
import "./sass/style.scss";

import { APP } from "../main";
import Header from "../public/components/Header/header";
import AppMenu from "../public/components/AppMenu/appMenu";
import {
    BHmixGrid,
    PlannedBHmixGrid,
    Chicken,
    CRG,
    BHmixGrid2,
    MAisGod,
    RegSlope,
    RegSlopeBBand,
    RegSlopeTrend,
    RegSlope2,
} from "./components/strategy";
import { AssetChart, PriceChart } from "./components/chart";

let header = new Header();
header.addComponent(new AppMenu("basic", APP).button);
APP.insertBefore(header.header, APP.children[0]);

let priceChartDiv = document.getElementById("price-chart") as HTMLElement;
let assetsChartDiv = document.getElementById("assets-chart") as HTMLElement;
let priceChartDrawer: PriceChart;
let assetsChartDrawer: AssetChart;
let optionListContainer = document.getElementById(
    "option-list-container"
) as HTMLElement;
let startBtn = document.getElementById("start-btn") as HTMLElement;

let initP: number;
let initTotalAssets: number;
let nDays: number;
let maxMADays: number;
let pList: number[] = [];
let strategiesAndTheirArgs: any[] = [];

function simulatePriceFluct(initP: number, nDays: number): number[] {
    let pList = [initP];
    for (let i = 0; i < nDays - 1; i++) {
        // Ramdom Walk
        pList.push(
            Math.round(pList[pList.length - 1] * normalSample(1, 0.033) * 100) /
                100
        );
    }
    return pList;
}

function calcMA(...MADays: number[]): any {
    let result: any = {};
    for (let each of MADays) {
        let eachMAList: number[] = [];
        for (let i = maxMADays; i < pList.length; i++) {
            eachMAList.push(
                pList.slice(i - each, i).reduce((a, b) => a + b) / each
            );
        }
        result[`MA${each}`] = eachMAList;
    }
    return result;
}

function normalSample(mu: number, std: number): number {
    let u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return (
        std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu
    );
}

function execStrategy(s: any): void {
    if (s.strategy.dailyQList.length === 0) {
        s.strategy.followStrategy(...s.args);
    }
    let comprehensiveData: (string | number)[][] = [
        ["Day", "總資產", "證券市值", "投入現金", "剩餘現金"],
    ];
    for (let i = 0; i < s.strategy.nDays; i++) {
        comprehensiveData.push([
            i + 1,
            s.strategy.totalAssetsList[i],
            s.strategy.securMktValList[i],
            s.strategy.cumulInvestCashList[i],
            s.strategy.cashList[i],
        ]);
    }
    assetsChartDrawer.drawChart(comprehensiveData, s.name);
}

function compareStrategies(): void {
    let compareData: (string | number)[][] = [["Day"]];
    for (let eachStrategy of strategiesAndTheirArgs) {
        compareData[0].push(eachStrategy.strategy.name);
        if (eachStrategy.strategy.dailyQList.length === 0) {
            eachStrategy.strategy.followStrategy(...eachStrategy.args);
        }
        for (let i = 0; i < eachStrategy.strategy.totalAssetsList.length; i++) {
            try {
                compareData[i + 1].push(
                    eachStrategy.strategy.totalAssetsList[i]
                );
            } catch {
                compareData.push([
                    i + 1,
                    eachStrategy.strategy.totalAssetsList[i],
                ]);
            }
        }
    }
    assetsChartDrawer.drawChart(compareData, "獲利比較");
}

function drawPriceChart(pList: number[], otherMALists: any): void {
    let priceData: (string | number)[][] = [];
    for (let i = -1; i < pList.length; i++) {
        if (i === -1) {
            let eachRow: string[] = ["Day", "Price"];
            for (let mATitle in otherMALists) eachRow.push(mATitle);
            priceData.push(eachRow);
        } else {
            let eachRow: number[] = [i + 1, pList[i]];
            for (let eachMAList in otherMALists) {
                eachRow.push(otherMALists[eachMAList][i]);
            }
            priceData.push(eachRow);
        }
    }
    priceChartDrawer.drawChart(priceData);
}

function buildAllStrategyOptions(): void {
    optionListContainer.innerHTML = "";

    let strategyOptionList = document.createElement("select");
    strategyOptionList.id = "strategy-option-list";
    strategyOptionList.name = "strategy";

    let compareOption = document.createElement("option");
    compareOption.id = "comparison-option";
    compareOption.value = "comparison";
    compareOption.innerHTML = "Compare";
    strategyOptionList.appendChild(compareOption);

    for (let i = 0; i < strategiesAndTheirArgs.length; i++) {
        let optionDiv = document.createElement("option");
        optionDiv.className = "option";
        optionDiv.innerHTML = strategiesAndTheirArgs[i].strategy.name;
        optionDiv.value = i.toString();
        strategyOptionList.appendChild(optionDiv);
    }

    strategyOptionList.addEventListener("change", () => {
        if (strategyOptionList.value !== compareOption.value) {
            execStrategy(
                strategiesAndTheirArgs[parseInt(strategyOptionList.value)]
            );
        } else compareStrategies();
    });
    optionListContainer.appendChild(strategyOptionList);
}

function preset(): void {
    priceChartDrawer = new PriceChart(priceChartDiv);
    assetsChartDrawer = new AssetChart(assetsChartDiv);
    initP = 100;
    initTotalAssets = 100000;
    nDays = 200;
    maxMADays = 65;
    startBtn.addEventListener("click", run);
    window.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.key === "s" || e.key === "S") run();
    });
}

function run(): void {
    strategiesAndTheirArgs.length = 0;
    pList.length = 0;

    pList = simulatePriceFluct(initP, nDays + maxMADays);
    let listOfMA: any = calcMA(5, 22, 65);
    pList = pList.slice(maxMADays, undefined);
    drawPriceChart(pList, listOfMA);

    // BHmixGrid
    let bhgArgs = [0.04, 702, initTotalAssets, 10];
    let bhg = new BHmixGrid("BHmixGrid", initTotalAssets, nDays, pList);
    strategiesAndTheirArgs.push({ strategy: bhg, args: bhgArgs });

    // PlannedBHmixGrid
    // let bhgArgs = [0.04, 702, initTotalAssets, 10];
    // let pb = new PlannedBHmixGrid(
    //     "PlannedBHmixGrid",
    //     initTotalAssets,
    //     nDays,
    //     pList
    // );
    // strategiesAndTheirArgs.push({ strategy: pb, args: bhgArgs });

    // Chicken
    let argsC = [0.618, 0.0618, 0.8, 0.618];
    let c = new Chicken("Chicken", initTotalAssets, nDays, pList);
    strategiesAndTheirArgs.push({ strategy: c, args: argsC });

    // CRG
    let argsCRG_1 = [0.1, 0.5];
    let crg_1 = new CRG("CRG", initTotalAssets, nDays, pList);
    strategiesAndTheirArgs.push({ strategy: crg_1, args: argsCRG_1 });

    // // BHmixGrid2
    // let bhg2Args = [0.025, 0.05, 15];
    // let bhg2 = new BHmixGrid2("BHmixGrid2", initTotalAssets, nDays, pList);
    // strategiesAndTheirArgs.push({ strategy: bhg2, args: bhg2Args });

    // MAisGod
    // let argsMA = [0.0618, 0.618, 0.1, listOfMA];
    // let ma = new MAisGod("MAisGod", initTotalAssets, nDays, pList);
    // strategiesAndTheirArgs.push({ strategy: ma, args: argsMA });

    // RegSlope
    // let argsReg = [22, 0.1];
    // let rs = new RegSlope("RegSlope", initTotalAssets, nDays, pList);
    // strategiesAndTheirArgs.push({ strategy: rs, args: argsReg });

    // RegSlope2
    let argsReg2 = [22, 0.1];
    let rs2 = new RegSlope2("RegSlope2", initTotalAssets, nDays, pList);
    strategiesAndTheirArgs.push({ strategy: rs2, args: argsReg2 });

    // RegSlopeBBand
    // let argsRSBB = [22, 0.1, listOfMA[`MA22`], 1];
    // let rsbb = new RegSlopeBBand(
    //     "RegSlopeBBand",
    //     initTotalAssets,
    //     nDays,
    //     pList
    // );
    // strategiesAndTheirArgs.push({ strategy: rsbb, args: argsRSBB });

    // RegSlopeTrend
    let argsRST = [22, 0.618, 1, 0.618];
    let rst = new RegSlopeTrend("RegSlopeTrend", initTotalAssets, nDays, pList);
    strategiesAndTheirArgs.push({ strategy: rst, args: argsRST });

    buildAllStrategyOptions();
    compareStrategies();
    document.getElementById("strategy-option-list")?.focus();
}

preset();
run();
