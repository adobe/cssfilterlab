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

(function () {
    
    var factors = {};
    function factor(n) {
        if (factors[n])
            return factors[n];
        var result = 1;
        for (var i = 2; i <= n; ++i)
            result *= i;
        factors[n] = result;
        return result;
    }

    function binomialCoefficient(n, i) {
        return factor(n) / (factor(i) * factor(n-i));
    }

    function calculateB(i, n, u) {
        var bc = binomialCoefficient(n, i);
        return bc * Math.pow(u, i) * Math.pow(1 - u, n - i);
    }
    function calculate(u, v, n, m, k) {
        var resultX = 0;
        var resultY = 0;
        var resultZ = 0;
        for (var i = 0; i <= n; ++i)
            for (var j = 0; j <= m; ++j) {
                var c = calculateB(i, n, u) * calculateB(j, m, v);
                resultX += c * k[i][j][0];
                resultY += c * k[i][j][1];
                resultZ += c * k[i][j][2];
            }
        return [resultX, resultY, resultZ];
    }
    
    function draw(el, width, height, k, currentPointCoords, currentHoverPointCoors) {
        var c = el.getContext("2d");
        c.save();

        // Background layer
        c.clearRect(0, 0, width, height);
        
        // Mesh layer
        c.lineWidth = 1;
        c.strokeStyle = "#414141";
    
        c.beginPath();

        var i, j, first, p;

        var n = k.length - 1, m = k[0].length - 1;
        for (i = 0; i < 1; i += 0.1) {
            first = true;
            for (j = 0; j < 1; j += 0.1) {
                p = calculate(i, j, n, m, k);
                if (first)
                    c.moveTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                else
                    c.lineTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                first = false;
            }
        }
    
        for (j = 0; j < 1; j += 0.1) {
            first = true;
            for (i = 0; i < 1; i += 0.1) {                    
                p = calculate(i, j, n, m, k);
                if (first)
                    c.moveTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                else
                    c.lineTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                first = false;
            }
        }
        c.stroke();

        // Control points mesh
    
        c.beginPath();
        c.strokeStyle = "#9c9c9c";
        for (i = 0; i <= n; ++i) {
            for (j = 0; j <= m; ++j) {
                p = k[i][j];
                if (!j)
                    c.moveTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                else
                    c.lineTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
            }
        }
        for (j = 0; j <= m; ++j) {
            for (i = 0; i <= n; ++i) {
                p = k[i][j];
                if (!i)
                    c.moveTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                else
                    c.lineTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
            }
        }
        c.stroke();
        
        // Control points
        var gradient = c.createLinearGradient(0, 0, 0, 5);
        gradient.addColorStop(0, "#b2b2b2");
        gradient.addColorStop(1, "#8d8d8d");

        c.fillStyle = gradient;
        c.strokeStyle = "black";
        c.lineWidth = 1;
        c.shadowColor = "#0088ff";
        c.shadowBlur = 0;

        for (i = 0; i <= n; ++i) {
            for (j = 0; j <= m; ++j) {
                p = k[i][j];
                if (currentPointCoords && i == currentPointCoords.i && j == currentPointCoords.j) {
                    c.shadowBlur = 15;
                    c.shadowColor = "#9988ff";
                } else if (currentHoverPointCoors && i == currentHoverPointCoors.i && j == currentHoverPointCoors.j) {
                    c.shadowBlur = 10;
                    c.shadowColor = "#0088ff";
                } else
                    c.shadowBlur = 0;

                var size = (p[2] + 1000) / 300 + 2;
                c.setTransform(1, 0, 0, 1, toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                c.beginPath();
                c.arc(0, 0, size, 0, Math.PI*2, true);
                c.fillStyle = "rgba(255, 255, 255, 0.9)";
                c.fill();

                c.strokeStyle = "black";
                c.stroke();

                c.beginPath();
                c.arc(0, 0, size - 1.5, 0, Math.PI*2, true);
                c.fillStyle = gradient;
                c.fill();
            }
        }
    
        c.restore();
    }
    
    var canvasMargins = 40;
    
    function toCanvasCoord(x, w) {
        return (x + 0.5) * (w - canvasMargins) + canvasMargins / 2;
    }
    
    function fromCanvasCoord(x, w) {
        return (x - canvasMargins / 2) / (w - canvasMargins) - 0.5;
    }
    
    function pointIsNearMouse(p, x, y, w, h) {
        var pointSize = 15;
        return (toCanvasCoord(p[0], w) - pointSize) < x && (toCanvasCoord(p[0], w) + pointSize) > x && 
                (toCanvasCoord(p[1], h) - pointSize) < y && (toCanvasCoord(p[1], h) + pointSize) > y;
    }

    function findPoint(k, x, y, coords, w, h) {
        var n = k.length - 1, m = k[0].length - 1;
        for (var i = 0; i <= n; ++i)
            for (var j = 0; j <= m; ++j)
                if (pointIsNearMouse(k[i][j], x, y, w, h)) {
                    if (coords) {
                        coords.i = i;
                        coords.j = j;
                    }
                    return k[i][j];
                }
        return null;
    }
    
    function buildWarpCanvas(el, width, height, updateCallback, zslider) {
        var parent = $(el).css({
            "position": "relative",
            "width": width + "px",
            "height": height + "px"
        });  
        
        if (!zslider) {
            zslider = $("<input type='range' class='vertical' min='-1000' max='1000' value='0' />")
                      .appendTo(parent)
                      .css({
                            "display": "none",
                            "position": "absolute",
                            "top":  "-4px",
                            "left": (width + 10) + "px",   
                            "width": height + "px"
                      });
        }
        
        var canvas = $("<canvas />")
                    .appendTo(parent)
                    .addClass("warp-control")
                    .attr({
                        "width": width,
                        "height": height
                     })
                    .css({
                        "position": "absolute", 
                        "left": "0",
                        "top": "0"
                    })
        
        var currentPointCoords = {i:-1, j:-1};
        var currentPoint = null;
        var dragging = false;
        
        var pointsRef = null;
        
        function hasPoints() {
            return !!pointsRef;
        }
        
        function points() {
            return pointsRef;
        }
        
        function setPoints(points) {
            if (points === pointsRef)
                return;
            currentPoint = null;
            currentPointCoords = {i:-1, j:-1};
            updateZSlider();
            redraw();
            return pointsRef = points;
        }
        
        function redraw(pointCoords) {
            if (!hasPoints()) return;
            draw(canvas[0], width, height, points(), pointCoords, currentPointCoords);
        }
        
        var startX, startY, pageX, pageY;
        canvas.mousedown(function(e) {
            e.preventDefault();
            if (!hasPoints()) return;
            currentPoint = findPoint(points(), event.offsetX, event.offsetY, currentPointCoords, width, height);
            startX = event.offsetX; pageX = event.pageX;
            startY = event.offsetY; pageY = event.pageY;
            redraw();
            updateZSlider();
            dragging = currentPoint != null;
            document.addEventListener("mousemove", mouseMove, true);
            document.addEventListener("mouseup", mouseUp, true);
        });

        function mouseMove(e) {
            e.preventDefault();
            if (!hasPoints()) return;
            var offsetX = Math.min(width, Math.max(0, event.pageX - pageX + startX)),
                offsetY = Math.min(height, Math.max(0, event.pageY - pageY + startY));
            currentPoint[0] = fromCanvasCoord(offsetX, width);
            currentPoint[1] = fromCanvasCoord(offsetY, height);
            redraw();
            updateCallback();
        }

        canvas.mousemove("mousemove", function(e) {
            if (dragging && currentPoint)
                return;
            var selectPointCoords = {i:-1, j:-1};
            var point = findPoint(points(), event.offsetX, event.offsetY, selectPointCoords, width, height);
            redraw(point ? selectPointCoords : null);
        });
        
        function mouseUp(e){
            document.removeEventListener("mousemove", mouseMove, true);
            document.removeEventListener("mouseup", mouseUp, true);
            e.preventDefault();
            dragging = false;
            redraw();
        }
        
        zslider.change(function() {
            if (currentPoint) {
                currentPoint[2] = parseFloat(zslider.attr("value"));
                redraw();
                updateCallback();
            }
        });
    
        function updateZSlider() {
            if (!currentPoint) {
                zslider.attr("disabled", "disabled").hide();
            } else {
                zslider.removeAttr("disabled").show();
                zslider.attr("value", currentPoint[2]);
            }
        }
        
        redraw();
        
        return {
            redraw: redraw,
            hasPoints: hasPoints,
            points: points,
            setPoints: setPoints
        };
    }
    
    function generateWarpArray(points, colors) {
        var controlPoints = [];
        for (var i = 0; i < points.length; ++i) {
            var l = points[i].length;
            for (var j = 0; j < l; ++j) {
                var p = points[i][j];
                controlPoints.push(colors.value(p[0]));
                controlPoints.push(colors.value(p[1]));
                controlPoints.push(colors.value(p[2]));
            }
        }
        return colors.fn("array", controlPoints);
    }
    
    function generateWarpPoints() {
        var l = -0.5,
            t = -0.5,
            w = 1,
            h = 1; // height

        var countX = 4;
        var countY = 4;
    
        var hW = w  / (countX - 1);
        var hH = h / (countY - 1);
    
        var k = [];
        for (var j = 0; j < countY; ++j) {
            var row = []; 
            for (var i = 0; i < countX; ++i)
                row.push([i * hW + l, j * hH + t, 0]);
            k.push(row);
        }
        
        return k;
    }
    
    Global.WarpHelpers = {
        buildWarpCanvas: buildWarpCanvas,
        generateWarpArray: generateWarpArray,
        generateWarpPoints: generateWarpPoints
    };
    
})();