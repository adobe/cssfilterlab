/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * Copyright (c) 2012 Branislav Ulicny
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

// Built-in attributes

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;

// Built-in uniforms

uniform mat4 u_projectionMatrix;

// Uniforms passed in from CSS

uniform mat4 transform;
uniform float amount;

// Constants

const float PI = 3.1415926;

// Varyings

varying vec2 v_uv;

// Main

void main()
{
    float curve = abs(cos(a_meshCoord.x * PI * 6.0));

    vec4 pos = a_position;
    pos.z = 100.0 * amount * (curve - 1.0);

    gl_Position = u_projectionMatrix * transform * pos;

	v_uv = a_texCoord;
}
