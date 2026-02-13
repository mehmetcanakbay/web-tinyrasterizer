import { Matrix, Vector2, Vector3, Vector4 } from "./math";
import type { Shader } from "./shader";

let zbuffer: Float32Array;

export function initZBuffer(width: number, height: number) {
    zbuffer = new Float32Array(width * height);
    zbuffer.fill(-1000);
}

export function rasterize(
    matrixData: { viewport: Matrix },
    clip: Vector4[],
    shader: Shader,
    framebuffer: Uint8ClampedArray,
    width: number,
    height: number
) {
    const ndc = [
        clip[0].scale(1 / clip[0].w),
        clip[1].scale(1 / clip[1].w),
        clip[2].scale(1 / clip[2].w)
    ];

    const screen = ndc.map(v => {
        const m = matrixData.viewport.multiplyVector4(v);
        return new Vector2(m.x, m.y);
    });

    const ABC = Matrix.fromRows(
        [screen[0].x, screen[1].x, screen[2].x],
        [screen[0].y, screen[1].y, screen[2].y],
        [1.0, 1.0, 1.0]
    );

    const det = ABC.det();

    if (det < 1e-4) return;

    const [bbminx, bbmaxx] = [
        Math.min(screen[0].x, screen[1].x, screen[2].x),
        Math.max(screen[0].x, screen[1].x, screen[2].x)
    ];
    const [bbminy, bbmaxy] = [
        Math.min(screen[0].y, screen[1].y, screen[2].y),
        Math.max(screen[0].y, screen[1].y, screen[2].y)
    ];

    const ABC_inv = ABC.invert();

    for (let x = Math.max(Math.floor(bbminx), 0); x <= Math.min(Math.floor(bbmaxx), width - 1); x++) {
        for (let y = Math.max(Math.floor(bbminy), 0); y <= Math.min(Math.floor(bbmaxy), height - 1); y++) {
            const bc_screen = ABC_inv!.multiplyVector3(new Vector3(x, y, 1.0));
            if (bc_screen.x < 0 || bc_screen.y < 0 || bc_screen.z < 0) continue;

            const bc_clip = new Vector3(
                bc_screen.x / clip[0].w,
                bc_screen.y / clip[1].w,
                bc_screen.z / clip[2].w
            );
            const sum = bc_clip.x + bc_clip.y + bc_clip.z;
            bc_clip.x /= sum;
            bc_clip.y /= sum;
            bc_clip.z /= sum;

            const z = bc_screen.x * ndc[0].z + bc_screen.y * ndc[1].z + bc_screen.z * ndc[2].z;
            const zIndex = x + y * width;
            if (z < zbuffer[zIndex]) continue;

            const fragColor = shader.fragment(bc_clip);
            zbuffer[zIndex] = z;

            const idx = (x + y * width) * 4;
            framebuffer[idx + 0] = fragColor.r;
            framebuffer[idx + 1] = fragColor.g;
            framebuffer[idx + 2] = fragColor.b;
            framebuffer[idx + 3] = 255;
        }
    }
}
