/** 
 * @fileoverview Test cases for how axis labels are chosen and formatted.
 *
 * @author dan@dygraphs.com (Dan Vanderkam)
 */
var AxisLabelsTestCase = TestCase("axis-labels");

AxisLabelsTestCase.prototype.setUp = function() {
  document.body.innerHTML = "<div id='graph'></div>";
};

AxisLabelsTestCase.prototype.tearDown = function() {
};

function getYLabels() {
  var y_labels = document.getElementsByClassName("dygraph-axis-label-y");
  var ary = [];
  for (var i = 0; i < y_labels.length; i++) {
    ary.push(y_labels[i].innerHTML);
  }
  return ary;
}

function getXLabels() {
  var x_labels = document.getElementsByClassName("dygraph-axis-label-x");
  var ary = [];
  for (var i = 0; i < x_labels.length; i++) {
    ary.push(x_labels[i].innerHTML);
  }
  return ary;
}

function getLegend() {
  var legend = document.getElementsByClassName("dygraph-legend")[0];
  return legend.textContent;
}

AxisLabelsTestCase.prototype.testMinusOneToOne = function() {
  var opts = {
    width: 480,
    height: 320
  };
  var data = "X,Y\n" +
      "0,-1\n" +
      "1,0\n" +
      "2,1\n" +
      "3,0\n"
  ;

  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);

  // TODO(danvk): would ['-1.0','-0.5','0.0','0.5','1.0'] be better?
  assertEquals(['-1','-0.5','0','0.5','1'], getYLabels());
  assertEquals("X,Y\n" + "0,-1\n" + "1,0\n" + "2,1\n" + "3,0\n", g.file_);

  // Go up to 2
  data += "4,2\n";
  g.updateOptions({file: data});
  assertEquals(['-1','-0.5','0','0.5','1','1.5','2'], getYLabels());

  // Now 10
  data += "5,10\n";
  g.updateOptions({file: data});
  assertEquals(['-2','0','2','4','6','8','10'], getYLabels());

  // Now 100
  data += "6,100\n";
  g.updateOptions({file: data});
  assertEquals(['0','20','40','60','80','100'], getYLabels());

  g.setSelection(0);
  assertEquals('0: Y:-1', getLegend());
};

AxisLabelsTestCase.prototype.testSmallRangeNearZero = function() {
  var opts = {
    width: 480,
    height: 320
  };
  var data = "X,Y\n" +
      "0,-1\n" +
      "1,0\n" +
      "2,1\n" +
      "3,0\n"
  ;
  opts.valueRange = [-0.1, 0.1];

  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);
  assertEquals(["-0.1","-0.08","-0.06","-0.04","-0.02","0","0.02","0.04","0.06","0.08"], getYLabels());

  opts.valueRange = [-0.05, 0.05];
  g.updateOptions(opts);
  // TODO(danvk): why '1.00e-2' and not '0.01'?
  assertEquals(["-0.05","-0.04","-0.03","-0.02","-0.01","0","1.00e-2","0.02","0.03","0.04"], getYLabels());

  opts.valueRange = [-0.01, 0.01];
  g.updateOptions(opts);
  assertEquals(["-0.01","-8.00e-3","-6.00e-3","-4.00e-3","-2.00e-3","0","2.00e-3","4.00e-3","6.00e-3","8.00e-3"], getYLabels());

  g.setSelection(1);
  assertEquals('1: Y:0', getLegend());
};

AxisLabelsTestCase.prototype.testSmallRangeAwayFromZero = function() {
  var opts = {
    width: 480,
    height: 320
  };
  var data = "X,Y\n" +
      "0,-1\n" +
      "1,0\n" +
      "2,1\n" +
      "3,0\n"
  ;
  var graph = document.getElementById("graph");

  opts.valueRange = [9.9, 10.1];
  var g = new Dygraph(graph, data, opts);
  assertEquals(["9.9","9.92","9.94","9.96","9.98","10","10.02","10.04","10.06","10.08"], getYLabels());

  opts.valueRange = [9.99, 10.01];
  g.updateOptions(opts);
  // TODO(danvk): this is bad
  assertEquals(["9.99","9.99","9.99","10","10","10","10","10","10.01","10.01"], getYLabels());

  opts.valueRange = [9.999, 10.001];
  g.updateOptions(opts);
  // TODO(danvk): this is even worse!
  assertEquals(["10","10","10","10","10","10","10","10","10","10"], getYLabels());

  g.setSelection(1);
  assertEquals('1: Y:0', getLegend());
};

