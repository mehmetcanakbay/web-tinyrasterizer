import { Matrix, Vector2, Vector4, type Vector3 } from "./math";
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
    modelViewMatrix: Matrix;
    projectionMatrix: Matrix;
    lightDirection: Vector4;
    vertexToFragmentData!: varyingData;
    normalMatrix: Matrix;

    constructor(model: ObjModel, modelViewMatrix: Matrix, lightDir: Vector3, projectionMatrix: Matrix) {
        super();
        this.model = model;
        this.modelViewMatrix = modelViewMatrix;
        this.projectionMatrix = projectionMatrix;
        this.lightDirection = modelViewMatrix
            .multiplyVector4(new Vector4(lightDir.x, lightDir.y, lightDir.z, 0.0))
            .normalize();

        this.normalMatrix = this.modelViewMatrix.invertTranspose()!
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
        const vec4Vert = new Vector4(vert.x, vert.y, vert.z, 1.0);
        // Varying setup
        this.vertexToFragmentData.uv[jvert] = this.model.getUV(iface, jvert);
        this.vertexToFragmentData.normals[jvert] = this.normalMatrix.multiplyVector4(vec4Normal.normalize()).toVec3()
        const gl_Position = this.modelViewMatrix.multiplyVector4(vec4Vert);
        this.vertexToFragmentData.tri[jvert] = gl_Position.toVec3();

        // Project to clip space
        return this.projectionMatrix.multiplyVector4(gl_Position);
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
        const dotNL = Math.max(0, n.dot(l.toVec3()));
        const r = n.scale(2 * dotNL).sub(l.toVec3()).normalize();

        const ambient = 0.3;
        const diffuse = 0.7 * dotNL;
        const specular = 0.5 * Math.pow(Math.max(r.dot(v.toVec3()), 0), 35.0);

        const intensity = Math.min(1.0, ambient + diffuse + specular);
        const baseColor = { r: 255, g: 255, b: 255 };

        return {
            r: Math.min(255, baseColor.r * intensity),
            g: Math.min(255, baseColor.g * intensity),
            b: Math.min(255, baseColor.b * intensity),
            a: 255
        };
    }
}