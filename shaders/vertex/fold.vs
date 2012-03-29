/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;
uniform mat4 matrix;

uniform mat4 u_projectionMatrix;
uniform vec2 u_textureSize;
varying vec2 v_texCoord;
varying float v_lighting;

uniform float direction;

float PI = 3.14;

uniform float mapDepth;
uniform float mapCurve;
uniform float minSpacing;

uniform float t;
uniform float spins;
uniform float phase;

vec4 lightSource = vec4(-0.5, -0.5, 3000.0, 1.0);

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
    v_texCoord = a_texCoord;

    vec4 pos = a_position;
    pos.z = (-cos(a_meshCoord.x * PI * 8.0) * mapDepth * t - mapDepth * t / 2.0);

    float scaleX = mix(t - mapCurve, 1.0, sin(a_meshCoord.y * PI * spins + phase));
    scaleX = mix(1.0, minSpacing, t * scaleX);

    pos.x = pos.x * scaleX;
    
    vec4 vertex = matrix * pos;
    vec4 normal = normalize(matrix * vec4(0.0, 0.0, sign(pos.z), 1.0));
    vec4 ray = normalize(lightSource - vertex);
    v_lighting = max(dot(ray, normal), mix(1.0, 0.2, sqrt(t)));
        
    gl_Position = u_projectionMatrix * perspective(1000.0) * vertex;
    
}
