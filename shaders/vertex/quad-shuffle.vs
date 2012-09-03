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
attribute vec3 a_triangleCoord;

uniform mat4 matrix;
uniform float perspective;

uniform mat4 u_projectionMatrix;
uniform vec2 u_textureSize;

uniform float t;
uniform float amount;

const vec2 u_meshSize = vec2(2.0, 2.0);

float tileWidth = u_textureSize.x / u_meshSize.x;
float tileHeight = u_textureSize.y / u_meshSize.y;

const float maxRotation = 80.0 * 3.14 / 180.0;

mat4 perspectiveMatrix(float p)
{
    float perspective = - 1.0 / p;
    return mat4(
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, perspective,
	0.0, 0.0, 0.0, 1.0);
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
 *
 */
void main()
{
    float r = random(vec2(10.0, 80.0));

    vec4 pos = a_position;

    float dz = -amount * t * r;
    vec3 tc = a_triangleCoord;

    if (mod(tc.x + tc.y, 2.0) == 0.0) {
        dz = amount * t * r;
    }

    pos.z += dz;

    gl_Position = u_projectionMatrix * perspectiveMatrix(perspective) * matrix * pos;

}
