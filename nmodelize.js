let pluralize = require('pluralize');
let nsqlize = require('@netherlink117/nsqlize');
module.exports = {
    create: function (_name, _configurations) {
        if (typeof _name != 'string' || _name === '') {
            throw 'The first parmeter to create a pseudo-model module, is the name.'
        }
        let _pseudo = {};
        let _table = pluralize(_name.toLowerCase());
        let _primary = 'id';
        let _autoincrements = true;
        let _attributes = [];
        let _hidden = [];
        if (typeof _configurations == 'object' && !Array.isArray(_configurations)) {
            if (typeof _configurations.table !== 'undefined') {
                _table = _configurations.table;
            }
            if (typeof _configurations.primary !== 'undefined') {
                _primary = _configurations.primary;
            }
            if (typeof _configurations.autoincrements !== 'undefined') {
                _autoincrements = _configurations.autoincrements;
            }
            if (typeof _configurations.hidden !== 'undefined') {
                _hidden = _configurations.hidden;
            }
            if (!Array.isArray(_configurations.attributes)) {
                throw 'The attributes property must be an Array.';
            }
            if (_configurations.attributes.length === 0) {
                throw 'The attributes property must have at least one item.';
            }
            _attributes = _configurations.attributes;
            if(!_autoincrements) {
                _attributes.push(_primary);
            }
            _pseudo[_primary] = null;
            for (let _attribute of _attributes.concat(_hidden)) {
                _pseudo[_attribute] = null;
            }
        } else {
            throw 'Object required as configuration parameter to create pseudo-model module.'
        }
        return function () {
            return {
                ..._pseudo,
                parseObject: function(_object) {
                    return {
                        ...this,
                        ..._object
                    }
                },
                parseString: function(_string) {
                    return {
                        ...this,
                        ...JSON.parse(_object)
                    }
                },
                toString: function () {
                    if (_hidden.length > 0) {
                        let _copy = JSON.parse(JSON.stringify(this));
                        for( let _hidde of _hidden) {
                            _copy[_hidde] = undefined;
                        }
                        return JSON.stringify(_copy);
                    } else {
                        return JSON.stringify(this);
                    }
                },
                save: async function () {
                    let statement = await this.saveStatement().go().then((result) => {
                        if (typeof result.insertId != 'undefined' && result.insertId !== 0) {
                            this[_primary] = result.insertId;
                            return this;
                        } else if(typeof result.affectedRows != 'undefined' && result.affectedRows !== 0) {
                            return this;
                        } else {
                            return null;
                        }
                    }).catch((error) => {
                        return null;
                    });
                    return statement;
                },
                saveStatement: function () {
                    let statement = null;
                    if(this[_primary] === null) {
                        if(_autoincrements){
                            statement = nsqlize.insertInto(_table, _attributes.concat(_hidden)).values(..._attributes.concat(_hidden).map((_attribute) => { return this[_attribute] }));
                        } else {
                            statement = nsqlize.insertInto(_table, [_primary].concat(_attributes.concat(_hidden))).values(...[_primary].concat(_attributes.concat(_hidden)).map((_attribute) => { return this[_attribute] }));
                        }                        
                    } else {
                        statement = nsqlize.update(_table).set(JSON.parse(JSON.stringify(this))).where([_primary, '=', this[_primary]]);
                    }
                    return statement;
                },
                findOrFail: async function (_primaryKey) {
                    let statement = await this.findStatement(_primaryKey).go().then((result) => {
                        if(result.length > 0) {
                            return this.parseObject(result[0]);
                        } else {
                            throw 'Not found exeption.';
                        }
                    }).catch((err) => {
                        throw 'Not found exeption.';
                    });
                    return statement;
                },
                find: async function (_primaryKey) {
                    let statement = await this.findStatement(_primaryKey).go().then((result) => {
                        if(result.length > 0) {
                            return this.parseObject(result[0]);
                        } else {
                            return null;
                        }
                    }).catch((err) => {
                        return null;
                    });
                    return statement;
                },
                findStatement: function (_primaryKey) {
                    let statement = nsqlize.select(...([_primary].concat(_attributes.concat(_hidden)))).from(_table).where([_primary, '=', _primaryKey]).limit(1);
                    // console.log(statement);
                    return statement;
                },
                where: async function (..._conditions) {
                    let statement = nsqlize.select(...(_attributes.concat(_hidden))).from(_table).where(..._conditions);
                    // console.log(JSON.stringify(statement));
                    return statement;
                },
                whereStatement: function (..._conditions) {
                    let statement = nsqlize.select(...(_attributes.concat(_hidden))).from(_table).where(..._conditions);
                    // console.log(JSON.stringify(statement));
                    return statement;
                },
                delete: async function () {
                    let statement = await this.deleteStatement().go().then((result) => {
                        if(result.affectedRows >= 1) {
                            return result.affectedRows;
                        } else {
                            return null;
                        }
                    }).catch((error) => {
                        return null;
                    });
                    return statement;
                },
                deleteStatement: function () {
                    let statement = nsqlize.deleteFrom(_table).where([_primary, '=', this[_primary]]).limit(1);
                    return statement;
                }
            };
        }
    }
}