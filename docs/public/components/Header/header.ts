import "./header.scss";
import { getDevice } from "../../utils";

export default class Header {
    private _header: HTMLElement;
    private components: HTMLElement[] = [];
    public constructor() {
        this._header = document.createElement("div");
        this._header.id = "header";
        try {
            this._header.classList.add(getDevice());
        } catch {}
    }
    public addComponent(component: HTMLElement, position: number = -1): void {
        if (position < 0) position = this.components.length - 1;
        this.components.splice(position, 0, component);
        this._header.innerHTML = "";
        for (let each of this.components) this._header.appendChild(each);
    }
    public get header(): HTMLElement {
        return this._header;
    }
}
