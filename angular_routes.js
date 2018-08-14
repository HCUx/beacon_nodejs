'use strict';

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const config = require('./config.json');
const users = require('./database/userconnections');
const beacons = require('./database/beaconconnections');
const locations = require('./database/locationconnections');
const commonconn = require('./database/commonconnections');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  AUTH BLOCK **********************************////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router => {

    router.post('/users/authenticate', (req, res) => {

        const credentials = auth(req);

        if (!credentials) {

            res.status(400).json({ message: 'Invalid Request !' });

        } else {

            /** @namespace credentials.pass */
            /** @namespace credentials.name */
            users.loginUser(credentials.name, credentials.pass)

                .then(result => {

                    const token = jwt.sign(result, config.secret, { expiresIn: 1440 });
                    res.status(result.status).json({ fullname: result.message.name + ' ' + result.message.surname, username: result.message.username,
                                                     token: token, detail: result.message.detail, email: result.message.email });
                })
                .catch(err => {
                    res.status(err.status).json({ message: err.message })
                });
        }
    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  LIST BLOCK **********************************////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    router.get('/users', (req, res) => {

        users.allUsers()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status);
                res.end({message: err.message});
            });

    });

    router.get('/ibeacons', (req, res) => {

        beacons.allIBeacons()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status).json({message: err.message});
            });

    });

    router.get('/locations', (req, res) => {

        locations.allLocations()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status).json({message: err.message});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  COUNT BLOCK **********************************///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    router.get('/userscount', (req, res) => {

        users.usersCount()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status).json({message: err.message});
            });

    });

    router.get('/ibeaconscount', (req, res) => {

        beacons.iBeaconsCount()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status).json({message: err.message});
            });

    });

    router.get('/locationscount', (req, res) => {

        locations.locationsCount()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status).json({message: err.message});
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  ADD BLOCK **********************************/////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    router.post('/users/register', (req, res) => {

        const name = req.body.name;
        const surname = req.body.surname;
        const username = req.body.username;
        const email = req.body.email;
        const detail = req.body.detail;
        const password = req.body.password;

        if (!name || !surname || !username || !email  || !detail || !password ||
            !name.trim() || !surname.trim() || !username.trim() || !email.trim()  || !detail.trim() || !password.trim()) {

            res.status(400).json({message: 'Invalid Request !'});

        } else {

            users.registerUser(name, surname, username, email, detail, password)
                .then(result => {
                    res.setHeader('Location', '/users/'+email);
                    res.status(result.status).json({ message: result.message });

                })
                .catch(err => {
                    res.status(err.status).json({ message: err.message })
                });

        }

    });

    router.post('/ibeacons/register', (req, res) => {

        const uuid = req.body.uuid;
        const name = req.body.name;
        const detail = req.body.detail;
        const lid = req.body.lid;

        if (!uuid || !name || !detail || !lid ||
            !uuid.trim() || !name.trim() || !detail.trim() || !lid.trim()  ) {

            res.status(400).json({message: 'Invalid Request !'});

        } else {

            beacons.iBeaconsAdd(uuid, name, detail, lid)
                .then(result => {
                    res.setHeader('Location', '/ibeacons/'+uuid);
                    res.status(result.status).json({ message: result.message });

                })
                .catch(err => {
                    res.status(err.status).json({ message: err.message })
                });

        }

    });

    router.post('/locations/register', (req, res) => {

        const name = req.body.name;
        const detail = req.body.detail;

        if (!name || !detail ||
            !name.trim() || !detail.trim() ) {

            res.status(400).json({message: 'Invalid Request !'});

        } else {

            locations.locationAdd(name, detail)
                .then(result => {
                    res.setHeader('Location', '/locations/'+name);
                    res.status(result.status).json({ message: result.message });

                })
                .catch(err => {
                    res.status(err.status).json({ message: err.message })
                });

        }

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  DELETE BLOCK **********************************//////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    router.delete('/users/:username', (req, res) => {

        const username = req.params.username;

        users.deleteUserByUsername(username)
            .then(result => {
                res.setHeader('User', '/users/'+username);
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

    router.delete('/ibeacons/:uuid', (req, res) => {

        const uuid = req.params.uuid;

        beacons.iBeaconsDelete(uuid)
            .then(result => {
                res.setHeader('IBeaconsDelete', '/ibeacons/'+uuid);
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

    router.delete('/locations/:id', (req, res) => {

        const id = req.params.id;

        locations.locationDelete(id)
            .then(result => {
                res.setHeader('Locations', '/locations/'+id);
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  FOREIGN TABLE LIST BLOCK **********************************//////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    router.get('/finduserlocation/:username', (req, res) => {

        const username = req.params.username;

        users.findUserLocation(username)
            .then(result => {
                res.setHeader('UsersLocation', '/userslocation/'+username);
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

    router.get('/findlocationuser/:id', (req, res) => {

        const id = req.params.id;

        locations.findLocationUser(id)
            .then(result => {
                res.setHeader('LocationUsers', '/locationuser/'+id);
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

    router.get('/findlocationbeacon/:id', (req, res) => {

        const id = req.params.id;

        locations.findLocationBeacon(id)
            .then(result => {
                res.setHeader('LocationBeacon', '/locationbeacon/'+id);
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

    router.get('/findbeaconlocation/:uuid', (req, res) => {

        const uuid = req.params.uuid;

        beacons.findBeaconLocation(uuid)
            .then(result => {
                res.setHeader('BeaconLocation', '/beaconlocation'+uuid);
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  FOREIGN TABLE DELETE BLOCK ****************************************************//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    router.delete('/userlocation/:idstring', (req, res) => {

        let idstring = req.params.idstring.split(":");

        let uid = idstring[0];
        let lid = idstring[1];

        users.deleteUserLocation(uid, lid)
            .then(result => {
                res.setHeader('UserLocationDeleteRequestResult', '/userlocation/basarili');
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message})
            });

    });

    router.get('/locationaddtouser/:idstring', (req, res) => {

        const idarray = req.params.idstring.split(':');
        const uid = idarray[0];
        const lid = idarray[1];

        locations.locationAddtoUser(uid, lid)
            .then(result => {
                res.setHeader('LocationToUsers', '/locationaddtouser/basarili');
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

    router.put('/locationaddtobeacon/:idstring', (req, res) => {

        /** @namespace req.params.idstring */
        const idarray = req.params.idstring.split(':');
        const bid = idarray[0];
        const lid = idarray[1];

        locations.locationAddtoBeacon(bid, lid)
            .then(result => {
                res.setHeader('LocationToBeacon', '/locationaddtobeacon/basarili');
                res.status(result.status).json({ message: result.message });

            })
            .catch(err => {
                res.status(err.status).json({ message: err.message })
            });

    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  BEACON LIST BLOCK ************************************************************//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    router.post('/beacon/beacondata/:username', (req, res) => {

        users.findUserBeacon(req.params.username)
            .then(result => {
                res.status(result.status).json({ beacons: result.message });
            })
            .catch(err => {
                console.log("ROUTE HATASI : "+ err);
                res.status(err.status).json({ message: err.message });
            });
    });

    router.post('/beacon/beacondata', (req, res) => {

        users.addUserBeaconRecord(req.body.username, req.body.uuid, req.body.logtype)
            .then(result => {
                res.status(result.status).json({ message: result.message });
            })
            .catch(err => {
                console.log("ROUTE HATASI : "+ err);
                res.status(err.status).json({ message: err.message });
            });
    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// *********************************  ENTRY LOG BLOCK ************************************************************//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    router.post('/entrycount', (req, res) => {

        users.findLogCount()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status);
                res.end({message: err.message});
            });
    });

    router.post('/entrylog/:pagecount', (req, res) => {


        const pagenum = parseInt(req.params.pagecount, 10) * 5;
        const filter = req.body;

        users.findLogRecords(pagenum, filter)
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                console.log("hata: "+err);
                res.status(err.status);
                res.end({message: err.message});
            });
    });

};



