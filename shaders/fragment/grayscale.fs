/*
Copyright 2012 Adobe Systems, Incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

// This uniform values is passed in using CSS.
uniform float amount;

void main()
{
    float oneMinusAmount = 1.0 - amount;
    css_ColorMatrix = mat4((0.2126 + 0.7874 * oneMinusAmount), (0.7152 - 0.7152 * oneMinusAmount), (0.0722 - 0.0722 * oneMinusAmount), 0.0,
                           (0.2126 - 0.2126 * oneMinusAmount), (0.7152 + 0.2848 * oneMinusAmount), (0.0722 - 0.0722 * oneMinusAmount), 0.0,
                           (0.2126 - 0.2126 * oneMinusAmount), (0.7152 - 0.7152 * oneMinusAmount), (0.0722 + 0.9278 * oneMinusAmount), 0.0,
                           0.0, 0.0, 0.0, 1.0);
}
