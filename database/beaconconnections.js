'use strict';

const MongoClient = require('mongodb').MongoClient;
const objId = require('mongodb').ObjectId;
const url = "mongodb://localhost:27017/monioo-beacon";

let dbo;

MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    dbo = db.db("monioo-beacon");
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.allIBeacons = () =>

    new Promise((resolve, reject) => {

        dbo.collection('beacons').aggregate([
            {
                $lookup: {
                    from: "locations",
                    localField: "lid",
                    foreignField: "_id",
                    as: "bloc"
                }
            }
        ]).toArray()
            .then(ibeacons => {
                if (ibeacons.length === 0) {

                    reject({status: 204, message: "Herhangi bir ibeacon bulunamadı"});

                } else {
                    resolve({status: 200, message: JSON.stringify(ibeacons)});
                }
            })
            .catch(err => {
                reject({status: 500, message: err});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.iBeaconsCount = () =>

    new Promise((resolve, reject) => {

        dbo.collection('beacons').count({})
            .then(ibeacons => {
                if (ibeacons === undefined) {

                    resolve({status: 200, message: "0"});

                } else {
                    resolve({status: 200, message: JSON.stringify(ibeacons)});
                }
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.iBeaconsAdd = (uuid, name, detail, lid) =>

    new Promise((resolve, reject) => {

        const newBeacon = {
            uuid 			: uuid,
            name			: name,
            detail			: detail,
            lid             : objId(lid),
            created_at		: new Date()
        };

        dbo.collection('beacons').insertOne( newBeacon   )
            .then( () => resolve({ status: 201, message: ' iBeacon Kayıt Edildi :) ' }) )

            .catch(err => {

                if (err.code === 11000) {

                    reject({ status: 409, message: 'Beacon zaten kayıt olmuş!' });

                } else {

                    reject({ status: 500, message: 'Sunucu Hatası !' });
                }
            });

    });
// todo update block yapılacak
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.iBeaconsDelete = (uuid) =>

    new Promise((resolve, reject) => {

        dbo.collection('beacons').deleteOne( {'uuid': uuid} )
            .then(ibeacons => {
                if (ibeacons === undefined) {

                    resolve({status: 200, message: "0"});

                } else {
                    resolve({status: 200, message: JSON.stringify(ibeacons)});
                }
            })
            .catch(err =>{
                reject({status: 500, message: err});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.findBeaconLocation = (id) =>
    new Promise((resolve, reject) => {

        dbo.collection('beacons').aggregate([
            { $match: { '_id' : objId(id) } },
            {
                $lookup: {
                    from: "beaconlocation",
                    localField: "_id",
                    foreignField: "bid",
                    as: "beaconlocation"
                }
            },
            {
                $unwind: "$beaconlocation"
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "beaconlocation.lid",
                    foreignField: "_id",
                    as: "sonuc"
                }
            },
            {
                $project:
                    {
                        sonuc: 1
                    }
            }
        ]).toArray()

            .then(beaconlocations => {
                if (beaconlocations === undefined) {
                    reject({status: 204, message: "Beacon için herhangi bir lokasyon bulunamadı."});

                } else {
                    resolve({status: 200, message: beaconlocations});
                }
            })
            .catch( () =>
                reject({status: 500, message: 'İç Sunucu Hatası !'})
            )

    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////

/*exports.deleteBeaconLocation = (bid, lid) =>
    new Promise((resolve, reject) => {

        dbo.collection('beacons').updateOne({ _id: objId(bid) }, { $set:{ lid: }})
            .then(delbeaconlocation => {
                if (delbeaconlocation.deletedCount === 0) {
                    reject({status: 204, message: "Herhangi bir beacon lokasyonu silinemedi"});

                } else {
                    resolve({status: 200, message: JSON.stringify("Silindi")});
                }
            })

            .catch( () => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
