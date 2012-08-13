/*
Copyright 2012 Adobe Systems, Incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;

uniform mat4 u_projectionMatrix;
uniform vec2 u_textureSize;

// These uniform values are passed in using CSS.
uniform float direction;
uniform float t;

varying float v_lighting;

const float PI = 3.14;

const float mapDepth = 0.05;
const float mapCurve = 0.09;
const float minSpacing = 0.15;

const vec4 lightSource = vec4(-0.5, -0.5, 300.0, 1.0);

mat4 perspective(float p) {
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

    pos.z = -cos(a_meshCoord.x * PI * 8.0) * mapDepth * clamp(t, 0.1, 1.0);

    float scaleX = mix(t - mapCurve, 1.0, sin(a_meshCoord.y * PI * 0.5));
    scaleX = mix(1.0, minSpacing, t * scaleX);

    pos.x = pos.x * scaleX * 0.5 + (0.5 - scaleX * 0.25) * direction;

    vec4 vertex = pos;
    vec4 normal = normalize(vec4(0.0, 0.0, sign(pos.z), 1.0));
    vec4 ray = normalize(lightSource - vertex);
    v_lighting = max(dot(ray, normal), mix(1.0, 0.0, sqrt(t + 0.5)));

    gl_Position = u_projectionMatrix * perspective(1000.0) * vertex;

}
