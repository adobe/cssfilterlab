/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

uniform float amount;

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
    const mat4 id = mat4(1.0);

    float oneToNegOne = mix(1.0, -1.0, amount);
    float zeroToOne = mix(0.0, 1.0, amount);

    css_ColorMatrix = mat4(
        oneToNegOne, 0.0, 0.0, 0.0,
        0.0, oneToNegOne, 0.0, 0.0,
        0.0, 0.0, oneToNegOne, 0.0,
        zeroToOne, zeroToOne, zeroToOne, 1.0
    );

    // TODO: Remove:
    css_ColorMatrix = transposeMatrix(css_ColorMatrix);
}
