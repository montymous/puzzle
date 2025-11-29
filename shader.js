const canvas = document.getElementById("shaderCanvas");
const gl = canvas.getContext("webgl2", { alpha: true });

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// resize canvas
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// vertex shader (simple passthrough)
const vsSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

// fragment shader (your shader code)
const fsSource = `
precision mediump float;

uniform float iTime;
uniform vec2 iResolution;

// helper functions
float distLine(vec2 p, vec2 a, vec2 b){
    vec2 ap = p - a;
    vec2 ab = b - a;
    float aDotB = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
    return length(ap - ab * aDotB);
}

float drawLine(vec2 uv, vec2 a, vec2 b){
    float line = smoothstep(0.014, 0.01, distLine(uv, a, b));
    float dist = length(b-a);
    return line * (smoothstep(1.3,0.8,dist)*0.5 + smoothstep(0.04,0.03,abs(dist-0.75)));
}

float n21(vec2 i){
    i += fract(i * vec2(223.64, 823.12));
    i += dot(i, i + 23.14);
    return fract(i.x*i.y);
}

vec2 n22(vec2 i){
    float x = n21(i);
    return vec2(x, n21(i+x));
}

vec2 getPoint(vec2 id, vec2 offset){
    return offset + sin(n22(id + offset) * iTime) * 0.4;
}

float layer(vec2 uv){
    float m = 0.0;
    float t = iTime * 2.0;

    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv) - 0.5;

    vec2 p0 = getPoint(id, vec2(-1.0, -1.0));
    vec2 p1 = getPoint(id, vec2(0.0, -1.0));
    vec2 p2 = getPoint(id, vec2(1.0, -1.0));
    vec2 p3 = getPoint(id, vec2(-1.0, 0.0));
    vec2 p4 = getPoint(id, vec2(0.0, 0.0));
    vec2 p5 = getPoint(id, vec2(1.0, 0.0));
    vec2 p6 = getPoint(id, vec2(-1.0, 1.0));
    vec2 p7 = getPoint(id, vec2(0.0, 1.0));
    vec2 p8 = getPoint(id, vec2(1.0, 1.0));

    // only draw lines, no sparkles
    m += drawLine(gv, p4, p0);
    m += drawLine(gv, p4, p1);
    m += drawLine(gv, p4, p2);
    m += drawLine(gv, p4, p3);
    m += drawLine(gv, p4, p5);
    m += drawLine(gv, p4, p6);
    m += drawLine(gv, p4, p7);
    m += drawLine(gv, p4, p8);

    // cross lines
    m += drawLine(gv, p1,p3);
    m += drawLine(gv, p1,p5);
    m += drawLine(gv, p7,p3);
    m += drawLine(gv, p7,p5);

    return m;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec3 c = sin(iTime*2.0 * vec3(0.234,0.324,0.768)) * 0.4 + 0.6;
    vec3 col = vec3(0.0);

    float fft = 0.5; // placeholder

    c.x += uv.x + 0.5;
    col += pow(-uv.y + 0.5, 5.0) * fft * c;

    float m = 0.0;
    mat2 rotMat = mat2(sin(iTime*0.1), cos(iTime*0.2), -cos(iTime*0.2), sin(iTime*0.1));
    uv *= rotMat;

    for(float i=0.0;i<=1.0;i+=1.0/4.0){
        float z = fract(i + iTime*0.05);
        float size = mix(15.0,0.1,z)*1.5;
        float fade = smoothstep(0.0,1.0,z)*smoothstep(1.0,0.9,z);
        m += layer(uv*size + i*10.0)*fade;
    }

    col += m*c;

    gl_FragColor = vec4(col, 0.05); // 0.0 = fully transparent, 1.0 = opaque
}
`;

// compile shader function
function compileShader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
	}
	return shader;
}

// setup program
const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER);
const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// setup fullscreen quad
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// get uniform locations
const iTimeLocation = gl.getUniformLocation(program, "iTime");
const iResolutionLocation = gl.getUniformLocation(program, "iResolution");

// render loop
let start = performance.now();
function render() {
	const now = performance.now();
	const iTime = (now - start) / 1000;
	gl.uniform1f(iTimeLocation, iTime);
	gl.uniform2f(iResolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	requestAnimationFrame(render);
}
render();