AxisLabelsTestCase.prototype.testXAxisTimeLabelFormatter = function() {
  var opts = {
    width: 480,
    height: 320
  };
  var data = [[5.0,0],[5.1,1],[5.2,2],[5.3,3],[5.4,4],[5.5,5],[5.6,6],[5.7,7],[5.8,8],[5.9,9]];
  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);
  g.updateOptions({
    xAxisLabelFormatter: function (totalMinutes) {
      var hours   = Math.floor( totalMinutes / 60);
      var minutes = Math.floor((totalMinutes - (hours * 60)));
      var seconds = Math.round((totalMinutes * 60) - (hours * 3600) - (minutes * 60));

      if (hours   < 10) hours   = "0" + hours;
      if (minutes < 10) minutes = "0" + minutes;
      if (seconds < 10) seconds = "0" + seconds;

      return hours + ':' + minutes + ':' + seconds;
    }
  });

  assertEquals(["00:05:00","00:05:12","00:05:24","00:05:36","00:05:48"], getXLabels());

  // The legend does not use the xAxisLabelFormatter:
  g.setSelection(1);
  assertEquals('5.1: Y1:1', getLegend());
};

AxisLabelsTestCase.prototype.testAxisLabelFormatter = function () {
  var opts = {
    width: 480,
    height: 320,
    xAxisLabelFormatter: function(x, granularity) {
      return 'x' + x;
    },
    yAxisLabelFormatter: function(y) {
      return 'y' + y;
    },
    labels: ['x', 'y']
  };
  var data = [];
  for (var i = 0; i < 10; i++) {
    data.push([i, 2 * i]);
  }
  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);

  assertEquals(['x0','x2','x4','x6','x8'], getXLabels());
  assertEquals(['y0','y2','y4','y6','y8','y10','y12','y14','y16','y18'], getYLabels());

  g.setSelection(2);
  assertEquals("2: y:4", getLegend());
};

AxisLabelsTestCase.prototype.testDateAxisLabelFormatter = function () {
  var opts = {
    width: 480,
    height: 320,
    xAxisLabelFormatter: function(x, granularity) {
      return 'x' + x.strftime('%Y/%m/%d');
    },
    yAxisLabelFormatter: function(y) {
      return 'y' + y;
    },
    labels: ['x', 'y']
  };
  var data = [];
  for (var i = 1; i < 10; i++) {
    data.push([new Date("2011/01/0" + i), 2 * i]);
  }
  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);

  assertEquals(["x2011/01/01", "x2011/01/02", "x2011/01/03", "x2011/01/04", "x2011/01/05", "x2011/01/06", "x2011/01/07", "x2011/01/08", "x2011/01/09"], getXLabels());
  assertEquals(['y2','y4','y6','y8','y10','y12','y14','y16','y18'], getYLabels());

  g.setSelection(0);
  assertEquals("2011/01/01: y:2", getLegend());
};

// This test verifies that when a valueFormatter is set (but not an
// axisLabelFormatter), then the valueFormatter is used to format the axis
// labels.
AxisLabelsTestCase.prototype.testValueFormatter = function () {
  var opts = {
    width: 480,
    height: 320,
    xValueFormatter: function(x) {
      return 'x' + x;
    },
    yValueFormatter: function(y) {
      return 'y' + y;
    },
    labels: ['x', 'y']
  };
  var data = [];
  for (var i = 0; i < 10; i++) {
    data.push([i, 2 * i]);
  }
  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);

  // This is the existing behavior:
  assertEquals(["0","2","4","6","8"], getXLabels());
  //assertEquals(["y0","y1","y2","y3","y4","y5","y6","y7","y8"], getXLabels());

  // This is the correct behavior:
  // assertEquals(['x0','x2','x4','x6','x8'], getXLabels());

  assertEquals(['y0','y2','y4','y6','y8','y10','y12','y14','y16','y18'], getYLabels());

  // the valueFormatter options also affect the legend.
  g.setSelection(2);
  assertEquals("x2: y:y4", getLegend());
};

