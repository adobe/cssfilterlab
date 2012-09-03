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

attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;

uniform mat4 u_projectionMatrix;
uniform vec4 u_meshBox;
uniform vec2 u_textureSize;
varying vec2 v_texCoord;

const int cols = 4;
const int rows = 4;
const int n = rows - 1;
const int m = cols - 1;

uniform mat4 matrix;
uniform float k[cols * rows * 3];
uniform float factor[cols > rows ? cols : rows];

mat4 perspective(float p) {
    float perspective = - 1.0 / p;
    return mat4(
	1.0, 0.0, 0.0, 0.0, 
	0.0, 1.0, 0.0, 0.0, 
	0.0, 0.0, 1.0, perspective, 
	0.0, 0.0, 0.0, 1.0);
}

float binomialCoefficient(int n, int i) {
    return factor[n] / (factor[i] * factor[n-i]);
}

float calculateB(int i, int n, float u) {
    float bc = binomialCoefficient(n, i);
    // Adding 0.000001 to avoid having pow(0, 0) which is undefined.
    return bc * pow(u + 0.000001, float(i)) * pow(1.0 - u + 0.00001, float(n - i));
}

vec3 calculate(float u, float v) {
    vec3 result = vec3(0.0);
    vec2 offset = vec2(u_meshBox.x + u_meshBox.z / 2.0, 
                       u_meshBox.y + u_meshBox.w / 2.0);
    
    for (int i = 0; i <= n; ++i) {
        for (int j = 0; j <= m; ++j) {
            float c = calculateB(i, n, u) * calculateB(j, m, v);
            int z = (j * rows + i) * 3;
            vec3 point = vec3(k[z] * u_meshBox.z + offset.x, k[z + 1] * u_meshBox.w + offset.y, k[z + 2]);
            result += c * point;
        }
    }
    return result;
}

void main()
{
    v_texCoord = a_texCoord;
    vec3 pos = calculate(a_meshCoord.x, a_meshCoord.y);
    gl_Position = u_projectionMatrix * perspective(1000.0) * matrix * vec4(pos, 1.0);
    
}
