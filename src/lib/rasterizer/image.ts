interface CTXImageConstructionData {
    ctx: CanvasRenderingContext2D | null
}

export class CTXImageManager {
    public settings: CTXImageConstructionData = {
        ctx: null as (CanvasRenderingContext2D | null)
    }

    constructor(data: CTXImageConstructionData) {
        this.settings.ctx = data.ctx;
    }

    createImageFromContext(width: number, height: number): ImageData {
        if (!this.settings.ctx) {
            console.error("CTXImage > CTX is null ")
            return;
        }

        const myImageData = this.settings.ctx.createImageData(width, height);
        return myImageData;
    }
}