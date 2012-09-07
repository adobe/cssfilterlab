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
