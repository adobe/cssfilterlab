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

// Built-in uniforms

uniform mat4 u_projectionMatrix;
uniform vec4 u_meshBox;

// Uniforms passed in from CSS

uniform mat4 transform;
uniform float initialRollSize;
uniform float rollRatio;
uniform float rollSeparation;
uniform float rollDepth;

// Varyings

varying float v_lighting;

// Constants

const float PI = 3.1415926;

// The spiral formula in polar coordinates is r = a + b * theta.
// The following two functions are used for this formula.

// Get the current angle based on the desired number of arcs and the current position (normalized from 0 to 1).
float getTheta(float t, float arcs)
{
	return t * arcs * 2.0 * PI;
}

// The current radius based on the current angle.
float getR(float theta)
{
	return initialRollSize + rollSeparation / PI * theta;
}

// 2D rotation matrix
// pos = initial position
// rad = angle in radians to rotate by
// result = final position
vec2 rotate(vec2 pos, float rad)
{
	mat2 rot = mat2(cos(rad), -sin(rad),
				sin(rad), cos(rad));
	return rot * pos;
}

// This method returns the coordinates of the point in the spiral space.
// t = position on the spiral, normalized from 0 to 1
// arcs = number of full rotations the spiral does
// lower = boolean that specifies wheter it's the bottom spiral
vec2 createRoll(float t, float arcs, bool lower)
{
	vec2 pos;
	float theta = getTheta(t, arcs);
	float r = getR(theta);

	// Transform from polar coordinates back to cartesian.
	pos.y = r * sin(theta);
	pos.x = r * cos(theta);

	// The spiral starts from the center (of the end rest of the scroll) and builds outwards.
	// If it doesn't do a full rotation, the end will not meet up with the rest of the scroll.
	// Rotate the spiral so that the final point is at the same height as the point where the rest of the scroll ends.
	// ceil(arcs) - arcs denotes how much is needed for another full rotation
	// so rotate by that amount so that the ends meet up
	pos = rotate(pos, -1.0 * (ceil(arcs) - arcs) * 2.0*PI);

	// Now that the end of the spiral is at the same height as the end of the normal scroll
	// translate the whole spiral by the radius of the last point on the spiral
	// so that it aligns perfectly with the rest of the scroll.
	pos.x -= getR(getTheta(1.0, arcs));

	if (lower) {
		// The bottom scroll needs an extra half rotation to align properly.
		pos = rotate(pos, PI);
	}

	return pos;
}

// Transform from the original coordinate to a normalized parameter t.
// if t = 0 then that is the center-most point of the spiral
// if t = 1 then that is the outmost point of the spiral (the connection point to the rest of the scroll)
float yToT(float y, bool lower)
{
	if (lower) {
		return (0.5 - y) / (0.5 * rollRatio);
	}
	else {
		return (y + 0.5) / (0.5 * rollRatio);
	}
}

// Integral of (r^2 + (dr/dtheta)^2) between 0 and the maximum theta.
// Used for computing length of spiral.
float lengthFunc(float x)
{
	float a = initialRollSize;
	float b = rollSeparation;
	return 0.5 * (((a + b*x) * sqrt((a + b*x)*(a + b*x) + b*b))/b + b*log(sqrt((a + b*x)*(a + b*x) + b*b) + a + b*x));
}

// The length of the spiral for a provided angle - a specified length used in getArcs.
float arcLengthFunc(float x, float length)
{
	return lengthFunc(x) - lengthFunc(0.0) - length;
}

float derivateArcLengthFunc(float x)
{
	float a = initialRollSize;
	float b = rollSeparation;
	return sqrt((a + b*x)*(a + b*x) + b*b);
}

// The length of the spiral is the definite integral of (r^2 + (dr/dtheta)^2) between 0 and the maximum theta
// r = a + b * theta, where a is the initial radius and b is the separation in radians.
// The indefinite integral of that is the formula in the lengthFunc function.
// This gives the equation to solve length(theta) - length(0) = L in order to find the particular angle that would result in a provided length.
// I used the Newton-Raphson method to solve this (http://en.wikipedia.org/wiki/Newton-Raphson)
// The result is then normalized to the number of full rotations needed to arrive at the provided length (the provided ratio of half the element)
float getArcs(float rollRatio)
{
	float length = rollRatio * 0.5;

	float prev = 4.0 * PI; // initial guess - two arcs;
	for (int i = 0; i < 5; i++) {
		float current = prev - arcLengthFunc(prev, length) / derivateArcLengthFunc(prev);
		prev = current;
	}

	return prev / (2.0 * PI);
}

void main()
{
	vec4 pos = a_position;
	pos.y = a_meshCoord.y - 0.5;

	float arcs = getArcs(rollRatio);

	// The scrolls looked squished at the default sized, added this to make them look normal sized.
	float scalingFactor = PI / 2.0;

	// rollDepth is the scaling factor for the Z-axis, as that is not based on image size, and needs to be specified.
	float rollDepth = rollDepth * scalingFactor;

	// Get the coordinates in spiral space, then convert them back to original space.
	if (pos.y > (1.0 - rollRatio) * 0.5) {
		float t = yToT(pos.y, true);

		vec2 rollPos = createRoll(t, arcs, true);
		pos.z = rollDepth * rollPos.x;
		pos.y = (1.0 - rollRatio) * 0.5 + scalingFactor * rollPos.y;

		v_lighting = (1.0 - cos(getTheta(1.0, arcs) - getTheta(t, arcs)))*0.25 + 0.5;
	}
	else if (pos.y < (1.0 - rollRatio) * -0.5) {
		float t = yToT(pos.y, false);

		vec2 rollPos = createRoll(t, arcs, false);
		pos.z = -rollDepth * rollPos.x;
		pos.y = (1.0 - rollRatio) * -0.5 + scalingFactor * rollPos.y;

		v_lighting = (1.0 - cos(getTheta(1.0, arcs) - getTheta(t, arcs)))*0.25 + 0.5;
	}
	else {
		v_lighting = 1.0;
		// Create slight shadow under the rolls
		// make it the size of the roll with a linear drop-off.
		float maxRad = scalingFactor * getR(getTheta(1.0, arcs));

		if (pos.y > (1.0 - rollRatio) * 0.5 - maxRad) {
			// bottom
			float t = (pos.y - (1.0 - rollRatio) * 0.5 + maxRad) / maxRad;
			v_lighting *= 1.0 - 0.5 * t ;
		}
		if (pos.y < (1.0 - rollRatio) * -0.5 + maxRad) {
			// top
			float t = (pos.y + (1.0 - rollRatio) * 0.5 - maxRad) / -maxRad;
			v_lighting *= 1.0 - 0.5 * t ;
		}
	}

	pos.y = pos.y * u_meshBox.w + u_meshBox.y + u_meshBox.w / 2.0;
	gl_Position = u_projectionMatrix * transform * pos;
}
