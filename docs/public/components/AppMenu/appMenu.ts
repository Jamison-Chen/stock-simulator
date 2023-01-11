import "./appMenu.scss";
import simulatorIconIco from "../../assets/icon_simulator.ico";
import simulatorProIconIco from "../../assets/icon_simulator_pro.ico";

import IconBase from "../Icons/iconBase";
import Icon3x3Grid from "../Icons/3x3Grid";
import IconArrowLeft from "../Icons/arrowLeft";
import { getDevice } from "../../utils";

export default class Header {
    private currentApp: "basic" | "pro";
    private toggleCloseArea: HTMLElement;
    private _button: HTMLElement;
    private appList: HTMLElement;
    private isAppListExpanded: boolean;
    public constructor(
        currentApp: "basic" | "pro",
        toggleCloseArea: HTMLElement
    ) {
        this.currentApp = currentApp;
        this.toggleCloseArea = toggleCloseArea;
        this._button = document.createElement("div");
        this.appList = document.createElement("div");
        this.isAppListExpanded = false;
        this.createButton();
        this.createAppList();
    }
    public get button(): HTMLElement {
        return this._button;
    }
    private createButton(): void {
        this._button.classList.add("header-btn");
        this._button.id = "main-btn";
        this._button.innerHTML = IconBase.show(Icon3x3Grid.icon, 20);
        if (getDevice() == "desktop") {
            this._button.addEventListener("click", () => {
                this.toggleAppList();
            });
            this.toggleCloseArea.addEventListener("click", (e: Event) => {
                if (!e.path.includes(this._button)) this.foldUp();
            });
        } else {
            this._button.addEventListener("click", () => {
                this.expand();
            });
        }
    }
    private createAppList(): void {
        this.appList.classList.add(getDevice());
        this.appList.id = "app-list";
        this._button.appendChild(this.appList);

        if (getDevice() === "mobile") {
            let leaveButton = document.createElement("div");
            leaveButton.id = "app-list-leave-button";
            leaveButton.innerHTML = IconBase.show(IconArrowLeft.icon, 28);
            leaveButton.addEventListener("click", (e: Event) => {
                this.foldUp();
                e.stopPropagation();
            });
            this.appList.appendChild(leaveButton);
        }

        let simulatorOption = document.createElement("a");
        simulatorOption.classList.add("app-option");
        this.appList.appendChild(simulatorOption);

        let simulatorIcon = document.createElement("img");
        simulatorIcon.src = simulatorIconIco;
        simulatorOption.appendChild(simulatorIcon);

        let simulatorNameLabel = document.createElement("div");
        simulatorNameLabel.innerText = "Basic";
        simulatorOption.appendChild(simulatorNameLabel);

        let simulatorProOption = document.createElement("a");
        simulatorProOption.classList.add("app-option");
        this.appList.appendChild(simulatorProOption);

        let simulatorProIcon = document.createElement("img");
        simulatorProIcon.src = simulatorProIconIco;
        simulatorProOption.appendChild(simulatorProIcon);

        let simulatorProNameLabel = document.createElement("div");
        simulatorProNameLabel.innerText = "Pro";
        simulatorProOption.appendChild(simulatorProNameLabel);

        // set anchor
        simulatorOption.href = "../basic/";
        simulatorProOption.href = "../pro/";
        if (this.currentApp === "basic") {
            simulatorOption.href = "#";
            simulatorOption.classList.add("active");
        } else if (this.currentApp === "pro") {
            simulatorProOption.href = "#";
            simulatorProOption.classList.add("active");
        }
    }
    private toggleAppList(): void {
        if (this.isAppListExpanded) this.foldUp();
        else this.expand();
    }
    private expand(): void {
        this.appList.classList.add("active");
        this.isAppListExpanded = true;
    }
    private foldUp(): void {
        if (getDevice() === "mobile") {
            setTimeout(() => {
                this.appList.classList.add("leaving");
                setTimeout(() => {
                    this.appList.classList.remove("leaving");
                    this.appList.classList.remove("active");
                    this.isAppListExpanded = false;
                }, 300);
            }, 0);
        } else {
            this.appList.classList.remove("active");
            this.isAppListExpanded = false;
        }
    }
}
