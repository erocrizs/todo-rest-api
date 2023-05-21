# TODO Rest API Server
A REST API server for a To Do list. Made with ExpressJS.

## Running
### Installation
```
npm install
```

### Environment Variables
* `PORT` - port where the express app will be hosted on (default `3000`)
* `DB_JSON` - filepath to the JSON mock database relative to the project root

### JSON Database
The JSON file follows the format:
```js
{
    "task": [
      // tasks here
    ]
}
```

Each task follows the format:
```js
{
    "id": "59403f04-c01e-4ce6-be0a-de807ffd0b13", // UUID identifier for tasks
    "title": "Buy catfood", // string
    "description": "My cat likes wet catfood, avoid dry", // string
    "isDone": false // boolean
}
```

### Serve
```
npm start
```

## Contributing
### Running
```
npm install
npx husky install
npm run dev
```

### Testing
```
npm test
```

### Linting
```
npm run format
```