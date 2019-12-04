const mysql = require('mysql');

const config = require('../config/sql');
const pool = mysql.createPool(config);
let services = {
  query(sql, values) {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if(err){
          reject(err)
        }
        connection.query(sql,values,(err, rows) => {
          if(err){
            reject (err)
          }else {
            resolve(rows)
          }
          connection.release();
        })
      })
    })
  }
}

module.exports = services;