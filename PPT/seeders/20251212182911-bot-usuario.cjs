'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuarios', [{
      id: 100, 
      nombre: 'CPU',
      email: 'cpu@ppt.com',
      password: 'bot100', 
      partidas_jugadas: 0,
      partidas_ganadas: 0
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { id: 100 }, {});
  }
};
