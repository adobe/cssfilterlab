/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

(function () {
    
    var factors = {};
    function factor(n) {
        if (factors[n])
            return factors[n];
        var factor = 1;
        for (var i=2; i<=n; ++i)
            factor*=i;
        factors[n] = factor;
        return factor;
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
    
    function draw(el, width, height, k, currentPointCoords) {
        var c = el.getContext("2d");
        c.save();

        // Background layer
        c.fillStyle = "#202020";
        c.fillRect(0, 0, width, height);
        
        // Mesh layer
        c.lineWidth = 1;
        c.strokeStyle = "#414141";
    
        c.beginPath();
        var n = k.length - 1, m = k[0].length - 1;
        for (var i = 0; i < 1; i += 0.1) {
            var first = true;
            for (var j = 0; j < 1; j += 0.1) {
                var p = calculate(i, j, n, m, k);
                if (first)
                    c.moveTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                else
                    c.lineTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                first = false;
            }
        }
    
        for (var j = 0; j < 1; j += 0.1) {
            var first = true;
            for (var i = 0; i < 1; i += 0.1) {                    
                var p = calculate(i, j, n, m, k);
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
        for (var i = 0; i <= n; ++i) {
            for (var j = 0; j <= m; ++j) {
                var p = k[i][j];
                if (!j)
                    c.moveTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
                else
                    c.lineTo(toCanvasCoord(p[0], width), toCanvasCoord(p[1], height));
            }
        }
        for (var j = 0; j <= m; ++j) {
            for (var i = 0; i <= n; ++i) {
                var p = k[i][j];
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


        for (var i = 0; i <= n; ++i) {
            for (var j = 0; j <= m; ++j) {
                var p = k[i][j];
                if (i == currentPointCoords.i && j == currentPointCoords.j)
                    c.shadowBlur = 15;
                else
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
        return (toCanvasCoord(p[0], w) - pointSize) < x && (toCanvasCoord(p[0], w) + pointSize) > x
                && (toCanvasCoord(p[1], h) - pointSize) < y && (toCanvasCoord(p[1], h) + pointSize) > y;
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
            zslider = $("<input type='range' min='-1000' max='1000' value='0' />")
                      .appendTo(parent)
					  .css({
							"position": "absolute",
							"top":  "-2px",
							"left": "-30px",   
							"height": height + "px",
							"width": "20px",
							"-webkit-appearance": "slider-vertical"
					  });
        };
        
        var canvas = $("<canvas />")
					.appendTo(parent)
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
            return pointsRef = points;
        }
        
        function redraw(pointCoords) {
            if (!hasPoints()) return;
            draw(canvas[0], width, height, points(), pointCoords ? pointCoords : currentPointCoords);
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
        };

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
        };
        
        zslider.change(function() {
            if (currentPoint) {
                currentPoint[2] = parseFloat(zslider.attr("value"));
                redraw();
                updateCallback();
            }
        });
    
        function updateZSlider() {
            if (!currentPoint) {
                zslider.attr("disabled", "disabled");
            } else {
                zslider.removeAttr("disabled");
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