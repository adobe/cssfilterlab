/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * Copyright (c) 2012 Branislav Ulicny.
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

// Varyings passed in from vertex shader

varying vec2 v_uv;
varying float v_height;
varying float v_light;

// Main

void main()
{
	const float a = 1.0;
	float r, g, b;

	// Depth variant
	/*
	float n = 1.0 - v_height;
	float v = mix(1.0, n, amount);
	r = g = b = v;
	*/

	// Light variant
	float n = v_light;
	float v = mix(1.0, n * n, amount);
	r = g = b = sqrt(v);

	// Set color matrix
	css_ColorMatrix = mat4(r, 0.0, 0.0, 0.0,
							0.0, g, 0.0, 0.0,
							0.0, 0.0, b, 0.0,
							0.0, 0.0, 0.0, a);
}
