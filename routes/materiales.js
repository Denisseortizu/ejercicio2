var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');
 

router.get('/', function(req, res, next) {
    dbConn.query('SELECT * FROM materiales ORDER BY id DESC', function(err, rows) {
        if(err) {
            req.flash('error', err);
            res.render('materiales', { data: '' });
        } else {
            res.render('materiales', { data: rows });
        }
    });
});

// Display página para agregar material
router.get('/add', function(req, res, next) {
    // Renderizar a add.ejs
    res.render('materiales/add', {
        nombre: '',
        unidad_de_medida: '',
        precio: '',
        stock: ''
    });
});

//Insertar Crear material
router.post('/add', function(req, res, next) {
    let nombre = req.body.nombre;
    let unidad_de_medida = req.body.unidad_de_medida;
    let precio = req.body.precio;
    let stock = req.body.stock;
    let errors = false;

    if(nombre.length === 0 || unidad_de_medida.length === 0 || precio.length === 0 || stock.length === 0) {
        errors = true;
        // Establecer mensaje flash
        req.flash('error', "Porfavor ingresa nombre, unidad de medida, precio, y stock");
        // Renderizar a add.ejs con mensaje flash
        res.render('materiales/add', {
            nombre: nombre,
            unidad_de_medida: unidad_de_medida,
            precio: precio,
            stock: stock
        });
    }
    if(!errors) {
        var form_data = {
            nombre: nombre,
            unidad_de_medida: unidad_de_medida,
            precio: precio,
            stock: stock
        };

        // Consulta de inserción
        dbConn.query('INSERT INTO materiales SET ?', form_data, function(err, result) {
            if (err) {
                req.flash('error', err);
                // Renderizar a add.ejs
                res.render('materiales/add', {
                    nombre: form_data.nombre,
                    unidad_de_medida: form_data.unidad_de_medida,
                    precio: form_data.precio,
                    stock: form_data.stock
                });
            } else {
                req.flash('success', 'Material successfully added');
                res.redirect('/materiales');
            }
        });
    }
});


// Editar
router.get('/edit/(:id)', function(req, res, next) {
    let id = req.params.id;
    dbConn.query('SELECT * FROM materiales WHERE id = ?', id, function(err, rows, fields) {
        if(err) throw err;
        if (rows.length <= 0) {
            req.flash('error', 'Material not found with id = ' + id);
            res.redirect('/materiales');
        }
        else {
            res.render('materiales/edit', {
                title: 'Edit Material',
                id: rows[0].id,
                nombre: rows[0].nombre,
                unidad_de_medida: rows[0].unidad_de_medida,
                precio: rows[0].precio,
                stock: rows[0].stock
            });
        }
    });
});

router.get('/search', function(req, res, next) {
    let search = req.query.search;
    dbConn.query(`SELECT * FROM materiales WHERE nombre LIKE '%${search}%' ORDER BY id DESC`, function(err, rows) {
        if(err) {
            req.flash('error', err);
            res.render('materiales', { data: '' });
        } else {
            res.render('materiales', { data: rows, search: search });
        }
    });
});

//Actualizar la info de materiales
router.post('/update/:id', function(req, res, next) {
    let id = req.params.id;
    let nombre = req.body.nombre;
    let unidad_de_medida = req.body.unidad_de_medida;
    let precio = req.body.precio;
    let stock = req.body.stock;
    let errors = false;

    if(nombre.length === 0 || unidad_de_medida.length === 0 || precio.length === 0 || stock.length === 0) {
        errors = true;
        req.flash('error', "Porfavor ingresa nombre, unidad de medida, precio, y stock");
        res.render('materiales/edit', {
            id: req.params.id,
            nombre: nombre,
            unidad_de_medida: unidad_de_medida,
            precio: precio,
            stock: stock
        });
    }
    if(!errors) {
        var form_data = {
            nombre: nombre,
            unidad_de_medida: unidad_de_medida,
            precio: precio,
            stock: stock
        };
        dbConn.query('UPDATE materiales SET ? WHERE id = ?', [form_data, id], function(err, result) {
            if (err) {
                req.flash('error', err);
                // Renderizar a edit.ejs
                res.render('materiales/edit', {
                    id: req.params.id,
                    nombre: form_data.nombre,
                    unidad_de_medida: form_data.unidad_de_medida,
                    precio: form_data.precio,
                    stock: form_data.stock
                });
            } else {
                req.flash('success', 'Material actualizado exitosamente');
                res.redirect('/materiales');
            }
        });
    }
});

// Eliminación de material solo si no tiene existencias
router.get('/delete/(:id)', function(req, res, next) {
    let id = req.params.id;
    // Verificar si el material tiene existencias en stock
    dbConn.query('SELECT stock FROM materiales WHERE id = ?', id, function(err, rows) {
        if (err) {
            req.flash('error', err);
            res.redirect('/materiales');
        } else {
            if (rows.length > 0) {
                let stock = rows[0].stock;

                // Si el material no tiene existencias en stock, se puede eliminar
                if (stock === 0) {
                    dbConn.query('DELETE FROM materiales WHERE id = ?', id, function(err, result) {
                        if (err) {
                            req.flash('error', err);
                        } else {
                            req.flash('success', 'Material eliminado exitosamente! ID = ' + id);
                        }
                        res.redirect('/materiales');
                    });
                } else {
                    req.flash('error', 'El material no puede ser eliminado. Aún en stock.');
                    res.redirect('/materiales');
                }
            } else {
                req.flash('error', 'No se encontro material con ID = ' + id);
                res.redirect('/materiales');
            }
        }
    });
});



module.exports = router;