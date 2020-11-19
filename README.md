## Server side API

### Create

#### Request
```sh
method: POST
data: { url: <url> }
```

#### Response
```js
{
	reqId: <reqId>,
	url: <url>
}
```
### Fetch

#### Request
```sh
method: GET
data: { reqId: <url> }
```

#### Response (Intermediate)
```js
{
   done: false
   results: null
   steps: [
      "Extracting text",
      "Identifying sentences",
      "Running algorithms"
   ]
}
```

#### Response (Final)
```js
{
   done: true
   results: {
   components: [
      {name: "clickbait", desc: "Article headlines which at the expense of being in…tice readers into clicking the accompanying link.", value: 0.32563231753117106},
      {name: "politicalBias", desc: "Strongly biased political language.", value: 0.9014233507164169},
      {name: "toxicity", desc: "Demeaning and abusive language in general.", value: 0.8211167341430876},
      {name: "obscenity", desc: "Obscene or profane language.", value: 0.6592257750235573},
      {name: "racism", desc: "Demeaning and abusive language targeted towards a particular ethnicity, usually with stereotypes.", value: 0.7447797974426689},
      {name: "sexism", desc: "Demeaning and abusive language targeted towards a particular gender, usually with stereotypes.", value: 0.8139544456311976},
      {name: "insult", desc: "Scornful remarks directed towards an individual.", value: 0.15479937630592988},
      {name: "threat", desc: "Expressing a wish or intention for pain, injury, or violence against an individual or group.", value: 0.5494607069243791}
   ],
   excerpt: "The economic situation is apparently so grim that some experts fear we may be in for a stretch as bad as the mid seventies. When Microsoft and Apple were founded. As those examples suggest, a recession may not be such a bad time to start a startup. I'm not claiming it's a particularly good time either. The truth is more boring: the state of the economy doesn't matter much either way. If we've learned one thing from funding so many startups, it's that they succeed or fail based on the qualities of the founders. The economy has some effect, certainly, but as a predictor of success it's rounding error compared to the founders.",
   score: 0.5782727133733847
}
```