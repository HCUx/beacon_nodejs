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

exports.allLocations = () =>

    new Promise((resolve, reject) => {

        dbo.collection('locations').find({}).toArray()
            .then(locations => {
                if (locations.length === 0) {

                    reject({status: 204, message: "Herhangi bir lokasyon bulunamadı"});

                } else {
                    resolve({status: 200, message: JSON.stringify(locations)});
                }
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.locationsCount = () =>

    new Promise((resolve, reject) => {

        dbo.collection('locations').count({})
            .then(locations => {
                if (locations === undefined) {

                    resolve({status: 200, message: "0"});

                } else {
                    resolve({status: 200, message: JSON.stringify(locations)});
                }
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.locationAdd = (name, detail) =>

    new Promise((resolve, reject) => {

        const newLocation = {
            name			: name,
            detail			: detail,
            created_at		: new Date()
        };

        dbo.collection('locations').insertOne(newLocation)
            .then( () => resolve({ status: 201, message: ' Lokasyon Kayıt Edildi :) ' }) )

            .catch(err => {

                if (err.code === 11000) {

                    reject({ status: 409, message: 'Lokasyon zaten kayıt olmuş!' });

                } else {

                    reject({ status: 500, message: 'Sunucu Hatası !' });
                }
            });

    });

// todo update block yapılacak
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.locationDelete = (id) =>

    new Promise((resolve, reject) => {

        dbo.collection('locations').deleteOne( {'_id': objId(id)} )
            .then(locations => {
                if (locations === undefined) {

                    resolve({status: 200, message: "0"});

                } else {
                    resolve({status: 200, message: JSON.stringify(locations)});
                }
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.locationAddtoUser = (uid, lid) =>

    new Promise((resolve, reject) => {

        dbo.collection('userlocation').insertOne( { uid: objId(uid), lid: objId(lid)} )
            .then( () => resolve({ status: 201, message: ' Kullanıcı Lokasyonu Kayıt Edildi :) ' }) )

            .catch(err => {
                if (err.code === 11000) {

                    reject({ status: 409, message: 'Kullanıcı Lokasyonu zaten kayıt olmuş!' });

                } else {

                    reject({ status: 500, message: 'Sunucu Hatası !' });
                }
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.locationAddtoBeacon = (bid, lid) =>

    new Promise((resolve, reject) => {

        dbo.collection('beacons').updateOne( { _id: objId(bid) }, { $set:{ lid: objId(lid)}} )
            .then( () => resolve({ status: 201, message: ' Beacon Lokasyonu Kayıt Edildi :) ' }) )

            .catch(err => {
                if (err.code === 11000) {

                    reject({ status: 409, message: 'Beacon Lokasyonu zaten kayıt olmuş!' });

                } else {

                    reject({ status: 500, message: 'Sunucu Hatası !' });
                }
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.findLocationUser = (id) =>
    new Promise((resolve, reject) => {

        dbo.collection('locations').aggregate([
            { $match: { '_id' : objId(id) } },
            {
                $lookup: {
                    from: "userlocation",
                    localField: "_id",
                    foreignField: "lid",
                    as: "userlocation"
                }
            },
            {
                $unwind: "$userlocation"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userlocation.uid",
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

            .then(userlocations => {
                if (userlocations === undefined) {
                    reject({status: 204, message: "Lokasyon için herhangi bir kullanıcı bulunamadı."});

                } else {
                    resolve({status: 200, message: userlocations});
                }
            })
            .catch( () =>
                reject({status: 500, message: 'İç Sunucu Hatası !'})
            )

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.findLocationBeacon = (id) =>

    new Promise((resolve, reject) => {
        console.log(id);
        dbo.collection('beacons').find( { lid: objId(id) } ).toArray()
            .then(locationibeacons => {
                if (locationibeacons.length === 0) {

                    reject({status: 204, message: "Herhangi bir ibeacon bulunamadı"});

                } else {
                    resolve({status: 200, message: locationibeacons});
                }
            })
            .catch(err => {
                reject({status: 500, message: err});
            });

    });

/*
exports.findLocationBeacon = (id) =>
    new Promise((resolve, reject) => {

        dbo.collection('locations').aggregate([
            { $match: { '_id' : objId(id) } },
            {
                $lookup: {
                    from: "beaconlocation",
                    localField: "_id",
                    foreignField: "lid",
                    as: "beaconlocation"
                }
            },
            {
                $unwind: "$beaconlocation"
            },
            {
                $lookup: {
                    from: "beacons",
                    localField: "beaconlocation.bid",
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
                    reject({status: 204, message: "Lokasyon için herhangi bir beacon bulunamadı."});

                } else {
                    resolve({status: 200, message: beaconlocations});
                }
            })
            .catch( () =>
                reject({status: 500, message: 'İç Sunucu Hatası !'})
            )

    });*/
