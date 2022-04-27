# NModelize (not loger maintained, this is from a backup of my old GitHub account)

> Like it were a model.

NModelize is a small and basic module that brings functions to create pseudo-models with functions to work with sql databases on node using the ```nsqlize``` package. It is inspired by the laravel eloquent model's coding style, but write from zero and conmbined with javascript modules' style.
NOTE: it still in development and is unstable, use it just for test purposes, it may containg dangerous bugs.

Summary: the module contains some basic functions just for a CRUD unsing a model-like syntaxis, ant totally asynchronous database's calls.

## Installation

This repo' can be cloned or directly downloaded and placed everywhere inside the project's folder as long as the ```require()``` function points to the correct path to the file ```nmodelize.js```.

### npm

The ```nmodelize``` module is available on Github Pakages, to install from it, ```git``` and ```npm``` must be installed and the next command must be writen and executed on the CLI:

```
npm install netherlink117/nmodelize --save
```

Then the module's configuration for ```nsqlize``` must be created under the ```nsqlize``` folder from the ```root``` path of the project/package, like is shown in the example below (because this module requires the ```nsqlize``` package's module).

```
├── node_modules
│   └── ...
├── public
│   └── ...
└── nsqlize             # nsqlize folder in root folder
│   └── config.json     # configuration file, its content is an object with host, user, password and database; as properties
├── app.js
├── package.json
│
```

Since the ```nmodelize``` module already has a declaracion to require the ```nsqlize``` module, the ```nmodelize``` modules just need to be included with the ```require()``` function, preferably somewhere with scope required like new pseudo-model's files.

```javascript
let nsqlize = require('@netherlink117/nmodelize');
```

If the above steps were followed correctly, then ```nmodelize``` is ready to create new pseudo-models.

## Why?

There are many frameworks that can do almost everything, but some of those frameworks requires and generates stuff that sometimes is not easy to catch. So this alternative lets do stuff which is relatively easy to catch. Also this module is like a continuation to the ```nsqlize``` package's module.

## Usage

The usage is relatively simple, it's almost like using laravel functions (currently it is limited to simple CRUD functions), but on node.

### Creating a new pseudo-model:

There are multiple forms to define a pseudo-model, it depends of the configuration and name passed to the ```create()``` function.

- First we call the ```nmodelize.create()``` function which can be called this way:

    ```javascript
    let PseudoModel = nmodelize.create('PseudoModel',{
        table: 'tableName', // optional, whatever your table name is (default = the providen model's name to lower case)
        autoincrements: true, // optional, set to false if table's primary key is not autoincrement (default = true)
        primary: 'primaryKey', // optional, whatever your primary key is on the table (defaut = id)
        attributes: [ // required, the column names of your table's columns
            'attribute1',
            'attribute2',
            'attribute3'
        ],
        hidden: [ // optional as you require, these are hidden from the toString() return (default = []
            'hidden1',)
            'hidden2'
        ]
    })
    ```

- Now create an instace of the pseudo-model. It can be created with the pseudo-model variable, so to create new instances, following the example above (of ```PseodoModel```), you can do:

    ```javascript
    let instance1 = new PseudoModel();
    ```

    The resulting of that call would be on an object like this (just as example):

    ```javascript
    {
        //properties
        primaryKey: null,
        attribute1: null,
        attribute2: null,
        attribute3: null,
        hidden1: null,
        hidden2: null,
        // functions
        async save(),
        saveStatement(),
        async find(id),
        findStatement(id),
        async where(conditions),
        whereStatement(conditions),
        async delete(),
        deleteStatement(),
        parse(object),
        parseString(jsonString),
        toString()
    }
    // table and autoincrements does not form the pseudo-model properties as its names as properties
    ```

    Even with the structure of the pseudo-model from above, the function ```JSON.stringify()``` would return all properties from the instance, if you want to get an string without the hidden properties, the ```instance1.toString()``` can help since it hiddes the hidden properties, however, from the instance itsself the hidden properties still accesible.

