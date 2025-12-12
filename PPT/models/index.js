import Usuario from './Usuario.js';
import Partida from './Partida.js';

Usuario.hasMany(Partida, { foreignKey: 'id_jugador1', as: 'partidasJ1' });
Usuario.hasMany(Partida, { foreignKey: 'id_jugador2', as: 'partidasJ2' });

Partida.belongsTo(Usuario, { foreignKey: 'id_jugador1', as: 'j1' });
Partida.belongsTo(Usuario, { foreignKey: 'id_jugador2', as: 'j2' });

Partida.belongsTo(Usuario, { foreignKey: 'ganador_id', as: 'ganador' });

export { Usuario, Partida };