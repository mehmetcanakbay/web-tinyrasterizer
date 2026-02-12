import { Vector2, Vector3, Vector4 } from "./math";

interface Face {
    vertices: Vector3[];
    texCoords?: Vector2[];
    normals?: Vector3[];
}

function computeVertexNormals(vertices: Vector3[], faces: Face[]) {
    // Initialize normals array with zero vectors
    const vertexNormals: Vector3[] = vertices.map(() => new Vector3(0, 0, 0));

    for (const face of faces) {
        if (face.vertices.length < 3) continue;

        const v0 = face.vertices[0];
        const v1 = face.vertices[1];
        const v2 = face.vertices[2];

        // Compute face normal
        const edge1 = v1.sub(v0);
        const edge2 = v2.sub(v0);
        const faceNormal = edge1.cross(edge2).normalize();

        // Add face normal to each vertex normal
        for (let i = 0; i < face.vertices.length; i++) {
            const idx = vertices.indexOf(face.vertices[i]);
            vertexNormals[idx].add(faceNormal);
        }
    }

    // Normalize all vertex normals
    for (const n of vertexNormals) n.normalize();

    // Assign normals to faces
    for (const face of faces) {
        face.normals = face.vertices.map(v => {
            const idx = vertices.indexOf(v);
            return vertexNormals[idx];
        });
    }
}

export function parseOBJ(data: string): ObjModel {
    const vertices: Vector3[] = [];
    const texCoords: Vector2[] = [];
    const normals: Vector3[] = [];
    const faces: Face[] = [];

    const lines = data.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('#')) continue;

        const parts = trimmed.split(/\s+/);
        const prefix = parts[0];

        switch (prefix) {
            case 'v': {
                vertices.push(new Vector3(+parts[1], +parts[2], +parts[3]));
                break;
            }

            case 'vt': {
                texCoords.push(new Vector2(+parts[1], 1 - +parts[2]));
                break;
            }

            case 'vn': {
                const x = +parts[1], y = +parts[2], z = +parts[3];
                const len = Math.hypot(x, y, z);
                normals.push(new Vector3(x / len, y / len, z / len));
                break;
            }

            case 'f': {
                const faceVertices: number[] = [];
                const faceTexCoords: number[] = [];
                const faceNormals: number[] = [];

                for (const token of parts.slice(1)) {
                    const [vIndex, vtIndex, vnIndex] = token
                        .split('/')
                        .map(s => (s ? parseInt(s, 10) - 1 : undefined));

                    if (vIndex !== undefined) faceVertices.push(vIndex);
                    if (vtIndex !== undefined) faceTexCoords.push(vtIndex);
                    if (vnIndex !== undefined) faceNormals.push(vnIndex);
                }

                if (faceVertices.length < 3) continue; // not a valid face

                // Triangulate (fan method)
                for (let i = 1; i < faceVertices.length - 1; i++) {
                    const f: Face = { vertices: [], texCoords: [], normals: [] };

                    const indices = [0, i + 1, i];

                    for (const j of indices) {
                        if (faceVertices[j] !== undefined)
                            f.vertices.push(vertices[faceVertices[j]]);
                        if (faceTexCoords[j] !== undefined)
                            f.texCoords!.push(texCoords[faceTexCoords[j]]);
                        if (faceNormals[j] !== undefined)
                            f.normals!.push(normals[faceNormals[j]]);
                    }

                    faces.push(f);
                }

                break;
            }
        }
    }

    if (normals.length === 0) {
        computeVertexNormals(vertices, faces);
    }

    return new ObjModel(vertices, texCoords, normals, faces);
}


export class ObjModel {
    vertices: Vector3[];
    texCoords: Vector2[];
    normals: Vector3[];
    faces: Face[];

    constructor(vertices: Vector3[], texCoords: Vector2[], normals: Vector3[], faces: Face[]) {
        this.vertices = vertices
        this.texCoords = texCoords
        this.normals = normals
        this.faces = faces
    }

    nfaces() {
        return this.faces.length;
    }

    nvertices() {
        this.vertices.length;
    }

    getVert(i: number): Vector3;
    getVert(iface: number, jvert: number): Vector3;
    getVert(i: number, jvert?: number): Vector3 {
        if (jvert === undefined || jvert === null)
            return this.vertices[i];
        else
            return this.faces[i].vertices[jvert]
    }

    getUV(i: number, jVert: number): Vector2 {
        return this.faces[i].texCoords![jVert];
    }

    getNormal(i: number, jVert: number): Vector3 {
        return this.faces[i].normals![jVert];
    }

    sampleDiffuse(uv: Vector2) {
        return { r: 128, g: 128, b: 128, a: 255 };
    }
}