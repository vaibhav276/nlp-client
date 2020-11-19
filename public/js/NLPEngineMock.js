class NLPEngineMock {
    constructor(serverAddr) {
	this.stepIter = 0;
	this.allSteps = [
	    'Extracting text',
	    'Identifying sentences',
	    'Running algorithms',
	    'Done'
	]
    }

    _create = url => {
    	return {reqId: 'k3kjk', url: url}; // reqId
    }
    
    _steps = reqId => {
    	let res = [];
    	for (let i = 0; i <= this.stepIter; i++) {
    	    res.push(this.allSteps[i]);
    	}
    	if (this.stepIter < this.allSteps.length - 1 &&
	    Math.random() < 0.3) this.stepIter++;
    	return res;
    }

    _nlpResults = reqId => {
	const excerpt = "The economic situation is apparently so grim that some experts fear we may be in for a stretch as bad as the mid seventies. When Microsoft and Apple were founded. As those examples suggest, a recession may not be such a bad time to start a startup. I'm not claiming it's a particularly good time either. The truth is more boring: the state of the economy doesn't matter much either way. If we've learned one thing from funding so many startups, it's that they succeed or fail based on the qualities of the founders. The economy has some effect, certainly, but as a predictor of success it's rounding error compared to the founders.";
	
	const score = Math.random(); // [0, 1)

	const components = [
	    {name: 'clickbait', desc: 'Article headlines which at the expense of being informative, are designed to entice readers into clicking the accompanying link.', value: Math.random()},
	    {name: 'politicalBias', desc: 'Strongly biased political language.', value: Math.random()},
	    {name: 'toxicity', desc: 'Demeaning and abusive language in general.', value: Math.random()},
	    {name: 'obscenity', desc: 'Obscene or profane language.', value: Math.random()},
	    {name: 'racism', desc: 'Demeaning and abusive language targeted towards a particular ethnicity, usually with stereotypes.', value: Math.random()},
	    {name: 'sexism', desc: 'Demeaning and abusive language targeted towards a particular gender, usually with stereotypes.', value: Math.random()},
	    {name: 'insult', desc: 'Scornful remarks directed towards an individual.', value: Math.random()},
	    {name: 'threat', desc: 'Expressing a wish or intention for pain, injury, or violence against an individual or group.', value: Math.random()}
	];

	return {
	    excerpt: excerpt,
	    score: score,
	    components: components
	}
    }

    create = url => {
	return this._create(url);
    }
    
    fetch = reqId => {
	const ss = this._steps(reqId);
	let done = false;
	let nlpResults = null;
	if (ss.length === this.allSteps.length) done = true;
	if (done === true) {
	    nlpResults = this._nlpResults(reqId);
	}

	return {
	    steps: ss,
	    done: done,
	    results: nlpResults
	}
    }
}
