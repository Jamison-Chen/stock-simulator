export class MyGoogleChart {
    protected _chartDiv: HTMLElement;
    protected _chartType: string;
    protected _chart: any;
    public constructor(chartDiv: HTMLElement) {
        this._chartDiv = chartDiv;
        this._chartType = "";
    }
}

export class PriceChart extends MyGoogleChart {
    public constructor(chartDiv: HTMLElement) {
        super(chartDiv);
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(dataIn: any[][]): void {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let data = google.visualization.arrayToDataTable(dataIn);
            let option = {
                title: '價格走勢',
                titleTextStyle: {
                    fontSize: 16,
                    bold: false,
                    color: "#777"
                },
                vAxis: {
                    gridlines: {
                        count: 0
                    }
                },
                series: [
                    { color: '#000', visibleInLegend: false, lineWidth: 1.5 },
                    { color: 'orange', lineWidth: 0.5 },
                    { color: 'red', lineWidth: 0.5 },
                    { color: 'blue', lineWidth: 0.5 }
                ],
                curveType: 'none',
                chartArea: { top: "10%", left: "15%", height: "80%", width: "75%" },
                width: this._chartDiv.offsetWidth,
                height: this._chartDiv.offsetHeight,
                legend: { position: 'in' }
            };
            this._chart.draw(data, option);
        } else setTimeout(() => this.drawChart(dataIn), 50);
    }
}

export class AssetChart extends MyGoogleChart {
    public constructor(chartDiv: HTMLElement) {
        super(chartDiv);
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(dataIn: any[][], title: string): void {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let data = google.visualization.arrayToDataTable(dataIn);
            let option = {
                title: title,
                titleTextStyle: {
                    fontSize: 16,
                    bold: false,
                    color: "#777"
                },
                vAxis: {
                    gridlines: {
                        count: 0
                    },
                    viewWindow: {
                        min: title === "獲利比較" ? "default" : 0
                    }
                },
                curveType: 'none',
                chartArea: { top: "10%", left: "15%", height: "80%", width: "75%" },
                width: this._chartDiv.offsetWidth,
                height: this._chartDiv.offsetHeight,
                legend: { position: 'in' }
            };
            this._chart.draw(data, option);
        } else setTimeout(() => this.drawChart(dataIn, title), 50);
    }
}