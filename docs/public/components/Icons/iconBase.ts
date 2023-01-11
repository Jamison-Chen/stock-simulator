export default class IconBase {
    private static head(sideLength: number | string, color: string): string {
        return `
                <svg xmlns='http://www.w3.org/2000/svg'
                    width='${sideLength}'
                    height='${sideLength}'
                    fill = '${color}'
                    viewBox = '0 0 16 16' >
                `;
    }

    private static tail: string = `</svg>`;

    public static show(
        content: string,
        sideLength: number | string,
        color: string = "currentColor"
    ): string {
        return IconBase.head(sideLength, color) + content + IconBase.tail;
    }
}
