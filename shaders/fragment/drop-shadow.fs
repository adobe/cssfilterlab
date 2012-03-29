/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_textureSize;

uniform float radius;
uniform float offset_x;
uniform float offset_y;
uniform vec4 flood_color;

float s = radius;
float s2 = s * s;
float two_s2 = 2.0 * s2;
float PI = 3.141592653;
int startX = -int(ceil(s)) * 3;
int endX = -startX;

const int minStartX = -25;
const int maxEndX = 25;

varying vec2 v_texCoord;

void main() {
    // WARNING: Need to update dx/dy once we will have the texture sizes in.
    float dx = 1.0 / u_textureSize.x;
    float dy = 1.0 / u_textureSize.y;
    
    vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
    float ws = 0.0;
    
    for (int ci = minStartX; ci <= maxEndX; ci++) {
        if (ci >= startX && ci <= endX) {
            float x = float(ci);
            float xo = x - offset_x;
            float x2 = x * x;
            float weightX = exp(-x2 / two_s2) / sqrt(2.0 * PI * s2);
            float colX = dx * xo;
            for (int ri = minStartX; ri <= maxEndX; ri++) {
                    if (ri >= startX && ri <= endX) {
                        float y = float(ri);
                        vec4 smp = texture2D(u_texture, v_texCoord + vec2(colX, dy * (y - offset_y)));
                        float weight = weightX * exp(-y * y / two_s2) / sqrt(2.0 * PI * s2);
                        ws += weight;
                        sum += weight * smp;
                }
            }
        }
    }
    
    if (ws > 0.0) {
        sum /= ws;
    }
    
    float alpha = sum.a * flood_color.a;
    vec4 orig = texture2D(u_texture, v_texCoord);
    
    gl_FragColor = mix(vec4(flood_color.rgb * alpha, alpha), orig, orig.a);
}

