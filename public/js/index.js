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
	    .text(scoreString(data.results.score));

	const scoreX = d3.scaleLinear([0, 1], [0, 500]);
	const scoreSvg = d3.select('#divScore').append('svg')
	      .attr('class', 'score-svg');

	// Score indicator
	scoreSvg.selectAll('rect.score-inner-rect')
	    .data([data.results.score])
	    .enter()
	    .append('rect')
	    .attr('class', 'score-inner-rect')
	    .attr('x',0)
	    .attr('y',0)
	    .attr('height',5)
	    .transition(t)
	    .attr('width', d => scoreX(d));

	const xAxis = d3.axisBottom().scale(scoreX);
	scoreSvg.append('g')
	    .attr('transform', 'translate(0,5)')
	    .call(xAxis);

	// Components
	d3.select('#divComponents').append('table').selectAll('tr')
	    .data(data.results.components)
	    .join('tr')
	    .selectAll('td')
	    .data(d => [camel2title(d.name), d.value])
	    .enter().append('td')
	    .append('span')
	    .text((d, i) => i == 0 ? d : '')
	    .attr('class', (d, i) => i == 0 ? 'component-name tooltip' : 'component-value');

	d3.selectAll('span.tooltip')
	    .data(data.results.components)
	    .join('span')
	    .append('span')
	    .attr('class', 'tooltiptext')
	    .text(d => d.desc);

	const componentX = d3.scaleLinear([0, 1], [0, 200]);
	const componentColor = d3.scaleLinear([0, 1], ['#cccaca', '#000000']);
	d3.selectAll('span.component-value')
	    .data(data.results.components)
	    .append('svg')
	    .attr('width', 200)
	    .attr('height', 5)
	    .append('rect')
	    .attr('x', 0)
	    .attr('y', 0)
	    .attr('height', 5)
	    .attr('fill', d => componentColor(d.value))
	    .attr('width', d => componentX(d.value));
    }
}

const camel2title = camelCase => camelCase
  .replace(/([A-Z])/g, match => ` ${match}`)
      .replace(/^./, match => match.toUpperCase());

const scoreString = n => {
    if (n < 0.3) return 'Content may be harmful';
    if (n < 0.7) return 'Content is questionable';
    return 'Content looks good';
}

// Event bindings
btnStartStop.on('click', startStopHandler);
