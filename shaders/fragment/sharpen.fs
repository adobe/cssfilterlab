/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_textureSize;

uniform float radius;
uniform float threshold;
uniform float amount;

float s = radius;
float t = s;
float s2 = s * s;
float t2 = t * t;
float two_s2 = 2.0 * s2;
float two_t2 = 2.0 * t2;
float PI = 3.141592653;
int startX = -int(ceil(s)) * 3;
int endX = -startX;
int startY = -int(ceil(t)) * 3;
int endY = -startY;

const int minStartX = -25;
const int maxEndX = 25;
const int minStartY = -25;
const int maxEndY = 25;


varying vec2 v_texCoord;

const vec4 minColor = vec4(0.0, 0.0, 0.0, 0.0);
const vec4 maxColor = vec4(1.0, 1.0, 1.0, 1.0);

void main() {
    // WARNING: Need ot update dx/dy once we will have the texture sizes in.
    float dx = 1.0 / 550.0;
    float dy = 1.0 / 374.0;
    
    vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
    float ws = 0.0;
    
    // The use of min/max values in the loop is to accomodate the constraint that
    // loops can only work with constants in GLSL ES.
    for (int ci = minStartX; ci <= maxEndX; ci++) {
        if (ci >= startX && ci <= endX) {
            for (int ri = minStartY; ri <= maxEndY; ri++) {
                    if (ri >= startY && ri <= endY) {
                        float x = float(ci);
                        float y = float(ri);
                        
                        vec4 smp = texture2D(u_texture, v_texCoord + vec2(dx * x, dy * y));
                        
                        float weight = exp(-x * x / two_s2) / sqrt(2.0 * PI * s2);
                        weight *= exp(-y * y / two_t2) / sqrt(2.0 * PI * t2);
                        
                        ws += weight;
                        sum += weight * smp;
                }
            }
        }
    }
    
    if (ws > 0.0) {
        sum /= ws;
    }

    vec4 original = texture2D(u_texture, v_texCoord);
    vec4 blurred = sum;
    gl_FragColor = mix(blurred, original, 1.0 + amount);
}

