export class Vector3 {
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    add(v: Vector3): Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v: Vector3): Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    scale(scalar: number): Vector3 {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    normalize(): Vector3 {
        const len = this.length;
        return len === 0 ? new Vector3(0, 0, 0) : new Vector3(this.x / len, this.y / len, this.z / len);
    }

    // --- NEW METHODS ---
    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    equals(v: Vector3): boolean {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    static zero(): Vector3 {
        return new Vector3(0, 0, 0);
    }
}


export class Vector2 {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}


export class Vector4 extends Vector3 {
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public w: number = 0;

    constructor(x: number, y: number, z: number, w: number) {
        super(x, y, z);

        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    normalize(): Vector4 {
        const len = this.length;
        return len === 0 ? new Vector4(0, 0, 0, 0) : new Vector4(this.x / len, this.y / len, this.z / len, this.w / len);
    }

    perspectiveDivide(): Vector3 {
        return new Vector3(
            this.x / this.w,
            this.y / this.w,
            this.z / this.w
        )
    }
}

export class Matrix4x4 {
    public elements: number[];

    constructor(elements?: number[]) {
        this.elements = elements ?? Matrix4x4.identity().elements;
    }

    static identity(): Matrix4x4 {
        return new Matrix4x4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static fromRows(r0: number[], r1: number[], r2: number[], r3: number[]): Matrix4x4 {
        return new Matrix4x4([
            ...r0,
            ...r1,
            ...r2,
            ...r3
        ]);
    }

    static multiply(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
        const ae = a.elements;
        const be = b.elements;
        const te: number[] = new Array(16).fill(0);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                let sum = 0;
                for (let i = 0; i < 4; i++) {
                    sum += ae[row * 4 + i] * be[i * 4 + col];
                }
                te[row * 4 + col] = sum;
            }
        }

        return new Matrix4x4(te);
    }

    static multiplyWithMatrix(a: Matrix4x4, v: Vector4): Vector4 {
        const e = a.elements;

        const x = e[0] * v.x + e[1] * v.y + e[2] * v.z + e[3] * v.w;
        const y = e[4] * v.x + e[5] * v.y + e[6] * v.z + e[7] * v.w;
        const z = e[8] * v.x + e[9] * v.y + e[10] * v.z + e[11] * v.w;
        const w = e[12] * v.x + e[13] * v.y + e[14] * v.z + e[15] * v.w;

        return new Vector4(x, y, z, w);
    }

    get(row: number, col: number): number {
        return this.elements[row * 4 + col];
    }

    set(row: number, col: number, value: number): void {
        this.elements[row * 4 + col] = value;
    }

    //ew... thanks gpt
    invert(): Matrix4x4 | null {
        const m = this.elements;
        const inv = new Array(16);

        inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15]
            + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
        inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15]
            - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
        inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15]
            + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14]
            - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
        inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15]
            - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
        inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15]
            + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15]
            - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14]
            + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15]
            + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15]
            - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15]
            + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14]
            - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11]
            - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11]
            + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11]
            - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10]
            + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

        let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

        if (det === 0) return null;

        det = 1.0 / det;
        for (let i = 0; i < 16; i++) inv[i] *= det;

        return new Matrix4x4(inv);
    }

    transpose(): Matrix4x4 {
        const e = this.elements;
        const t = new Array(16);

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                t[r * 4 + c] = e[c * 4 + r];
            }
        }

        return new Matrix4x4(t);
    }

    invertTranspose(): Matrix4x4 | null {
        const inv = this.invert();
        if (!inv) return null;

        const e = inv.elements;
        const t = new Array(16);

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                t[c * 4 + r] = e[r * 4 + c]; // transpose
            }
        }

        return new Matrix4x4(t);
    }
}

export class VectorMath {
    public static cross(v1: Vector3, v2: Vector3): Vector3 {
        const crossProduct: Vector3 = new Vector3(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        )

        return crossProduct;
    }

    public static divScalar(v1: Vector4, scalar: number): Vector4 {
        return new Vector4(
            v1.x / scalar,
            v1.y / scalar,
            v1.z / scalar,
            v1.w / scalar,
        )
    }

