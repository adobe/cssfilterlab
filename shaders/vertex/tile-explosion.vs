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

// Built-in attributes

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;
attribute vec3 a_triangleCoord;

// Built-in uniforms

uniform vec4 u_meshBox;
uniform vec2 u_tileSize;
uniform vec2 u_meshSize;

uniform mat4 u_projectionMatrix;
uniform vec2 u_textureSize;

// Uniforms passed in from CSS

uniform mat4 transform;
uniform float t;
uniform float explosiveness;
uniform vec3 tileRotation;
uniform vec2 center;

// Constants

// Noise used to have the tiles move a little bit when they are out of the explosion sphere.
const float noise = 200.0;

// Helper functions

mat4 translate(vec3 t) {
    return mat4(
     1.0, 0.0, 0.0, 0.0,
     0.0, 1.0, 0.0, 0.0,
     0.0, 0.0, 1.0, 0.0,
     t.x, t.y, t.z, 1.0);
}

mat4 rotateX(float f) {
    return mat4(
	1.0, 0.0, 0.0, 0.0,
	0.0, cos(f), sin(f), 0.0,
	0.0, -sin(f), cos(f), 0.0,
	0.0, 0.0, 0.0, 1.0);
}

mat4 rotateY(float f) {
    return mat4(
	cos(f), 0.0, -sin(f), 0.0,
	0.0, 1.0, 0.0, 0.0,
	sin(f), 0, cos(f), 0.0,
	0.0, 0.0, 0.0, 1.0);
}

mat4 rotateZ(float f) {
    return mat4(
     cos(f), sin(f), 0.0, 0.0,
     -sin(f), cos(f), 0.0, 0.0,
     0.0, 0.0, 1.0, 0.0,
     0.0, 0.0, 0.0, 1.0);
}

mat4 scale(vec3 f) {
    return mat4(
     f.x, 0.0, 0.0, 0.0,
     0.0, f.y, 0.0, 0.0,
     0.0, 0.0, f.z, 0.0,
     0.0, 0.0, 0.0, 1.0);
}

mat4 rotate(vec3 a) {
    return rotateX(a.x) * rotateY(a.y) * rotateZ(a.z);
}

// Random function based on the tile coordinate. This will return the same value
// for all the vertices in the same tile (i.e., two triangles).

float random(vec2 scale)
{
    // Use the fragment position for a different seed per-pixel.
    return fract(sin(dot(vec2(a_triangleCoord.x, a_triangleCoord.y), scale)) * 4000.0);
}

// Main

// This effect is using a center point for an 'explosion' effect. The further a point is from the
// center, the more it moves along the x and y axis, radially. The closer to the explosion, the move
// the point moves along the z axis.

void main()
{
    // r is dependent on the tile coordinates.
    float r = random(vec2(10.0, 80.0));

    // Complete tile transform
    mat4 ttfx = mat4(1.0);

    // R is the explosion sphere radius
    float p = 2.0 * t;
    if (p > 1.0)
        p = 2.0 - p;

    float R2 = p * max(u_textureSize.x, u_textureSize.y);
    R2 *= R2;

    float dx = abs(center.x - a_meshCoord.x) * u_textureSize.x;
    float dy = abs(center.y - a_meshCoord.y) * u_textureSize.y;
    float d2 = dx * dx + dy * dy;

    // Find the tile center.
    vec3 trc = vec3(u_meshBox.x + u_tileSize.x * (a_triangleCoord.x + 0.5),
                    u_meshBox.y + u_tileSize.y * (a_triangleCoord.y + 0.5),
                    0.0);

    // Rotate about the tile center along the z-axis
    ttfx = translate(trc) *
           rotate(radians(vec3(tileRotation.x * r * p, 2.0 * tileRotation.y * r * p, 0.5 * r * p * tileRotation.z))) *
           translate(-trc);

    ttfx = translate(vec3(0.0, 0.0, p * explosiveness * sqrt(abs(R2 - d2)) * (0.8 + 0.4 * r))) * ttfx;
    ttfx = translate(vec3(0.0, 0.0, (-0.5 + r) * noise * p)) * ttfx;

    gl_Position = u_projectionMatrix * transform * ttfx * a_position;
}
