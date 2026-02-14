import { Vector2, Vector3 } from "./math";

interface Face {
    v: number[];      // vertex indices
    vt?: number[];    // texcoord indices
    vn?: number[];    // normal indices
}

function computeVertexNormals(vertices: Vector3[], faces: Face[]): Vector3[] {
    const normals: Vector3[] = Array.from(
        { length: vertices.length },
        () => new Vector3(0, 0, 0)
    );

    for (const face of faces) {
        const v0 = vertices[face.v[0]];
        const v1 = vertices[face.v[1]];
        const v2 = vertices[face.v[2]];

        const edge1 = v1.sub(v0);
        const edge2 = v2.sub(v0);
        const faceNormal = edge1.cross(edge2);

        for (const vi of face.v) {
            normals[vi] = normals[vi].add(faceNormal);
        }
    }

    return normals.map(n => {
        const len = Math.hypot(n.x, n.y, n.z);
        return new Vector3(n.x / len, n.y / len, n.z / len);
    });
}

export function parseOBJ(data: string): ObjModel {
    const vertices: Vector3[] = [];
    const texCoords: Vector2[] = [];
    const normals: Vector3[] = [];
    const faces: Face[] = [];

    const lines = data.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const parts = trimmed.split(/\s+/);
        const prefix = parts[0];

        switch (prefix) {
            case "v": {
                vertices.push(
                    new Vector3(
                        +parts[1],
                        +parts[2],
                        +parts[3]
                    )
                );
                break;
            }

            case "vt": {
                texCoords.push(
                    new Vector2(
                        +parts[1],
                        1 - +parts[2]
                    )
                );
                break;
            }

            case "vn": {
                const x = +parts[1];
                const y = +parts[2];
                const z = +parts[3];

                const len = Math.hypot(x, y, z) || 1;

                normals.push(
                    new Vector3(
                        x / len,
                        y / len,
                        z / len
                    )
                );
                break;
            }

            case "f": {
                const v: number[] = [];
                const vt: number[] = [];
                const vn: number[] = [];

                for (const token of parts.slice(1)) {
                    const [vi, vti, vni] = token.split("/");

                    if (vi) v.push(parseInt(vi) - 1);
                    if (vti) vt.push(parseInt(vti) - 1);
                    if (vni) vn.push(parseInt(vni) - 1);
                }

                if (v.length < 3) break;

                for (let i = 1; i < v.length - 1; i++) {
                    faces.push({
                        v: [v[0], v[i], v[i + 1]],
                        vt: vt.length ? [vt[0], vt[i], vt[i + 1]] : undefined,
                        vn: vn.length ? [vn[0], vn[i], vn[i + 1]] : undefined,
                    });
                }

                break;
            }
        }
    }

    if (normals.length === 0) {
        const computed = computeVertexNormals(vertices, faces);
        normals.push(...computed);

        for (const face of faces) {
            face.vn = [...face.v];
        }
    }

    let min = new Vector3(Infinity, Infinity, Infinity);
    let max = new Vector3(-Infinity, -Infinity, -Infinity);

    for (const v of vertices) {
        min = new Vector3(
            Math.min(min.x, v.x),
            Math.min(min.y, v.y),
            Math.min(min.z, v.z)
        );

        max = new Vector3(
            Math.max(max.x, v.x),
            Math.max(max.y, v.y),
            Math.max(max.z, v.z)
        );
    }

    const center = min.add(max).scale(0.5);
    const size = max.sub(min);
    const maxExtent = Math.max(size.x, size.y, size.z);
    const scale = maxExtent > 0 ? 1.0 / maxExtent : 1.0;

    for (let i = 0; i < vertices.length; i++) {
        vertices[i] = vertices[i]
            .sub(center)
            .scale(scale);
    }


    return new ObjModel(vertices, texCoords, normals, faces);
}

export class ObjModel {
    constructor(
        public vertices: Vector3[],
        public texCoords: Vector2[],
        public normals: Vector3[],
        public faces: Face[]
    ) { }

    nfaces(): number {
        return this.faces.length;
    }

    nvertices(): number {
        return this.vertices.length;
    }

    getVert(i: number): Vector3;
    getVert(iface: number, jvert: number): Vector3;
    getVert(i: number, jvert?: number): Vector3 {
        if (jvert === undefined) {
            return this.vertices[i];
        }
        return this.vertices[this.faces[i].v[jvert]];
    }

    getUV(iface: number, jvert: number): Vector2 {
        const face = this.faces[iface];

        if (!face.vt || face.vt[jvert] === undefined) {
            // Return default UV if model has none
            return new Vector2(0, 0);
        }

        return this.texCoords[face.vt[jvert]];
    }

    getNormal(iface: number, jvert: number): Vector3 {
        const face = this.faces[iface];
        if (!face.vn) throw new Error("No normals");
        return this.normals[face.vn[jvert]];
    }

    sampleDiffuse(_uv: Vector2) {
        return { r: 128, g: 128, b: 128, a: 255 };
    }
}
