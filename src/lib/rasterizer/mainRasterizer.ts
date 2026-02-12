import { CTXImageManager } from "./image";
import { Matrix4x4, TransformationsMath, Vector3, Vector4, VectorMath } from "./math"
import { type ObjModel } from "./objParser";
import { initZBuffer, rasterize } from "./rasterize";
import { PhongShader } from "./shader";

export function render(ctx: CanvasRenderingContext2D, modelToRender: ObjModel,
    width?: number, height?: number) {

    width = width || 800;
    height = height || 800;

    const lightDir: Vector3 = new Vector3(1, 1, 1)
    let eye: Vector3 = new Vector3(5, 0, -5)
    const center: Vector3 = new Vector3(0, 0, 0)
    const up: Vector3 = new Vector3(0, 1, 0)

    eye = VectorMath.mulScalar3(eye, 1)

    const view: Matrix4x4 = TransformationsMath.lookAt(eye, center, up);
    const viewport = TransformationsMath.viewport(0, 0, width, height);
    const projection: Matrix4x4 = TransformationsMath.projectionFOV(20, 1, 0.1, 100);

    console.log("Projection matrix:", projection);
    const ctxImageManager = new CTXImageManager({ ctx })
    const framebuffer = ctxImageManager.createImageFromContext(width, height);

    const data = framebuffer!.data;

    const shader = new PhongShader(modelToRender, view, lightDir, projection);
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
