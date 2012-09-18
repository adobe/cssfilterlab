/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This shader is largely based on XBPageCurl:
 * https://github.com/xissburg/XBPageCurl
 * 
 * XBPageCurl's copyright notice and license is included below.
 */

/*
 *  Copyright (C) 2011 xissburg, http://xissburg.com
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 */

precision mediump float;

// Built-in attributes

attribute vec4 a_position;
attribute vec2 a_texCoord;

// Built-in uniforms

uniform mat4 u_projectionMatrix;

// Uniforms passed in from CSS

uniform vec2 cylinderPosition;
uniform vec2 cylinderDirection;
uniform float cylinderRadius;

// Varyings

varying vec2 v_texCoord;
varying vec3 v_normal;
varying float v_gradient;

// Constants

const float PI = 3.1415926;

// Main

void main()
{
    vec4 position = a_position;

    // Normalize the input cylinder direction.
    vec2 cylinderDirection = normalize(cylinderDirection);
  
    vec2 n = vec2(cylinderDirection.y, -cylinderDirection.x);
    vec2 w = position.xy - cylinderPosition;
    float d = dot(w, n);
    
    vec2 dv = n * (2.0*d - PI*cylinderRadius);
    // Projection angle (dr)
    float dr = d/cylinderRadius;
    float s = sin(dr);
    float c = cos(dr);
    // Projection of vertex on the cylinder axis projected on the xy plane (proj)
    vec2 proj = position.xy - n*d;
    vec3 center = vec3(proj, cylinderRadius);
    
    // d > 0.0 (br1)
    float br1 = clamp(sign(d), 0.0, 1.0);
    // d > PI*u_cylinderRadius (br2)
    float br2 = clamp(sign(d - PI*cylinderRadius), 0.0, 1.0);
    
    vec3 vProj = vec3(s*n.x, s*n.y, 1.0 - c)*cylinderRadius;
    vProj.xy += proj;
    vec4 v = mix(position, vec4(vProj, position.w), br1);
    v = mix(v, vec4(position.x - dv.x, position.y - dv.y, 2.0*cylinderRadius, a_position.w), br2);
    
    v_normal = mix(vec3(0.0, 0.0, 1.0), (center - v.xyz)/cylinderRadius, br1);
    v_normal = mix(v_normal, vec3(0.0, 0.0, -1.0), br2);
    v_normal = normalize(v_normal);
  
    // Position the vertex.
    gl_Position = u_projectionMatrix * v;
    v_texCoord = a_texCoord;
  
    // Pass the backface gradient intensity to the fragment shader.
    vec2 vw = v.xy - cylinderPosition;
    float vd = dot(vw, -n);
    v_gradient = -vd/cylinderRadius;
}
