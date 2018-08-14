'use strict';

module.exports = router => {

};
/*
const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const config = require('./config.json');
const register = require('./functions/register');
const login = require('./functions/login');
const users = require('./functions/users');
const beacons = require('./functions/ibeacons');
const locations = require("./functions/locations");

module.exports = router => {

    router.get('/users', (req, res) => {

        users.allUsers()
            .then(result =>  {
                res.status(result.status);
                res.send(result.message);
            })

            .catch(err =>{
                res.status(err.status).json({message: err.message});
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

            register.registerUser(name, surname, username, email, detail, password)
                .then(result => {
                    res.setHeader('Location', '/users/'+email);
                    res.status(result.status).json({ message: result.message });

                })
                .catch(err => {
                    res.status(err.status).json({ message: err.message })
                });

        }

    });

    /!*router.post('/users/authenticate', (req, res) => {

        login.loginUser(credentials.name, credentials.pass)

            .then(result => {

                const token = jwt.sign(result, config.secret, { expiresIn: 1440 });            
                res.status(result.status).json({ message: result.message, token: token });

            })

            .catch(err => res.status(err.status).json({ message: err.message }));

    });*!/

    router.post('/users/authenticate', (req, res) => {

        const credentials = auth(req);

        if (!credentials) {

            res.status(400).json({ message: 'Invalid Request !' });

        } else {

            login.loginUser(credentials.name, credentials.pass)

                .then(result => {

                    const token = jwt.sign(result, config.secret, { expiresIn: 1440 });
                    res.status(result.status).json({ message: result.message, token: token });

                })

                .catch(err => res.status(err.status).json({ message: err.message }));
        }
    });

};*/
