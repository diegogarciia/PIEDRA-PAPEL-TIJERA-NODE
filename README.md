Piedra, papel, tijera.

Realiza un servicio en Node que permita jugar contra la máquina o contra otro humano a piedra,
papel, tijera.
Se debe jugar al mejor de cinco tiradas (el que gane 3, gana la partida). Cada usuario solo puede
tener una partida abierta, hasta que no se acabe no se permite comenzar otra.
Los servicios proporcionados serán:
- Registro y login
- Unirse a partida. Se mostrarán en tiempo real las partidas disponibles por si me quiero unir.
- Crear partida con humano, quedará esperando jugador.
- Crear partida con máquina. Empezará la partida inmediatamente.
- Jugar. En tiempo real veré la jugada del oponente.
- Abandonar partida, se da por perdida, claro.
- Ranking de jugadores. En la pantalla principal saldrá un ranking con los jugadores que mejor
porcentaje de partidas jugadas/ganadas tienen. Este ranking se actualiza en tiempo real con
los resultados que otros jugadores vayan obteniendo.
Se debe realizar un control de errores adecuado en parámetros.
El acceso a la base de datos se realizará con Sequelize.
Es necesario realizar un cliente que permita usar todas las funcionalidades de la API, es obligatorio;
lo que no es obligatorio es que sea bonito pero sí funcional.
A modo de recordatorio:
- Piedra le gana a la tijera.
- Tijera gana al papel.
- Papel le gana a la piedra.