- After that, we have a pseudo-model object, you can assing values to the properties described in the pseudo-model creation, as it where a model:

    ```javascript
    instance1.attribute1 = 'value1';
    instance1.attribute2 = 'value2';
    instance1.attribute3 = 'value3';
    instance1.hidden2 = 'value4';
    ```

    The pseudo-model's result is now something like:

    ```javascript
    {
        //properties
        primaryKey: null,
        attribute1: 'value1',
        attribute2: 'value2',
        attribute3: 'value3',
        hidden1: null,
        hidden2: 'value4',
        // functions
        async save(),
        saveStatement(),
        async find(id),
        findStatement(id),
        async where(conditions),
        whereStatement(conditions),
        async delete(),
        deleteStatement(),
        parse(object),
        parseString(jsonString),
        toString()
    }
    ```
    WARNING: the module still in development, assingning new properties not defined in the pseudo-module creation can result on an unstable behavior.

### Storing pseudo-model instance's data into database:

After creating an pseudo-model instance and filling it with the required values, all the values asigned to the instance can be stored using the function ```save()```.

- First we ensure that the pseudo-model properties and values match the structure of the database (columns names, constrains, etc) so the ```nsqlize``` module doesn't throw exceptions, then we can do:

    ```javascript
    let result = await instance1.save();
    ```

    Since the function ```save()``` is asynchronous, to get back some result you must use the ```await``` keyword. The example above will return ```null``` to the ```result``` if errors ocurred, or an ```object``` if the object is stored successfully or else the number of rows affected if the ```save()``` function is used to update.

### Retrieve data to pseudo-model's instance

Since the ```find()``` function is based on promises, to retrieve data it must be inside an asynchronous block of code and use the ```await``` keyword. The ```where``` function still in development, by now it retrieves an ```nsqlize``` statement.

- Single pseudo-model's instance:

    ```javascript
    let result = await PseudoModel().find(7);
    ```

    Or

    ```javascript
    let result = await PseudoModel().findOrFail(7);
    ```

    The function ```find()``` will return ```null``` if no data is found, the function ```findOrFail()``` will ```throw``` an ```exception``` if no data is found.

- Multiple pseudo-model's instances:

    ```javascript
    // you can set filters and options as on nsqlize
    PseudoModel().where('attribute1', '>', 3).orWhere('attribute2', 'like', 'A%').orderBy('attribute1', 'asc').limit(7).go().then((result) => {
        let instances = [];
        for (let i = 0; i < result.length; i++) { // result is an array of rows, just iterate it to parse each row
            instances.push(PseudoModel().parseObject(result[i]));
        }
    }).catch((error) => {
        console.log(error);
    })
    ```

    As for the ```where()``` and ```whereStatement()``` functions, they still in development, they wil return an ```nsqlize``` statement.

### Updating database with pseudo-model instance's data

It's quite simple to update the dabase with the pseudo-model, a complete example would be like this:

- First, get the data using the ```find()``` or ```where()``` functions, if you use the ```where()``` function, you will need to parse it to pseudo-model instances, so you can use the ```save()``` function to update it, then do (assuming only one pseudo-model need update):

    ```javascript
    let instance3 = PseudoModel().find(7);
    instance3.attribute3 = 'new values3';
    instance3.attribute1 = 'new values1';
    instance3.hidden2 = 'new value4';
    let result = await instance3.save();
    if (result !== null) {
        console.log('Saved!);
    } else {
        console.log('Error!);
    }
    ```

    NOTE: take in count that the function still asynchronous so you must use ```await``` inside asynchronous block of code.

### Deleting data from database using pseudo-model's instance

The deleting process is similar to the update, the pseudo-model includes a ```delete``` function which deletes the information of the pseudo-model instance itself and from the database.

- First, like it where an update, parse an object from the database if you used the function ```where```, then call the ```delete()``` function of the parsed pseudo-model, as show below:

    ```javascript
    let instance4 = PseudoModel().find(7);
    let result = await instance4.delete();
    if (result !== null && result < 0) {
        console.log('Deleted!);
    } else {
        console.log('Error!');
    }
    ```

    WARNING: just use with caution.

### Recommendations

You can always check the pseudo-model object generated and returned by each function, by using the ```console.log()``` function and the ```toString()``` function of the instance (but this last one doesnt show the hidden properties). This module is intented to work with ongoing  or small projects, for new projects or big ones I suggest to use more complete frameworks.

By the way, this small project that I made was only for personal uses... But now I want to share it with the people (even when no one cares).
The project is under the MIT license and may containg bugs, use at your own responsability.

I'm open to any suggestion to changes to the module, feel free to contact me.

Regards:

Daniel

## License

MIT