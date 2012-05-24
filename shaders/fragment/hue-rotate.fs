/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

uniform float angle;

mat4 transposeMatrix(mat4 m)
{
    return mat4(
        m[0].x, m[1].x, m[2].x, m[3].x,
        m[0].y, m[1].y, m[2].y, m[3].y,
        m[0].z, m[1].z, m[2].z, m[3].z,
        m[0].w, m[1].w, m[2].w, m[3].w
    );
}

void main()
{
    const float PI = 3.141592653;

    const mat3 base0 = mat3(
        0.2127, 0.2127, 0.2127,
        0.7152, 0.7152, 0.7152,
        0.0722, 0.0722, 0.0722
    );

    const mat3 base1 = mat3(
        0.7873,  -0.2127, -0.2127,
        -0.7152,  0.2848, -0.7152,
        -0.0722, -0.0722,  0.9278
    );

    const mat3 base2 = mat3(
        -0.2127,  0.143,  -0.7873,
        -0.7152,  0.140,   0.7152,
        0.9278,  -0.283,   0.0722
    );

    float angleRad = angle * PI / 180.0;
    mat3 hueRotate = base0 + cos(angleRad) * base1 + sin(angleRad) * base2;

    css_ColorMatrix = mat4(
        vec4(hueRotate[0], 0.0),
        vec4(hueRotate[1], 0.0),
        vec4(hueRotate[2], 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    // TODO: Remove.
    css_ColorMatrix = transposeMatrix(css_ColorMatrix);
}
