import * as Datastore from 'nedb';

export abstract class DatabaseService {

    constructor(dbFileName: string) {
        this.db = new Datastore({
            filename: dbFileName,
            autoload: true
        });
    }

    public db: any;

    insert(item: any) {
        return new Promise((resolve, reject) => {
            return this.db.insert(item, ((err: any, newItem: any) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(newItem);
                }
            }))
        });
    }

    findAll() {
        return new Promise((resolve, reject) => {
            return this.db.find({}, ((err: any, items: any) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(items);
                }
            }));
        })
    }

    remove(id: any) {
        return new Promise((resolve, reject) => {
            return this.db.remove({ _id: id }, {}, ((err: any, numRemoved: any) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(numRemoved);
                }
            }));
        })
    }

    removeAll() {
        return new Promise((resolve, reject) => {
            return this.db.remove({}, { multi: true }, ((err: any, numRemoved: any) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(numRemoved);
                }
            }));
        })
    }

    find(condition: any) {
        return new Promise((resolve, reject) => {
            return this.db.find(condition, ((err: any, items: any) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(items);
                }
            }));
        })
    }

    update(item: any, nuevo: any) {
        return new Promise((resolve, reject) => {
            return this.db.update({ _id: item._id }, { $set: { name: nuevo } }, ((err: any, NumReplaced: any) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(NumReplaced);
                }
            }));
        })
    }
}