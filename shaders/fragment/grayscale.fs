/*
Copyright 2012 Adobe Systems, Incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

uniform float amount;

void main()
{
    const vec3 grayFactor = vec3(0.2127, 0.7152, 0.0722);

    vec3 m1 = mix(vec3(1.0), grayFactor, amount);
    vec3 m0 = mix(vec3(0.0), grayFactor, amount);

    mat4 colorMatrix = mat4(
        vec4(m1.r, m0.g, m0.b, 0.0),
        vec4(m0.r, m1.g, m0.b, 0.0),
        vec4(m0.r, m0.g, m1.b, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    css_ColorMatrix = colorMatrix;
}
