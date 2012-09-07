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

// Uniform values from CSS

uniform float amount;

// Varyings passed in from vertex shader

varying vec2 v_uv;
varying float v_height;
varying float v_light;

// Main

void main() {

	const float a = 1.0;
	float r, g, b;

	// Depth variant

	/*
	float n = 1.0 - v_height;
	float v = mix( 1.0, n, amount );

	r = g = b = v;
	*/

	// Light variant

	float n = v_light;
	float v = mix( 1.0, n * n, amount );

	r = g = b = sqrt( v );

	// Set color matrix

	css_ColorMatrix = mat4( r, 0.0, 0.0, 0.0,
							0.0, g, 0.0, 0.0,
							0.0, 0.0, b, 0.0,
							0.0, 0.0, 0.0, a );

}
