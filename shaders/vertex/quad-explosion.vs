/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/**

- a_triangleCoord should be an ivec3 not a vec3?
- do not 'separate' the quads. Keep together.
*/

precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;
attribute vec3 a_triangleCoord;

uniform mat4 matrix;
uniform float perspective;

uniform vec4 u_meshBox;
uniform vec2 u_tileSize;
uniform vec2 u_meshSize;

uniform mat4 u_projectionMatrix;
uniform vec2 u_textureSize;

uniform float t;
uniform float amount;
uniform float rotateAngleX;
uniform float rotateAngleY;
uniform float rotateAngleZ;

uniform float centerX;
uniform float centerY;

/* Noise used to have the tiles move a little bit when they are out
   of the explosion sphere.
 */
const float noise = 200.0;

/* Aspect ratio */
float ar = u_textureSize.x / u_textureSize.y;

mat4 identity() {
    return mat4(
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.0, 0.0, 0.0, 1.0);
}


mat4 perspectiveMatrix(float p) {
    float perspective = - 1.0 / p;
    return mat4(
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, perspective,
	0.0, 0.0, 0.0, 1.0);
}

mat4 translate(vec3 t) {
    return mat4(
     1.0, 0.0, 0.0, 0.0,
     0.0, 1.0, 0.0, 0.0,
     0.0, 0.0, 1.0, 0.0,
     t.x, t.y, t.z, 1.0);
}

mat4 rotateX(float f) {
    return mat4(
	1.0, 0.0, 0.0, 0.0,
	0.0, cos(f), sin(f), 0.0,
	0.0, -sin(f), cos(f), 0.0,
	0.0, 0.0, 0.0, 1.0);
}

mat4 rotateY(float f) {
    return mat4(
	cos(f), 0.0, -sin(f), 0.0,
	0.0, 1.0, 0.0, 0.0,
	sin(f), 0, cos(f), 0.0,
	0.0, 0.0, 0.0, 1.0);
}

mat4 rotateZ(float f) {
    return mat4(
     cos(f), sin(f), 0.0, 0.0,
     -sin(f), cos(f), 0.0, 0.0,
     0.0, 0.0, 1.0, 0.0,
     0.0, 0.0, 0.0, 1.0);
}

mat4 scale(vec3 f) {
    return mat4(
     f.x, 0.0, 0.0, 0.0,
     0.0, f.y, 0.0, 0.0,
     0.0, 0.0, f.z, 0.0,
     0.0, 0.0, 0.0, 1.0);
}

mat4 rotate(vec3 a) {
    return rotateX(a.x) * rotateY(a.y) * rotateZ(a.z);
}

/**
 * Random function based on the tile coordinate. This will return the same value
 * for all the vertices in the same tile (i.e., two triangles)
 */
float random(vec2 scale) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(vec2(a_triangleCoord.x, a_triangleCoord.y), scale)) * 4000.0);
}

/**
 * This effect is using a center point for an 'explosion' effect. The further a point is from the
 * center, the more it moves along the x and y axis, radially. The closer to the explosion, the move
 * the point moves along the z axis.
 */
void main()
{
    // r is dependent on the tile coordinates.
    float r = random(vec2(10.0, 80.0));

    // Tile transform
    mat4 ttfx = identity();

    // R is the explosion sphere radius
    float p = 2.0 * t;
    if (p > 1.0) {
        p = 2.0 - p;
    }

    float R2 = p * max(u_textureSize.x, u_textureSize.y);
    R2 *= R2;

    float dx = abs(centerX - a_meshCoord.x) * u_textureSize.x;
    float dy = abs(centerY - a_meshCoord.y) * u_textureSize.y;
    float d2 = dx * dx + dy * dy;

    // Find the tile center.
    vec3 trc = vec3(u_meshBox.x + u_tileSize.x * (a_triangleCoord.x + 0.5),
                    u_meshBox.y + u_tileSize.y * (a_triangleCoord.y + 0.5),
                    0.0);

    // Rotate about the tile center along the z-axis
    ttfx = translate(trc) *
           rotate(radians(vec3(rotateAngleX * r * p, 2.0 * rotateAngleY * r * p, 0.5 * r * p * rotateAngleZ))) *
           translate(-trc);

    ttfx = translate(vec3(0.0, 0.0, p * amount * sqrt(abs(R2 - d2)) * (0.8 + 0.4 * r))) * ttfx;
    ttfx = translate(vec3(0.0, 0.0, (-0.5 + r) * noise * p)) * ttfx;

    gl_Position = u_projectionMatrix * perspectiveMatrix(perspective) * matrix * ttfx * a_position;
}
