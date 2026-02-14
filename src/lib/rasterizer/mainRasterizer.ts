import { CTXImageManager } from "./image";
import { Matrix, Transformations, Vector3 } from "./math"
import { type ObjModel } from "./objParser";
import { initZBuffer, rasterize } from "./rasterize";
import { PhongShader } from "./shader";

export function render(ctx: CanvasRenderingContext2D, modelToRender: ObjModel,
    width?: number, height?: number, position?: Vector3, rotation?: Vector3, scale?: Vector3) {

    width = width || 800;
    height = height || 800;

    const lightDir = new Vector3(1, 1, 1).normalize();
    let eye: Vector3 = new Vector3(5, 0, -5)
    const center: Vector3 = new Vector3(0, 0, 0)
    const up: Vector3 = new Vector3(0, 1, 0)

    const model: Matrix = Transformations.TRS(
        position || new Vector3(0, 0, 0),
        rotation || new Vector3(0, 0, 0),
        scale || new Vector3(1, 1, 1),
    );

    const view: Matrix = Transformations.lookAt(eye, center, up);
    const viewModel = view.multiply(model);
    const viewport = Transformations.viewport(0, 0, width, height);
    const projection: Matrix = Transformations.perspective(20, 1, 0.1, 100);

    console.log("Projection matrix:", projection);
    const ctxImageManager = new CTXImageManager({ ctx })
    const framebuffer = ctxImageManager.createImageFromContext(width, height);

    const data = framebuffer!.data;

    const shader = new PhongShader(modelToRender, view, viewModel, lightDir, projection);
    initZBuffer(width, height)

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 22;
        data[i + 1] = 22;
        data[i + 2] = 22;
        data[i + 3] = 255;
    }

    for (let k = 0; k < modelToRender.faces.length; k++) {
        const clip = [
            shader.vertex(k, 0),
            shader.vertex(k, 1),
            shader.vertex(k, 2)
        ];

        rasterize({ viewport }, clip, shader, data, width, height);
    }

    ctx.putImageData(framebuffer!, 0, 0);
}
