'use strict';

const MongoClient = require('mongodb').MongoClient;
const objId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');

const url = "mongodb://localhost:27017/monioo-beacon";

let dbo;

MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
    if (err) throw err;
    dbo = db.db("monioo-beacon");
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.allUsers = () =>

    new Promise((resolve, reject) => {

        dbo.collection('users').find({}).toArray()
            .then(users => {
                if (users.length === 0) {

                    reject({status: 204, message: "Herhangi bir kullanıcı bulunamadı"});

                } else {
                    resolve({status: 200, message: JSON.stringify(users)});
                }
            })

            .catch(() => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.usersCount = () =>

    new Promise((resolve, reject) => {

        dbo.collection('users').count({})
            .then(userscount => {

                if (userscount === undefined) {

                    reject({status: 204, message: "Herhangi bir kullanıcı bulunamadı"});

                } else {
                    resolve({status: 200, message: JSON.stringify(userscount)});
                }
            })

            .catch(() => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.loginUser = (username, password) =>

    new Promise((resolve, reject) => {

        dbo.collection('users').findOne({username: username})

            .then(user => {

                if (user === null) {

                    reject({status: 404, message: 'Kullanıcı bulunamadı !'});

                } else {

                    const hashed_password = user.hashed_password;

                    if (bcrypt.compareSync(password, hashed_password)) {

                        resolve({
                            status: 200, message: {
                                name: user.name, surname: user.surname,
                                username: user.username, detail: user.detail, email: user.email
                            }
                        });

                    } else {

                        reject({status: 401, message: 'Yanlış Şifre !'});
                    }

                }
            })
            .catch(() => {

                reject({status: 500, message: 'İç Sunucu Hatası !'})

            })
    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.registerUser = (name, surname, username, email, detail, password) =>

    new Promise((resolve, reject) => {

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUser = {
            name: name,
            surname: surname,
            username: username,
            email: email,
            detail: detail,
            hashed_password: hash,
            created_at: new Date()
        };

        dbo.collection('users').insertOne(newUser)

            .then(() => resolve({status: 201, message: ' Kullanıcı Kayıt Edildi :) '}))

            .catch(err => {

                if (err.code === 11000) {

                    reject({status: 409, message: 'Kullanıcı zaten kayıt olmuş!'});

                } else {

                    reject({status: 500, message: 'İç Sunucu Hatası !'});
                }
            });
    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.updateUserByUsername = (username) =>
    new Promise((resolve, reject) => {

        dbo.collection('users').updateOne({username: username})
            .then(updateuser => {

                if (updateuser === undefined) {
                    reject({status: 204, message: "Herhangi bir kullanıcı güncellenmedi"});

                } else {
                    resolve({status: 200, message: JSON.stringify(updateuser)});
                }
            })

            .catch(() => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.deleteUserByUsername = (username) =>
    new Promise((resolve, reject) => {

        dbo.collection('users').deleteOne({username: username})
            .then(deluser => {

                if (deluser === undefined) {
                    reject({status: 204, message: "Herhangi bir kullanıcı silinemedi"});

                } else {
                    resolve({status: 200, message: JSON.stringify(deluser)});
                }
            })

            .catch(() => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.findUserLocation = (username) =>
    new Promise((resolve, reject) => {

        dbo.collection('users').aggregate([
            {$match: {'username': username}},
            {
                $lookup: {
                    from: "userlocation",
                    localField: "_id",
                    foreignField: "uid",
                    as: "userlocation"
                }
            },
            {
                $unwind: "$userlocation"
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "userlocation.lid",
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
                    reject({status: 204, message: "Herhangi bir Kullanıcı Lokasyonu bulunamadı"});

                } else {
                    resolve({status: 200, message: userlocations});
                }
            })
            .catch((err) => {
                reject({status: 500, message: 'İç Sunucu Hatası !'});
            });

    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.deleteUserLocation = (uid, lid) =>
    new Promise((resolve, reject) => {

        dbo.collection('userlocation').deleteOne({uid: objId(uid), lid: objId(lid)})
            .then(deluserlocation => {
                if (deluserlocation.deletedCount === 0) {
                    reject({status: 204, message: "Herhangi bir kullanıcı lokasyonu silinemedi"});

                } else {
                    resolve({status: 200, message: JSON.stringify("Silindi")});
                }
            })

            .catch(() => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.findUserBeacon = (username) =>
    new Promise((resolve, reject) => {
        var ibeacons = [];
        dbo.collection('users').aggregate([
            {$match: {'username': username}},
            {
                $lookup: {
                    from: "userlocation",
                    localField: "_id",
                    foreignField: "uid",
                    as: "userlocation"
                }
            },
            {
                $unwind: "$userlocation"
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "userlocation.lid",
                    foreignField: "_id",
                    as: "locationsonuc"
                }
            },
            {
                $unwind: "$locationsonuc"
            },
            {
                $lookup: {
                    from: "beacons",
                    localField: "locationsonuc._id",
                    foreignField: "lid",
                    as: "beaconsonuc",
                }
            },
            {
                $project:
                    {
                        beaconsonuc: 1
                    }
            }
        ]).sort({created_at: -1}).toArray()
            .then(userbeacons => {
                if (userbeacons === undefined) {
                    reject({status: 204, message: "Herhangi bir Kullanıcı Beacon Eşleşmesi yapılamadı"});

                } else {
                    for(var i=0; i<userbeacons.length; i++){
                        for (var k=0; k<userbeacons[i].beaconsonuc.length; k++){
                            ibeacons.push(userbeacons[i].beaconsonuc[k]);
                        }
                    }
                    resolve({status: 200, message: ibeacons});

                }
            })
            .catch((err) => {
                console.log("BEACON HATASI : " + err);
                reject({status: 500, message: 'İç Sunucu Hatası !'});
            })

    });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.addUserBeaconRecord = (username, uuid, logtype) =>
    new Promise((resolve, reject) => {
        var ibeacons = [];
        dbo.collection('users').aggregate([
            {$match: {'username': username}},
            {
                $lookup: {
                    from: "userlocation",
                    localField: "_id",
                    foreignField: "uid",
                    as: "userlocation"
                }
            },
            {
                $unwind: "$userlocation"
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "userlocation.lid",
                    foreignField: "_id",
                    as: "locationsonuc"
                }
            },
            {
                $unwind: "$locationsonuc"
            },
            {
                $lookup: {
                    from: "beacons",
                    localField: "locationsonuc._id",
                    foreignField: "lid",
                    as: "beaconsonuc",
                }
            },
            {
                $match: {'beaconsonuc.uuid': uuid}
            },
            {
                $unwind: "$beaconsonuc"
            },
            {
                $match: {'beaconsonuc.uuid': uuid}
            }

        ]).sort({created_at: -1}).limit(1).toArray()
            .then(userbeacons => {
                if (userbeacons === undefined) {
                    reject({status: 204, message: "Herhangi bir Kullanıcı Beacon Eşleşmesi yapılamadı"});

                } else {
                    dbo.collection('entrylog').find({}).sort({created_at: -1}).limit(1).toArray()
                        .then(result => {
                            if (result.length === 0) {
                                const newLog = {
                                    name: userbeacons[0].name,
                                    surname: userbeacons[0].surname,
                                    username: userbeacons[0].username,
                                    email: userbeacons[0].email,
                                    uuid: userbeacons[0].beaconsonuc.uuid,
                                    lid: userbeacons[0].locationsonuc._id,
                                    type: "Giriş",
                                    created_at: new Date()
                                };
                                dbo.collection('entrylog').insertOne(newLog)
                                    .then(result => {
                                        resolve({status: 200, message: logtype + " İşlemi Başarılı"});
                                        console.log("yeni kayıt eklendi");
                                    })
                                    .catch((err) => reject({status: 500, message: err}));
                            }
                            else if (result[0].type === logtype) {
                                const newLog = {
                                    name: userbeacons[0].name,
                                    surname: userbeacons[0].surname,
                                    username: userbeacons[0].username,
                                    email: userbeacons[0].email,
                                    uuid: userbeacons[0].beaconsonuc.uuid,
                                    lid: userbeacons[0].locationsonuc._id,
                                    type: logtype,
                                    created_at: new Date()
                                };
                                dbo.collection('entrylog').deleteOne({_id: objId(result[0]._id)})
                                    .then(result => {
                                        console.log("önceki kayıt silindi");
                                    })
                                    .catch((err) => reject({status: 500, message: err}));
                                dbo.collection('entrylog').insertOne(newLog)
                                    .then(result => {
                                        resolve({status: 200, message: logtype + " İşlem Başarılı"});
                                        console.log("yeni kayıt eklendi");
                                    })
                                    .catch((err) => reject({status: 500, message: err}));
                            } else {
                                const newLog = {
                                    name: userbeacons[0].name,
                                    surname: userbeacons[0].surname,
                                    username: userbeacons[0].username,
                                    email: userbeacons[0].email,
                                    uuid: userbeacons[0].beaconsonuc.uuid,
                                    lid: userbeacons[0].locationsonuc._id,
                                    type: logtype,
                                    created_at: new Date()
                                };
                                dbo.collection('entrylog').insertOne(newLog)
                                    .then(result => {
                                        resolve({status: 200, message: logtype + " İşlem Başarılı"});
                                        console.log("giriş kaydı eklendi");
                                    })
                                    .catch((err) => reject({status: 500, message: err}));
                            }
                        });
                }
            })
            .catch((err) => {
                console.log("BEACON HATASI : " + err);
                reject({status: 500, message: 'İç Sunucu Hatası !'});
            })

    });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.findLogCount = () =>
    new Promise((resolve, reject) => {

        dbo.collection('entrylog').aggregate([
            {
                $match: {
                    'name': {$regex: '.*' + filter.name + '.*'}, 'surname': {$regex: '.*' + filter.surname + '.*'},
                    'username': {$regex: '.*' + filter.username + '.*'}, 'email': {$regex: '.*' + filter.email + '.*'}
                }
            }
        ]).count({})
            .then(count => {
                resolve({status: 200, message: JSON.stringify(count)});
            })
            .catch(() => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.findLogRecords = (pagenum, filter) =>

    new Promise((resolve, reject) => {

        let totalfilteredcount;

        dbo.collection('entrylog').aggregate([
            {
                $match: {
                    'name': {$regex: '.*' + filter.name + '.*'}, 'surname': {$regex: '.*' + filter.surname + '.*'},
                    'username': {$regex: '.*' + filter.username + '.*'}, 'email': {$regex: '.*' + filter.email + '.*'},
                    'type': {$regex: '.*' + filter.type + '.*'}
                }
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "lid",
                    foreignField: "_id",
                    as: "userlocation"
                }
            },
            {
                $match: {
                    'userlocation.name': {$regex: '.*' + filter.userlocation.name + '.*'}
                }
            }
        ]).toArray()
            .then(loglist => {
                if (loglist === undefined) {
                    reject({status: 204, message: "Herhangi bir kullanıcı silinemedi"});

                } else {
                    return totalfilteredcount = loglist.length;
                }
            })
            .then(totalcount => {

                dbo.collection('entrylog').aggregate([
                    {
                        $match: {
                            'name': {$regex: '.*' + filter.name + '.*'}, 'surname': {$regex: '.*' + filter.surname + '.*'},
                            'username': {$regex: '.*' + filter.username + '.*'}, 'email': {$regex: '.*' + filter.email + '.*'},
                            'type': {$regex: '.*' + filter.type + '.*'}
                        }
                    },
                    {
                        $lookup: {
                            from: "locations",
                            localField: "lid",
                            foreignField: "_id",
                            as: "userlocation"
                        }
                    },
                    {
                        $match: {
                            'userlocation.name': {$regex: '.*' + filter.userlocation.name + '.*'}
                        }
                    }
                ]).sort({created_at: 1}).skip(pagenum - 5).limit(5).toArray()
                    .then(loglist => {
                        if (loglist === undefined) {
                            reject({status: 204, message: "Herhangi bir kullanıcı silinemedi"});

                        } else {
                            resolve({ status: 200, message: {result: loglist, count: JSON.stringify(totalcount) } });
                        }
                    })

            })
            .catch((err) => {
                reject({status: 500, message: "İç Sunucu Hatası"});
            });

    });