    public static lengthvec4(vector: Vector4): number {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z + vector.w * vector.w);
    }

    public static zero2(): Vector2 { return new Vector2(0, 0); }
    public static zero3(): Vector3 { return new Vector3(0, 0, 0); }
    public static zero4(): Vector4 { return new Vector4(0, 0, 0, 0); }

    // ====== ADDITION ======
    public static add(v1: Vector3, v2: Vector3): Vector3 {
        return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    public static add2(v1: Vector2, v2: Vector2): Vector2 {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    public static add4(v1: Vector4, v2: Vector4): Vector4 {
        return new Vector4(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, v1.w + v2.w);
    }

    // ====== SUBTRACTION ======
    public static sub(v1: Vector3, v2: Vector3): Vector3 {
        return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    public static sub2(v1: Vector2, v2: Vector2): Vector2 {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    public static sub4(v1: Vector4, v2: Vector4): Vector4 {
        return new Vector4(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z, v1.w - v2.w);
    }

    // ====== MULTIPLICATION ======
    public static mulScalar3(v: Vector3, s: number): Vector3 {
        return new Vector3(v.x * s, v.y * s, v.z * s);
    }

    public static mulScalar4(v: Vector4, s: number): Vector4 {
        return new Vector4(v.x * s, v.y * s, v.z * s, v.w * s);
    }

    // ====== DIVISION ======
    public static div(v1: Vector3, v2: Vector3): Vector3 {
        return new Vector3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }

    public static divScalar3(v1: Vector3, s: number): Vector3 {
        return new Vector3(v1.x / s, v1.y / s, v1.z / s);
    }

    public static divScalar4(v1: Vector4, s: number): Vector4 {
        return new Vector4(v1.x / s, v1.y / s, v1.z / s, v1.w / s);
    }

    // ====== DOT & CROSS ======
    public static dot3(v1: Vector3, v2: Vector3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    public static dot4(v1: Vector4, v2: Vector4): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
    }
}

export class TransformationsMath {
    public static lookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix4x4 {
        const n = VectorMath.sub(eye, center).normalize()
        const l = VectorMath.cross(up, n).normalize()
        const m = VectorMath.cross(n, l).normalize()

        return Matrix4x4.multiply(
            Matrix4x4.fromRows(
                [l.x, l.y, l.z, 0],
                [m.x, m.y, m.z, 0],
                [n.x, n.y, n.z, 0],
                [0, 0, 0, 1]
            ),
            Matrix4x4.fromRows(
                [1, 0, 0, -eye.x],
                [0, 1, 0, -eye.y],
                [0, 0, 1, -eye.z],
                [0, 0, 0, 1]
            ),
        )
    }


    public static viewport(x: number, y: number, w: number, h: number): Matrix4x4 {
        return Matrix4x4.fromRows(
            [w / 2, 0, 0, x + w / 2],
            [0, -h / 2, 0, y + h / 2],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        );
    }
    public static projectionFOV(fovDegrees: number, aspect: number, near: number, far: number): Matrix4x4 {
        const fovRad = (fovDegrees * Math.PI) / 180;
        const f = 1.0 / Math.tan(fovRad / 2);

        return Matrix4x4.fromRows(
            [f / aspect, 0, 0, 0],
            [0, f, 0, 0],
            [0, 0, (far + near) / (near - far), (2 * far * near) / (near - far)],
            [0, 0, -1, 0]
        );
    }
}

//////////////////GOATGPT OUTPUT
export class Matrix {
    readonly rows: number;
    readonly cols: number;
    public elements: number[];

    constructor(rows: number, cols: number, elements?: number[]) {
        this.rows = rows;
        this.cols = cols;
        this.elements = elements ?? Matrix.identity(rows, cols).elements;

        if (this.elements.length !== rows * cols) {
            throw new Error(`Expected ${rows * cols} elements, got ${this.elements.length}`);
        }
    }

    // Identity (only square)
    static identity(n: number, m?: number): Matrix {
        const rows = n;
        const cols = m ?? n;
        const elements = new Array(rows * cols).fill(0);
        const diag = Math.min(rows, cols);
        for (let i = 0; i < diag; i++) elements[i * cols + i] = 1;
        return new Matrix(rows, cols, elements);
    }

    static fromRows(...rows: number[][]): Matrix {
        if (rows.length === 0) throw new Error("No rows provided");
        const cols = rows[0].length;
        for (const r of rows) {
            if (r.length !== cols)
                throw new Error("All rows must have the same length");
        }
        return new Matrix(rows.length, cols, rows.flat());
    }

    get(row: number, col: number): number {
        return this.elements[row * this.cols + col];
    }

    set(row: number, col: number, value: number): void {
        this.elements[row * this.cols + col] = value;
    }

    clone(): Matrix {
        return new Matrix(this.rows, this.cols, [...this.elements]);
    }

    // Matrix multiplication
    static multiply(a: Matrix, b: Matrix): Matrix {
        if (a.cols !== b.rows)
            throw new Error("Matrix dimension mismatch");

        const te = new Array(a.rows * b.cols).fill(0);

        for (let row = 0; row < a.rows; row++) {
            for (let col = 0; col < b.cols; col++) {
                let sum = 0;
                for (let i = 0; i < a.cols; i++) {
                    sum += a.get(row, i) * b.get(i, col);
                }
                te[row * b.cols + col] = sum;
            }
        }

        return new Matrix(a.rows, b.cols, te);
    }

    // Transpose
    transpose(): Matrix {
        const result = new Array(this.rows * this.cols);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                result[c * this.rows + r] = this.get(r, c);
            }
        }
        return new Matrix(this.cols, this.rows, result);
    }

    // Determinant (recursive Laplace expansion)
    det(): number {
        if (this.rows !== this.cols)
            throw new Error("Determinant is only defined for square matrices");

        const n = this.rows;
        if (n === 1) return this.elements[0];
        if (n === 2)
            return this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0);

        let total = 0;
        for (let col = 0; col < n; col++) {
            total += this.get(0, col) * this.cofactor(0, col);
        }
        return total;
    }

    // Cofactor
    cofactor(row: number, col: number): number {
        const sub = new Matrix(this.rows - 1, this.cols - 1);
        let idx = 0;

        for (let i = 0; i < this.rows; i++) {
            if (i === row) continue;
            for (let j = 0; j < this.cols; j++) {
                if (j === col) continue;
                sub.elements[idx++] = this.get(i, j);
            }
        }

        const sign = (row + col) % 2 === 0 ? 1 : -1;
        return sign * sub.det();
    }

    // Invert (via adjugate)
    invert(): Matrix | null {
        if (this.rows !== this.cols)
            throw new Error("Matrix must be square to invert");

        const n = this.rows;

        // Build adjugate TRANSPOSE directly
        const adjT = new Matrix(n, n);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                adjT.set(i, j, this.cofactor(i, j));
            }
        }

        // Determinant = adjT first row · original first row
        let det = 0;
        for (let j = 0; j < n; j++) {
            det += adjT.get(0, j) * this.get(0, j);
        }

        if (det === 0) return null;

        // Divide adjugate transpose by determinant
        const invElems = adjT.elements.map(v => v / det);
        return new Matrix(n, n, invElems);
    }


    invertTranspose(): Matrix | null {
        const inv = this.invert();
        if (!inv) return null;
        return inv.transpose();
    }

    // Pretty-print
    toString(): string {
        let str = "";
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push(this.get(r, c).toFixed(3));
            }
            str += `[${row.join(" ")}]\n`;
        }
        return str;
    }

    multiplyVector2(v: Vector2): Vector2 {
        if (this.cols < 2 || this.rows < 2)
            throw new Error("Matrix must be at least 2x2 to multiply with Vector2");

        const x = this.get(0, 0) * v.x + this.get(0, 1) * v.y + (this.cols > 2 ? this.get(0, 2) : 0);
        const y = this.get(1, 0) * v.x + this.get(1, 1) * v.y + (this.cols > 2 ? this.get(1, 2) : 0);
        return new Vector2(x, y);
    }

    multiplyVector3(v: Vector3): Vector3 {
        if (this.cols < 3 || this.rows < 3)
            throw new Error("Matrix must be at least 3x3 to multiply with Vector3");

        const x = this.get(0, 0) * v.x + this.get(0, 1) * v.y + this.get(0, 2) * v.z + (this.cols > 3 ? this.get(0, 3) : 0);
        const y = this.get(1, 0) * v.x + this.get(1, 1) * v.y + this.get(1, 2) * v.z + (this.cols > 3 ? this.get(1, 3) : 0);
        const z = this.get(2, 0) * v.x + this.get(2, 1) * v.y + this.get(2, 2) * v.z + (this.cols > 3 ? this.get(2, 3) : 0);
        return new Vector3(x, y, z);
    }
}