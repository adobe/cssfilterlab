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

// Built-in attributes

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;

// Built-in uniforms

uniform vec2 u_meshSize;
uniform mat4 u_projectionMatrix;

// Uniforms passed in from CSS

uniform mat4 transform;
uniform float amount;
uniform float strength;
uniform float lightIntensity;

// Constants

const float PI = 3.1415;

// Varyings are passed from the vertex shader to the fragment shader.
// The value of the varying in the fragment shader is interpolated
// between the varying values at the three vertices of the triangle
// which contains the fragment.

varying vec2 v_uv;
varying float v_height;
varying float v_light;

// Construct perspective matrix

mat4 perspective( float p ) {

    float perspective = - 1.0 / p;
    return mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, perspective,
        0.0, 0.0, 0.0, 1.0 );

}

// WebGL noise (start)
// from https://github.com/ashima/webgl-noise

// Copyright (C) 2011 by Ashima Arts (Simplex noise)
// Copyright (C) 2011 by Stefan Gustavson (Classic noise)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

vec4 permute( vec4 x ) {

	return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );

}

vec4 taylorInvSqrt( vec4 r ) {

	return 1.79284291400159 - 0.85373472095314 * r;

}

float snoise( vec3 v ) {

	const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );
	const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );

	// First corner

	vec3 i  = floor( v + dot( v, C.yyy ) );
	vec3 x0 = v - i + dot( i, C.xxx );

	// Other corners

	vec3 g = step( x0.yzx, x0.xyz );
	vec3 l = 1.0 - g;
	vec3 i1 = min( g.xyz, l.zxy );
	vec3 i2 = max( g.xyz, l.zxy );

	vec3 x1 = x0 - i1 + 1.0 * C.xxx;
	vec3 x2 = x0 - i2 + 2.0 * C.xxx;
	vec3 x3 = x0 - 1. + 3.0 * C.xxx;

	// Permutations

	i = mod( i, 289.0 );
	vec4 p = permute( permute( permute(
			 i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )
		   + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )
		   + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );

	// Gradients
	// ( N*N points uniformly over a square, mapped onto an octahedron.)

	float n_ = 1.0 / 7.0; // N=7

	vec3 ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)

	vec4 x_ = floor( j * ns.z );
	vec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)

	vec4 x = x_ *ns.x + ns.yyyy;
	vec4 y = y_ *ns.x + ns.yyyy;
	vec4 h = 1.0 - abs( x ) - abs( y );

	vec4 b0 = vec4( x.xy, y.xy );
	vec4 b1 = vec4( x.zw, y.zw );


	vec4 s0 = floor( b0 ) * 2.0 + 1.0;
	vec4 s1 = floor( b1 ) * 2.0 + 1.0;
	vec4 sh = -step( h, vec4( 0.0 ) );

	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

	vec3 p0 = vec3( a0.xy, h.x );
	vec3 p1 = vec3( a0.zw, h.y );
	vec3 p2 = vec3( a1.xy, h.z );
	vec3 p3 = vec3( a1.zw, h.w );

	// Normalise gradients

	vec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	// Mix final noise value

	vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );
	m = m * m;
	return 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ),
								  dot( p2, x2 ), dot( p3, x3 ) ) );

}

// WebGL noise (end)

// Construct height map out of base noise function

float surface( vec2 p, float time ) {

	vec3 coord = vec3( p, -time * 0.001125 );

	float n = 0.3;

	n += 0.75  * abs( snoise( coord * 128.0 ) );
	n += 0.25  * abs( snoise( coord * 256.0 ) );
	n += 0.125 * abs( snoise( coord * 512.0 ) );

	return n;

}

// Easing function
// https://github.com/sole/tween.js
// http://robertpenner.com/easing/

float quadraticInOut( float k ) {

	if ( ( k *= 2.0 ) < 1.0 ) return 0.5 * k * k;
	return - 0.5 * ( --k * ( k - 2.0 ) - 1.0 );

}

// Main

void main() {

	// Compute displacement

	float time = 10.0 * quadraticInOut( amount );
	vec2 surfaceCoordinate = 0.025 * a_texCoord;

	float n = surface( surfaceCoordinate, time );
	float curve = strength * n;

    vec4 pos = a_position;
    pos.z = amount * ( 0.5 * strength - curve ) * 500.0;

	// Compute normal

	const float e = 0.001;

	float nx = surface( surfaceCoordinate + vec2( e, 0.0 ), time );
	float ny = surface( surfaceCoordinate + vec2( 0.0, e ), time );

	vec3 normal = normalize( vec3( n - nx, n - ny, 1.0 - strength * 1.25 ) );

	// Compute lighting (directional light)

	vec3 lightPosition = normalize( vec3( 0.0, 0.5, 1.0 ) );
	float lightWeight = lightIntensity * max( dot( normal, lightPosition ), 0.0 );

	// Set vertex position

    gl_Position = u_projectionMatrix * perspective( 1000.0 ) * transform * pos;

	// Pass in varyings

	v_uv = a_texCoord;
	v_height = n;
	v_light = lightWeight;

}
