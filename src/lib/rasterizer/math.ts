export class Vector2 {
    constructor(
        public readonly x: number = 0,
        public readonly y: number = 0
    ) { }

    get length(): number {
        return Math.hypot(this.x, this.y);
    }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    scale(s: number): Vector2 {
        return new Vector2(this.x * s, this.y * s);
    }

    normalize(): Vector2 {
        const len = this.length;
        return len === 0 ? new Vector2() : this.scale(1 / len);
    }

    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    static zero(): Vector2 {
        return new Vector2(0, 0);
    }
}

export class Vector3 {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0
    ) { }

    get length(): number {
        return Math.hypot(this.x, this.y, this.z);
    }

    add(v: Vector3): Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v: Vector3): Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    scale(s: number): Vector3 {
        return new Vector3(this.x * s, this.y * s, this.z * s);
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    normalize(): Vector3 {
        const len = this.length;
        return len === 0 ? new Vector3() : this.scale(1 / len);
    }

    static zero(): Vector3 {
        return new Vector3(0, 0, 0);
    }
}

export class Vector4 {
    constructor(
        public readonly x: number = 0,
        public readonly y: number = 0,
        public readonly z: number = 0,
        public readonly w: number = 0
    ) { }

    get length(): number {
        return Math.hypot(this.x, this.y, this.z, this.w);
    }

    normalize(): Vector4 {
        const len = this.length;
        return len === 0 ? new Vector4() : this.scale(1 / len);
    }

    scale(s: number): Vector4 {
        return new Vector4(
            this.x * s,
            this.y * s,
            this.z * s,
            this.w * s
        );
    }

    perspectiveDivide(): Vector3 {
        return new Vector3(
            this.x / this.w,
            this.y / this.w,
            this.z / this.w
        );
    }

    static fromVector3(v: Vector3, w: number = 1): Vector4 {
        return new Vector4(v.x, v.y, v.z, w);
    }

    toVec3() {
        return new Vector3(this.x, this.y, this.z)
    }
}
export class Matrix {
    constructor(
        public readonly rows: number,
        public readonly cols: number,
        public readonly elements: number[]
    ) {
        if (elements.length !== rows * cols) {
            throw new Error("Invalid element count");
        }
    }

    static identity(size: number): Matrix {
        const e = new Array(size * size).fill(0);
        for (let i = 0; i < size; i++) {
            e[i * size + i] = 1;
        }
        return new Matrix(size, size, e);
    }

    static fromRows(...rows: number[][]): Matrix {
        const r = rows.length;
        const c = rows[0].length;
        return new Matrix(r, c, rows.flat());
    }

    get(r: number, c: number): number {
        return this.elements[r * this.cols + c];
    }

    multiply(b: Matrix): Matrix {
        if (this.cols !== b.rows)
            throw new Error("Matrix dimension mismatch");

        const result = new Array(this.rows * b.cols).fill(0);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < b.cols; c++) {
                let sum = 0;
                for (let i = 0; i < this.cols; i++) {
                    sum += this.get(r, i) * b.get(i, c);
                }
                result[r * b.cols + c] = sum;
            }
        }

        return new Matrix(this.rows, b.cols, result);
    }

    transpose(): Matrix {
        const result = new Array(this.rows * this.cols);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                result[c * this.rows + r] = this.get(r, c);
            }
        }
        return new Matrix(this.cols, this.rows, result);
    }

    multiplyVector4(v: Vector4): Vector4 {
        if (this.rows !== 4 || this.cols !== 4)
            throw new Error("Matrix must be 4x4");

        const e = this.elements;

        return new Vector4(
            e[0] * v.x + e[1] * v.y + e[2] * v.z + e[3] * v.w,
            e[4] * v.x + e[5] * v.y + e[6] * v.z + e[7] * v.w,
            e[8] * v.x + e[9] * v.y + e[10] * v.z + e[11] * v.w,
            e[12] * v.x + e[13] * v.y + e[14] * v.z + e[15] * v.w
        );
    }

    multiplyVector3(v: Vector3): Vector3 {
        if (this.rows !== 3 || this.cols !== 3)
            throw new Error("Matrix must be 3x3");

        return new Vector3(
            this.get(0, 0) * v.x + this.get(0, 1) * v.y + this.get(0, 2) * v.z,
            this.get(1, 0) * v.x + this.get(1, 1) * v.y + this.get(1, 2) * v.z,
            this.get(2, 0) * v.x + this.get(2, 1) * v.y + this.get(2, 2) * v.z
        );
    }


    invert(): Matrix | null {
        if (this.rows !== this.cols) {
            throw new Error("Matrix must be square to invert");
        }

        const n = this.rows;
        const determinant = this.det();

        if (determinant === 0) return null;

        const adjugateElements = new Array(n * n);

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                // Note the transpose here (c, r)
                adjugateElements[c * n + r] = this.cofactor(r, c);
            }
        }

        // Divide by determinant
        for (let i = 0; i < adjugateElements.length; i++) {
            adjugateElements[i] /= determinant;
        }

        return new Matrix(n, n, adjugateElements);
    }


    invertTranspose(): Matrix | null {
        const inv = this.invert();
        if (!inv) return null;
        return inv.transpose();
    }

    det(): number {
        if (this.rows !== this.cols) {
            throw new Error("Determinant is only defined for square matrices");
        }

        const n = this.rows;

        // 1x1
        if (n === 1) {
            return this.elements[0];
        }

        // 2x2
        if (n === 2) {
            return (
                this.get(0, 0) * this.get(1, 1) -
                this.get(0, 1) * this.get(1, 0)
            );
        }

        // NxN (Laplace expansion along first row)
        let total = 0;

        for (let col = 0; col < n; col++) {
            total += this.get(0, col) * this.cofactor(0, col);
        }

        return total;
    }

    private cofactor(row: number, col: number): number {
        const subElements: number[] = [];

        for (let r = 0; r < this.rows; r++) {
            if (r === row) continue;

            for (let c = 0; c < this.cols; c++) {
                if (c === col) continue;
                subElements.push(this.get(r, c));
            }
        }

        const subMatrix = new Matrix(
            this.rows - 1,
            this.cols - 1,
            subElements
        );

        const sign = (row + col) % 2 === 0 ? 1 : -1;
        return sign * subMatrix.det();
    }


}
export class Transformations {

    static lookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix {
        const n = eye.sub(center).normalize();
        const l = up.cross(n).normalize();
        const m = n.cross(l);

        return Matrix.fromRows(
            [l.x, l.y, l.z, -l.dot(eye)],
            [m.x, m.y, m.z, -m.dot(eye)],
            [n.x, n.y, n.z, -n.dot(eye)],
            [0, 0, 0, 1]
        );
    }

    static perspective(fov: number, aspect: number, near: number, far: number): Matrix {
        const f = 1 / Math.tan((fov * Math.PI) / 360);

        return Matrix.fromRows(
            [f / aspect, 0, 0, 0],
            [0, f, 0, 0],
            [0, 0, (far + near) / (near - far), (2 * far * near) / (near - far)],
            [0, 0, -1, 0]
        );
    }

    static viewport(x: number, y: number, w: number, h: number): Matrix {
        return Matrix.fromRows(
            [w / 2, 0, 0, x + w / 2],
            [0, -h / 2, 0, y + h / 2],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        );
    }
}