AxisLabelsTestCase.prototype.testDateValueFormatter = function () {
  var opts = {
    width: 480,
    height: 320,
    xValueFormatter: function(x) {
      return 'x' + x.strftime('%Y/%m/%d');
    },
    yValueFormatter: function(y) {
      return 'y' + y;
    },
    labels: ['x', 'y']
  };

  var data = [];
  for (var i = 1; i < 10; i++) {
    data.push([new Date("2011/01/0" + i), 2 * i]);
  }
  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);

  // This is the existing behavior:
  assertEquals(["01Jan","02Jan","03Jan","04Jan","05Jan","06Jan","07Jan","08Jan","09Jan"], getXLabels());
  // This is the correct behavior:
  // assertEquals(["x2011/01/01", "x2011/01/02", "x2011/01/03", "x2011/01/04", "x2011/01/05", "x2011/01/06", "x2011/01/07", "x2011/01/08", "x2011/01/09"], getXLabels());
  assertEquals(['y2','y4','y6','y8','y10','y12','y14','y16','y18'], getYLabels());

  // the valueFormatter options also affect the legend.
  // TODO(danvk): this should get the same type of input as the axisLabelFormatter.
  // g.setSelection(2);
  // assertEquals("x2011/01/03: y:y20", getLegend());
};

// This test verifies that when both a valueFormatter and an axisLabelFormatter
// are specified, the axisLabelFormatter takes precedence.
AxisLabelsTestCase.prototype.testAxisLabelFormatterPrecedence = function () {
  var opts = {
    width: 480,
    height: 320,
    xValueFormatter: function(x) {
      return 'xvf' + x;
    },
    yValueFormatter: function(y) {
      return 'yvf' + y;
    },
    xAxisLabelFormatter: function(x, granularity) {
      return 'x' + x;
    },
    yAxisLabelFormatter: function(y) {
      return 'y' + y;
    },
    labels: ['x', 'y']
  };
  var data = [];
  for (var i = 0; i < 10; i++) {
    data.push([i, 2 * i]);
  }
  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);

  assertEquals(['x0','x2','x4','x6','x8'], getXLabels());
  assertEquals(['y0','y2','y4','y6','y8','y10','y12','y14','y16','y18'], getYLabels());

  g.setSelection(9);
  assertEquals("xvf9: y:yvf18", getLegend());
};

// This is the same as the previous test, except that options are added
// one-by-one.
AxisLabelsTestCase.prototype.testAxisLabelFormatterIncremental = function () {
  var opts = {
    width: 480,
    height: 320,
    labels: ['x', 'y']
  };
  var data = [];
  for (var i = 0; i < 10; i++) {
    data.push([i, 2 * i]);
  }
  var graph = document.getElementById("graph");
  var g = new Dygraph(graph, data, opts);
  g.updateOptions({
    xValueFormatter: function(x) {
      return 'xvf' + x;
    }
  });
  g.updateOptions({
    yValueFormatter: function(y) {
      return 'yvf' + y;
    }
  });
  g.updateOptions({
    xAxisLabelFormatter: function(x, granularity) {
      return 'x' + x;
    }
  });
  g.updateOptions({
    yAxisLabelFormatter: function(y) {
      return 'y' + y;
    }
  });

  assertEquals(["x0","x2","x4","x6","x8"], getXLabels());
  //assertEquals(['0','2','4','6','8','10','12','14','16','18'], getYLabels());

  //assertEquals(["y0","y1","y2","y3","y4","y5","y6","y7","y8"], getXLabels());
  //assertEquals(['x0','x2','x4','x6','x8'], getXLabels());
  assertEquals(['y0','y2','y4','y6','y8','y10','y12','y14','y16','y18'], getYLabels());

  g.setSelection(9);
  assertEquals("xvf9: y:yvf18", getLegend());
  // assertEquals("9: y:18", getLegend());
};
