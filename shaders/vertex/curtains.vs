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

// Built-in attributes.

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;

// Built-in uniforms.

uniform mat4 u_projectionMatrix;
uniform vec2 u_textureSize;

// Uniforms passed-in from CSS

uniform mat4 transform;
uniform float numFolds;
uniform float foldSize;
uniform float amount;

// Varyings

varying float v_lighting;
varying float xpos;

// Constants

const float PI = 3.1415629;

// Main

void main()
{
    vec4 pos = a_position;

  	pos.x += (pos.x < 0.0 ? -1.0 : 1.0) * amount * (0.5 - abs(pos.x));
	xpos = pos.x;

    float cyclePos = sin(abs(a_position.x) * PI * 4.0 * numFolds);
  	pos.z = foldSize * amount * cyclePos * 16.0;

    v_lighting = max(1.0 - amount, 0.5 * (cyclePos + 1.0));

    gl_Position = u_projectionMatrix  * transform * pos;
}
