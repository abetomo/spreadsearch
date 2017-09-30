# spreadsearch

[![npm version](https://badge.fury.io/js/%40abetomo%2Fspreadsearch.svg)](https://badge.fury.io/js/%40abetomo%2Fspreadsearch)

Search Google Spreadsheet data using Groonga.

## install
[Groonga]:http://groonga.org/
[Nroonga]:https://nroonga.github.io/

Please install as [Nroonga][] needs [Groonga][].

After groonga installed, just do

```
% npm install @abetomo/spreadsearch
```

## Usage
### init
```
% spreadsearch init
Please set the '${HOME}/.spreadsearch/config.json'.
```

Please set it to `config.json`.

### Update data
```
% spreadsearch dataUpdate
```

Get data from the spreadsheet and make it searchable.

### Search
```
% spreadsearch
Query> test
...Display results

Query>
```
