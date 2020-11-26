// Global variables
let poller = null;
let reqId = null;
let nlpEngine = null;
const pollDuration = 1000; // milliseconds
const btnStartStop = d3.select('#btnStartStop');
const txtInputUrl = d3.select('#txtInputUrl');

// Event Handlers
const startStopHandler = () => {
    if (reqId === null) {
	resetDOM();
	nlpEngine = new NLPEngineMock('localhost:3000');
	// nlpEngine = new NLPEngine('http://redbuzz.us/facto/');
	const inputUrl = txtInputUrl.property('value');
	createRequest(inputUrl, d => {
	    reqId = d.reqId;
	    startPolling();
	});
    }
    else {
	stopPolling();
	reqId = null;
	nlpEngine = null;
    }
}

// Utility functions
const createRequest = (url, cb) => {
    nlpEngine.create(url, d => {
	cb(d);
    });
}

const startPolling = () => {
    btnStartStop.text('Stop');
    poller = setInterval(pollHandler, pollDuration);
}

const stopPolling = () => {
    btnStartStop.text('Start');
    clearInterval(poller);
    poller = null; // TODO: execute after async call to clearInterval above returns
    reqId = null;
}

const pollHandler = () => {
    // Poll server and update DOM
    nlpEngine.fetch(reqId, d => {
	console.log('Data', d);
	updateDOM(d);
	if (d.done === true) stopPolling();
    });
}

const resetDOM = () => {
    d3.select('#ulSteps').selectAll('li').remove();
    const divExcerpt = d3.select('#divExcerpt');
    divExcerpt.select('a')
	.attr('href', null)
	.text('');
    divExcerpt.select('p').text('');

    d3.select('#divScore').select('p').text('');
    d3.select('#divScore').selectAll('svg').remove();

    d3.select('#divComponents').select('table').remove();
}

const updateDOM = data => {
    // Update DOM
    const lastStep = data.steps.pop() || '';
    d3.select('#spanLastStepText')
	.text(lastStep);

    if (data.done === true) {
	const t = d3.transition()
	      .duration(2000)
	      .ease(d3.easeLinear);

	d3.select('#spanLastStepText')
	    .text('');

	const divExcerpt = d3.select('#divExcerpt');
	divExcerpt.select('a')
	    .attr('href', txtInputUrl.property('value'))
	    .attr('target', '_blank')
	    .text('View original page');
	divExcerpt.select('p').text(data.results.excerpt);

	d3.select('#divScore').select('p')
	    .transition(t)
	    .text(scoreString(data.results.score));

	const scoreX = d3.scaleLinear([0, 1], [0, 500]);
	const scoreColor = d3.scaleLinear([0, 1], ["red", "green"]);
	const scoreSvg = d3.select('#divScore').append('svg')
	      .attr('class', 'score-svg');

	// Score outer rect
	scoreSvg.append('rect')
	    .attr('class', 'score-outer-rect')
	    .attr('x',0)
	    .attr('y',0)
	    .attr('width', (510 * 0.3))
	    .attr('height',20)
	    .attr('fill', '#FDC6C0');
	scoreSvg.append('rect')
	    .attr('class', 'score-outer-rect')
	    .attr('x', (510 * 0.3))
	    .attr('y',0)
	    .attr('width', (510 * 0.4))
	    .attr('height',20)
	    .attr('fill', '#FBFDC0');
	scoreSvg.append('rect')
	    .attr('class', 'score-outer-rect')
	    .attr('x', (510 * 0.7))
	    .attr('y',0)
	    .attr('width', (510 * 0.3))
	    .attr('height',20)
	    .attr('fill', '#C0FDD1');

	// Score indicator
	scoreSvg.selectAll('rect.score-inner-rect')
	    .data([0])
	    .enter()
	    .append('rect')
	    .attr('class', 'score-inner-rect')
	    .attr('x',5)
	    .attr('y',10)
	    .attr('width', d => scoreX(d))
	    .attr('height',5);

	scoreSvg.selectAll('rect.score-inner-rect')
	    .data([data.results.score])
	    .transition(t)
	    .attr('width', d => scoreX(d))

	// Components
	d3.select('#divComponents').append('table').selectAll('tr')
	    .data(data.results.components)
	    .join('tr')
	    .selectAll('td')
	    // .data(d => [camel2title(d.name), floatToPercentageString(d.value) + ' likely', d.desc])
	    .data(d => [camel2title(d.name), floatToPercentageString(d.value) + ' likely'])
	    .enter().append('td')
	    .append('span')
	    .text(d => d)
	    .attr('class', (d, i) => i == 0 ? 'component-name tooltip' : 'component-value');

	d3.selectAll('span.tooltip')
	    .data(data.results.components)
	    .join('span')
	    .append('span')
	    .attr('class', 'tooltiptext')
	    .text(d => d.desc);


	// d3.select('#divComponents').selectAll('div')
	//     .data(data.results.components)
	//     .join('div')
	//     .selectAll('span')
	//     .data(d => [camel2title(d.name), floatToPercentageString(d.value) + ' likely', d.desc])
	//     .join('span')
	//     .text(d => d)
	//     .classed('component-pill', (d, i) => i == 1)
    }
}

const camel2title = camelCase => camelCase
  .replace(/([A-Z])/g, match => ` ${match}`)
      .replace(/^./, match => match.toUpperCase());

const floatToPercentageString = n => {
    const rn = Number(Math.round((n * 100)+'e'+2)+'e-'+2);
    return rn + '%';
}

const scoreString = n => {
    // return 'Overall Score: '
    // 	+ n
    // 	+ ' (<0.3 : Content may be harmful, 0.3 - 0.7: Content is questionble, >0.7: Content looks good)';
    if (n < 0.3) return 'Content may be harmful';
    if (n < 0.7) return 'Content is questionable';
    return 'Content looks good';
}

// Event bindings
btnStartStop.on('click', startStopHandler);
