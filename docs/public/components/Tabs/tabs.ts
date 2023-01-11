import "./tabs.scss";

export default class Tabs {
    private _tabsOutterContainer: HTMLElement;
    private tabsInnerContainer: HTMLElement;
    private tabList: HTMLElement[];
    private controllableList: TabControllable[];
    public constructor(tabNames: string[]) {
        this._tabsOutterContainer = document.createElement("div");
        this._tabsOutterContainer.classList.add("tabs-container");

        let tabsBar = document.createElement("div");
        tabsBar.classList.add("tab-bar");
        this._tabsOutterContainer.appendChild(tabsBar);

        this.tabsInnerContainer = document.createElement("div");
        this.tabsInnerContainer.classList.add("tabs");
        this.tabsInnerContainer.classList.add("clearfix");
        tabsBar.appendChild(this.tabsInnerContainer);

        this.tabList = [];
        this.controllableList = [];

        this.generateTabs(tabNames);
    }
    private generateTabs(tabNames: string[]): void {
        for (let each of tabNames) {
            let t = document.createElement("div");
            t.classList.add("tab");
            t.innerHTML = each;

            this.tabsInnerContainer.appendChild(t);
            this.tabList.push(t);
        }
    }
    public get div(): HTMLElement {
        return this._tabsOutterContainer;
    }
    public set id(id: string) {
        this._tabsOutterContainer.id = id;
    }
    public set controllables(controllables: TabControllable[]) {
        this.controllableList = [...controllables];
    }
    public activate(i: number = 0): void {
        if (this.tabList.length === this.controllableList.length) {
            for (let each of this.tabList) {
                each.addEventListener("click", () => this.highlight(each));
            }
            if (i >= 0 && i < this.tabList.length) {
                this.highlight(this.tabList[i]);
            }
        } else {
            throw `Expected to receive ${this.tabList.length} controllable sections, \
            but ${this.controllableList.length} were given.`;
        }
    }
    private highlight(targetTab: HTMLElement): void {
        for (let i = 0; i < this.tabList.length; i++) {
            if (this.tabList[i] === targetTab) {
                this.tabList[i].classList.add("active");
                this.controllableList[i].activate();
            } else {
                this.tabList[i].classList.remove("active");
                this.controllableList[i].close();
            }
        }
    }
}

export interface TabControllable {
    div: HTMLElement;
    activate(): void;
    close(): void;
}
