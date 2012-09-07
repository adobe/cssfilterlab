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

precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;

uniform mat4 u_projectionMatrix;
uniform vec2 u_textureSize;

varying float v_lighting;

uniform mat4 matrix;

uniform float direction;

uniform float mapDepth;
uniform float mapCurve;
uniform float minSpacing;

uniform float t;
uniform float spins;
uniform float phase;
uniform float shadow;

const float PI = 3.1415629;

mat4 perspective(float p)
{
    float perspective = - 1.0 / p;
    return mat4(
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, perspective,
	0.0, 0.0, 0.0, 1.0);
}

void main()
{
    vec4 pos = a_position;
    pos.z = -cos(a_meshCoord.x * PI * 8.0) * mapDepth * t - mapDepth * t / 2.0;

    float scaleX = mix(t - mapCurve, 1.0, sin(a_meshCoord.y * PI * spins + phase));
    scaleX = mix(1.0, minSpacing, t * scaleX);

    pos.x = pos.x * scaleX;

    v_lighting = min(1.0, cos(a_meshCoord.x * PI * 8.0 + PI) + shadow);

    gl_Position = u_projectionMatrix * perspective(1000.0) * matrix * pos;
}
