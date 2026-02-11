import { Matrix4x4, Vector2, Vector4, VectorMath, type Vector3 } from "./math";
import type { ObjModel } from "./objParser";
import type { RGBA } from "./types";

export abstract class Shader {
    abstract fragment(bc_clip: any): RGBA;
}

//all triangles thats why its range
interface varyingData {
    uv: Vector2[];
    normals: Vector3[];
    tri: Vector3[];
}


export class PhongShader extends Shader {
    model: ObjModel;
    modelViewMatrix: Matrix4x4;
    projectionMatrix: Matrix4x4;
    lightDirection: Vector4;
    vertexToFragmentData!: varyingData;

    constructor(model: ObjModel, modelViewMatrix: Matrix4x4, lightDir: Vector3, projectionMatrix: Matrix4x4) {
        super();
        this.model = model;
        this.modelViewMatrix = modelViewMatrix;
        this.projectionMatrix = projectionMatrix;
        this.lightDirection = Matrix4x4
            .multiplyWithMatrix(modelViewMatrix, new Vector4(lightDir.x, lightDir.y, lightDir.z, 0.0))
            .normalize();

        this.vertexToFragmentData = {
            uv: [],
            normals: [],
            tri: []
        };
    }

    vertex(iface: number, jvert: number) {
        // Normal
        const normal = this.model.getNormal(iface, jvert).normalize();
        const vec4Normal = new Vector4(normal.x, normal.y, normal.z, 0.0);

        // Position
        const vert = this.model.getVert(iface, jvert);
        const vec4Vert = new Vector4(vert.x, vert.y, vert.z, 1.0); // w=1 for position!

        // Varying setup
        this.vertexToFragmentData.uv[jvert] = this.model.getUV(iface, jvert);
        this.vertexToFragmentData.normals[jvert] =
            Matrix4x4.multiplyWithMatrix(this.modelViewMatrix.invertTranspose()!, vec4Normal).normalize();

        const gl_Position = Matrix4x4.multiplyWithMatrix(this.modelViewMatrix, vec4Vert);
        this.vertexToFragmentData.tri[jvert] = gl_Position;
        // Project to clip space
        return Matrix4x4.multiplyWithMatrix(this.projectionMatrix, gl_Position);
    }

    fragment(bc_clip: Vector3): RGBA {
        // Interpolate normal
        const n = this.vertexToFragmentData.normals[0]
            .scale(bc_clip.x)
            .add(this.vertexToFragmentData.normals[1].scale(bc_clip.y))
            .add(this.vertexToFragmentData.normals[2].scale(bc_clip.z))
            .normalize();

        const l = this.lightDirection.normalize();
        const v = new Vector4(0, 0, -1, 0);
        const dotNL = Math.max(0, n.dot(l));
        const r = n.scale(2 * dotNL).sub(l).normalize();

        const ambient = 0.3;
        const diffuse = 0.7 * dotNL;
        const specular = 0.5 * Math.pow(Math.max(r.dot(v), 0), 35.0);

        const intensity = Math.min(1.0, ambient + diffuse + specular);
        const baseColor = { r: 255, g: 255, b: 255 };

        return {
            r: Math.min(255, baseColor.r * intensity),
            g: Math.min(255, baseColor.g * intensity),
            b: Math.min(255, baseColor.b * intensity),
            a: 255
        };
    }

    // fragment(bc_clip: Vector3): RGBA {
    //     const { tri, normals, uv } = this.vertexToFragmentData;

    //     // --- E: edges of the triangle in screen/eye space ---
    //     const E1 = VectorMath.sub(tri[1], tri[0]);
    //     const E2 = VectorMath.sub(tri[2], tri[0]);

    //     // --- U: edges of the triangle in UV space ---
    //     const U1 = VectorMath.sub2(uv[1], uv[0]);
    //     const U2 = VectorMath.sub2(uv[2], uv[0]);

    //     // 2×4 matrix T = U⁻¹ * E (tangent & bitangent)
    //     const det = U1.x * U2.y - U2.x * U1.y;
    //     if (Math.abs(det) < 1e-5) return { r: 0, g: 0, b: 0, a: 255 }; // degenerate UVs
    //     const inv = 1.0 / det;

    //     // Tangent (x-axis in texture space)
    //     const T = new Vector4(
    //         (U2.y * E1.x - U1.y * E2.x) * inv,
    //         (U2.y * E1.y - U1.y * E2.y) * inv,
    //         (U2.y * E1.z - U1.y * E2.z) * inv,
    //         0
    //     );

    //     // Bitangent (y-axis in texture space)
    //     const B = new Vector4(
    //         (-U2.x * E1.x + U1.x * E2.x) * inv,
    //         (-U2.x * E1.y + U1.x * E2.y) * inv,
    //         (-U2.x * E1.z + U1.x * E2.z) * inv,
    //         0
    //     );

    //     // --- Interpolated normal in eye space ---
    //     const n0 = normals[0];
    //     const n1 = normals[1];
    //     const n2 = normals[2];
    //     const interpolatedNormal = VectorMath.add(
    //         VectorMath.add(
    //             VectorMath.mulScalar3(n0, bc_clip.x),
    //             VectorMath.mulScalar3(n1, bc_clip.y)
    //         ),
    //         VectorMath.mulScalar3(n2, bc_clip.z)
    //     ).normalize();

    //     // Build Darboux frame matrix D
    //     // (Tangent, Bitangent, Normal)
    //     const D = new Matrix4x4([
    //         T.x, B.x, interpolatedNormal.x, 0,
    //         T.y, B.y, interpolatedNormal.y, 0,
    //         T.z, B.z, interpolatedNormal.z, 0,
    //         0,   0,   0,                   1
    //     ]);

    //     // --- Interpolated UV ---
    //     const interpUV = new Vector2(
    //         uv[0].x * bc_clip.x + uv[1].x * bc_clip.y + uv[2].x * bc_clip.z,
    //         uv[0].y * bc_clip.x + uv[1].y * bc_clip.y + uv[2].y * bc_clip.z
    //     );

    //     // --- Normal from normal map ---
    //     // Assuming model.normal(uv) returns Vector4 in tangent space
    //     // let n = this.model.getNormalFromMap(interpUV); // e.g., RGB→[-1,1]
    //     // n = Matrix4x4.multiplyWithMatrix(D.transpose(), n).normalize();

    //     let n = interpolatedNormal;
    //     // --- Lighting ---
    //     const l = this.lightDirection;
    //     const r = VectorMath.sub(VectorMath.mulScalar3(n, 2 * VectorMath.dot3(n, l)), l).normalize();

    //     const ambient = 0.4;
    //     const diffuse = Math.max(0, VectorMath.dot3(n, l));
    //     const specularFactor = Math.pow(Math.max(r.z, 0), 35); // viewer = (0,0,1)
    //     const specular = (0.5 + 2.0 * this.model.sampleSpecular(interpUV)[0] / 255.0) * specularFactor;

    //     // --- Sample base color (diffuse texture) ---
    //     const baseColor = this.model.sampleDiffuse(interpUV); // [r,g,b]
    //     const lighting = ambient + diffuse + specular;

    //     return {
    //         r: Math.min(255, baseColor.r * lighting),
    //         g: Math.min(255, baseColor.g * lighting),
    //         b: Math.min(255, baseColor.b * lighting),
    //         a: 255
    //     };
    // }
}