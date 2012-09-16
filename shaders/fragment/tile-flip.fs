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

// Uniform values from CSS

uniform float amount;
//uniform float outline;
float outline = 1.0;

//uniform vec2 meshSize;
vec2 meshSize = vec2(25.0, 32.0);
//uniform vec2 textureSize;
vec2 textureSize = vec2(680.0, 530.0);

// Built-in uniforms

uniform vec2 u_meshSize;
uniform vec2 u_textureSize;

// Varyings passed in from vertex shader

varying float v_depth;
varying vec2 v_uv;

// Main

void main()
{
	vec4 c = vec4(1.0);

	// Fade out.
	c.a = 1.0 - v_depth;

	// Show grid outline
	if (outline > 0.0) {

		float cell_width = textureSize.x / meshSize.y;
		float cell_height = textureSize.y / meshSize.x;
		float dd = 1.0;

		if (mod(v_uv.x * textureSize.x + dd, cell_width) < 2.0
			|| mod(v_uv.y * textureSize.y + dd, cell_height) < 2.0) {
			if (amount > 0.0)
				c.rgb = vec3(1.0 - sqrt(amount));
		}

	}

	css_ColorMatrix = mat4(c.r, 0.0, 0.0, 0.0,
							0.0, c.g, 0.0, 0.0,
							0.0, 0.0, c.b, 0.0,
							0.0, 0.0, 0.0, c.a);
}
