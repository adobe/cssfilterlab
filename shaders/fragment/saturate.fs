/*
Copyright 2012 Adobe Systems, Incorporated
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
    const vec3 grayFactor = vec3(0.2127, 0.7152, 0.0722);

    vec3 m1 = mix(grayFactor, vec3(1.0), amount);
    vec3 m0 = mix(grayFactor, vec3(0.0), amount);

    mat4 colorMatrix = mat4(
        m1.r, m0.r, m0.r, 0.0,
        m0.g, m1.g, m0.g, 0.0,
        m0.b, m0.b, m1.b, 0.0,
        0.0, 0.0, 0.0, 1.0
    );

    // TODO: Fix.
    //css_ColorMatrix = colorMatrix;
    css_ColorMatrix = transposeMatrix(colorMatrix);
}
