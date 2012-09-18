/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * Copyright (c) 2012 Branislav Ulicny
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
attribute vec3 a_triangleCoord;

// Built-in uniforms

uniform vec2 u_textureSize;
uniform mat4 u_projectionMatrix;

// Uniforms passed in from CSS

uniform mat4 transform;
uniform float amount;
uniform float sphereRadius;
uniform vec3 sphereAxis;
uniform float sphereRotation;
uniform vec3 lightPosition;

// Varyings

varying float v_light;

// Constants

const float PI = 3.1415926;

// Helpers.

float rad(float deg)
{
	return deg * PI / 180.0;
}

// Rotate vector.

vec3 rotateVectorByQuaternion(vec3 v, vec4 q) 
{
	vec3 dest = vec3(0.0);

	float x = v.x, y  = v.y, z  = v.z;
	float qx = q.x, qy = q.y, qz = q.z, qw = q.w;

	// Calculate quaternion * vector.
	float ix =  qw * x + qy * z - qz * y,
		  iy =  qw * y + qz * x - qx * z,
		  iz =  qw * z + qx * y - qy * x,
		  iw = -qx * x - qy * y - qz * z;

	// Calculate result * inverse quaternion.
	dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

	return dest;
}

// Convert rotation.

vec4 axisAngleToQuaternion(vec3 axis, float angle)
{
	vec4 dest = vec4(0.0);

	float halfAngle = angle / 2.0;
	float s = sin(halfAngle);

	dest.x = axis.x * s;
	dest.y = axis.y * s;
	dest.z = axis.z * s;
	dest.w = cos(halfAngle);

	return dest;
}

vec3 computeSpherePosition(vec3 p, vec2 uv, float r)
{
	vec3 np;

	float ro = uv.x * 2.0 * PI + PI * 0.5;
	float fi = uv.y * PI;

	np.x = r * sin(fi) * cos(ro);
	np.z = -r * sin(fi) * sin(ro);
	np.y = r * cos(fi);

	return np;
}

vec3 rotatePosition(vec3 p, float aspect, vec3 axis, float angle)
{
	vec3 centroid = vec3(0.0, 0.0, 0.0);

	float r = amount * angle;

	vec4 rotation = vec4(axis, r);
	vec4 qRotation = axisAngleToQuaternion(normalize(rotation.xyz), rotation.w);

	vec3 pos = rotateVectorByQuaternion((p - centroid) * vec3(aspect, 1.0, 1.0), qRotation) * vec3(1.0/aspect, 1.0, 1.0) + centroid;

	return pos;
}

// Main

void main()
{
    vec4 position = a_position;
	float aspect = u_textureSize.x / u_textureSize.y;

	// Map plane to sphere using UV coordinates.
	vec3 spherePosition = computeSpherePosition(position.xyz, vec2(a_texCoord.x, 1.0 - a_texCoord.y), sphereRadius);
	spherePosition *= vec3(1.0 / aspect, 1.0, 1.0);

	// Blend plane and sphere.
	position.xyz = mix(position.xyz, spherePosition, amount);

	// Rotate sphere.
	position.xyz = rotatePosition(position.xyz, aspect, sphereAxis, rad(sphereRotation));

	// Set vertex position.
	gl_Position = u_projectionMatrix * transform * position;

	// Compute lighting.
	vec3 lightPosNorm = normalize(lightPosition);
	vec3 planeNormal = lightPosNorm;
	vec3 sphereNormal = normalize(position.xyz);
	vec3 normal = normalize(mix(planeNormal, sphereNormal, amount));
	float intensity = mix(1.0, 2.5, amount);
	float light = intensity * max(dot(normal, lightPosNorm), 0.0);

	// Pass varying to fragment shader.
	v_light = light;
}
